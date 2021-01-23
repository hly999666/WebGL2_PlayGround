 
const skinVS =/*glsl*/ `#version 300 es
in vec4 a_POSITION;
in vec3 a_NORMAL;
in vec4 a_WEIGHTS_0;
in uvec4 a_JOINTS_0;

uniform mat4 u_projection;
uniform mat4 u_view;
uniform mat4 u_world;
uniform sampler2D u_jointTexture;

out vec3 v_normal;

mat4 getBoneMatrix(uint jointNdx) {
  return mat4(
    texelFetch(u_jointTexture, ivec2(0, jointNdx), 0),
    texelFetch(u_jointTexture, ivec2(1, jointNdx), 0),
    texelFetch(u_jointTexture, ivec2(2, jointNdx), 0),
    texelFetch(u_jointTexture, ivec2(3, jointNdx), 0));
}

void main() {
  mat4 skinMatrix = getBoneMatrix(a_JOINTS_0[0]) * a_WEIGHTS_0[0] +
                    getBoneMatrix(a_JOINTS_0[1]) * a_WEIGHTS_0[1] +
                    getBoneMatrix(a_JOINTS_0[2]) * a_WEIGHTS_0[2] +
                    getBoneMatrix(a_JOINTS_0[3]) * a_WEIGHTS_0[3];
  mat4 world = u_world * skinMatrix;
  gl_Position = u_projection * u_view * world * a_POSITION;
  v_normal = mat3(world) * a_NORMAL;
 
}
`;
const fs = /*glsl*/ `#version 300 es
precision highp float;

in vec3 v_normal;

uniform vec4 u_diffuse;
uniform vec3 u_lightDirection;

out vec4 outColor;

void main () {
  vec3 normal = normalize(v_normal);
  float light = dot(u_lightDirection, normal) * .5 + .5;
  outColor = vec4(u_diffuse.rgb * light, u_diffuse.a);
}
`;
//global webgl context

let gl;
 //Skin for animation
class Skin {
    constructor(joints, inverseBindMatrixData) {
      this.joints = joints;
      this.inverseBindMatrices = [];
      this.jointMatrices = []; 
      this.jointData = new Float32Array(joints.length * 16);
   
      for (let i = 0; i < joints.length; ++i) {
        this.inverseBindMatrices.push(new Float32Array(
            inverseBindMatrixData.buffer,
            inverseBindMatrixData.byteOffset + Float32Array.BYTES_PER_ELEMENT * 16 * i,
            16));
        this.jointMatrices.push(new Float32Array(
            this.jointData.buffer,
            Float32Array.BYTES_PER_ELEMENT * 16 * i,
            16));
      } 
      this.jointTexture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, this.jointTexture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    }
    update(node) {
      const globalWorldInverse = m4.inverse(node.worldMatrix); 
      for (let j = 0; j < this.joints.length; ++j) {
        const joint = this.joints[j];
        const dst = this.jointMatrices[j];
        m4.multiply(globalWorldInverse, joint.worldMatrix, dst);
        m4.multiply(dst, this.inverseBindMatrices[j], dst);
      }
      gl.bindTexture(gl.TEXTURE_2D, this.jointTexture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, 4, this.joints.length, 0,
                    gl.RGBA, gl.FLOAT, this.jointData);
    }
  }

  //Node Local Matrix
  class TRS {
    constructor(position = [0, 0, 0], rotation = [0, 0, 0, 1], scale = [1, 1, 1]) {
      this.position = position;
      this.rotation = rotation;
      this.scale = scale;
    }
    getMatrix(dst) {
      dst = dst || new Float32Array(16);
      m4.compose(this.position, this.rotation, this.scale, dst);
      return dst;
    }
  }
//Scene Graph Node
  class Node {
    constructor(source, name) {
      this.name = name;
      this.source = source;
      this.parent = null;
      this.children = [];
      this.localMatrix = m4.identity();
      this.worldMatrix = m4.identity();
      this.drawables = [];
    }
    setParent(parent) {
      if (this.parent) {
        this.parent._removeChild(this);
        this.parent = null;
      }
      if (parent) {
        parent._addChild(this);
        this.parent = parent;
      }
    }
    updateWorldMatrix(parentWorldMatrix) {
      const source = this.source;
      if (source) {
        source.getMatrix(this.localMatrix);
      }

      if (parentWorldMatrix) { 
        m4.multiply(parentWorldMatrix, this.localMatrix, this.worldMatrix);
      } else { 
        m4.copy(this.localMatrix, this.worldMatrix);
      }
 
      const worldMatrix = this.worldMatrix;
      for (const child of this.children) {
        child.updateWorldMatrix(worldMatrix);
      }
    }
    traverse(fn) {
      fn(this);
      for (const child of this.children) {
        child.traverse(fn);
      }
    }
    _addChild(child) {
      this.children.push(child);
    }
    _removeChild(child) {
      const ndx = this.children.indexOf(child);
      this.children.splice(ndx, 1);
    }
  }

  class SkinRenderer {
    constructor(mesh, skin,programInfo) {
      this.mesh = mesh;
      this.skin = skin;
      this.programInfo=programInfo;
    }
    render(node, projection, view, sharedUniforms) {
      const {skin, mesh} = this;
      skin.update(node);
      let skinProgramInfo= this.programInfo;
      gl.useProgram(skinProgramInfo.program);
      for (const primitive of mesh.primitives) {
        gl.bindVertexArray(primitive.vao);
        twgl.setUniforms(skinProgramInfo, {
          u_projection: projection,
          u_view: view,
          u_world: node.worldMatrix,
          u_jointTexture: skin.jointTexture,
          u_numJoints: skin.joints.length,
        }, primitive.material.uniforms, sharedUniforms);
        twgl.drawBufferInfo(gl, primitive.bufferInfo);
      }
    }
  }
async function main() {
 
  const canvas = document.querySelector("#canvas");
  gl = canvas.getContext("webgl2");
  if (!gl) {
    alert("No WebGL2");
    return;
  }
 
  const programOptions = {
    attribLocations: {
      a_POSITION: 0,
      a_NORMAL: 1,
      a_WEIGHTS_0: 2,
      a_JOINTS_0: 3,
    },
  };
 
  const skinProgramInfo = twgl.createProgramInfo(gl, [skinVS, fs], programOptions); 

  

 
//for loading gltf 
  function throwNoKey(key) {
    throw new Error(`no key: ${key}`);
  }

  const accessorTypeToNumComponentsMap = {
    'SCALAR': 1,
    'VEC2': 2,
    'VEC3': 3,
    'VEC4': 4,
    'MAT2': 4,
    'MAT3': 9,
    'MAT4': 16,
  };

  function accessorTypeToNumComponents(type) {
    return accessorTypeToNumComponentsMap[type] || throwNoKey(type);
  }

  const glTypeToTypedArrayMap = {
    '5120': Int8Array,    // gl.BYTE
    '5121': Uint8Array,   // gl.UNSIGNED_BYTE
    '5122': Int16Array,   // gl.SHORT
    '5123': Uint16Array,  // gl.UNSIGNED_SHORT
    '5124': Int32Array,   // gl.INT
    '5125': Uint32Array,  // gl.UNSIGNED_INT
    '5126': Float32Array, // gl.FLOAT
  };
 
  function glTypeToTypedArray(type) {
    return glTypeToTypedArrayMap[type] || throwNoKey(type);
  }
 
  function getAccessorTypedArrayAndStride(gl, gltf, accessorIndex) {
    const accessor = gltf.accessors[accessorIndex];
    const bufferView = gltf.bufferViews[accessor.bufferView];
    const TypedArray = glTypeToTypedArray(accessor.componentType);
    const buffer = gltf.buffers[bufferView.buffer];
    return {
      accessor,
      array: new TypedArray(
          buffer,
          bufferView.byteOffset + (accessor.byteOffset || 0),
          accessor.count * accessorTypeToNumComponents(accessor.type)),
      stride: bufferView.byteStride || 0,
    };
  };
 
  function getAccessorAndWebGLBuffer(gl, gltf, accessorIndex) {
    const accessor = gltf.accessors[accessorIndex];
    const bufferView = gltf.bufferViews[accessor.bufferView];
    if (!bufferView.webglBuffer) {
      const buffer = gl.createBuffer();
      const target = bufferView.target || gl.ARRAY_BUFFER;
      const arrayBuffer = gltf.buffers[bufferView.buffer];
      const data = new Uint8Array(arrayBuffer, bufferView.byteOffset, bufferView.byteLength);
      gl.bindBuffer(target, buffer);
      gl.bufferData(target, data, gl.STATIC_DRAW);
      bufferView.webglBuffer = buffer;
    }
    return {
      accessor,
      buffer: bufferView.webglBuffer,
      stride: bufferView.stride || 0,
    };
  }

  async function loadGLTF(url) {
    const gltf = await loadJSON(url);

   
    const baseURL = new URL(url, location.href);
    gltf.buffers = await Promise.all(gltf.buffers.map((buffer) => {
      const url = new URL(buffer.uri, baseURL.href);
      return loadBinary(url.href);
    }));

    const defaultMaterial = {
      uniforms: {
        u_diffuse: [.5, .8, 1, 1],
      },
    };

    // setup meshes
    gltf.meshes.forEach((mesh) => {
      mesh.primitives.forEach((primitive) => {
        const attribs = {};
        let numElements;
        for (const [attribName, index] of Object.entries(primitive.attributes)) {
          const {accessor, buffer, stride} = getAccessorAndWebGLBuffer(gl, gltf, index);
          numElements = accessor.count;
          attribs[`a_${attribName}`] = {
            buffer,
            type: accessor.componentType,
            numComponents: accessorTypeToNumComponents(accessor.type),
            stride,
            offset: accessor.byteOffset | 0,
          };
        }

        const bufferInfo = {
          attribs,
          numElements,
        };

        if (primitive.indices !== undefined) {
          const {accessor, buffer} = getAccessorAndWebGLBuffer(gl, gltf, primitive.indices);
          bufferInfo.numElements = accessor.count;
          bufferInfo.indices = buffer;
          bufferInfo.elementType = accessor.componentType;
        }

        primitive.bufferInfo = bufferInfo;

        primitive.vao = twgl.createVAOFromBufferInfo(gl, skinProgramInfo, primitive.bufferInfo);
        primitive.material = gltf.materials && gltf.materials[primitive.material] || defaultMaterial;
      });
    });

    const skinNodes = [];
    const origNodes = gltf.nodes;
    gltf.nodes = gltf.nodes.map((n) => {
      const {name, skin, mesh, translation, rotation, scale} = n;
      const trs = new TRS(translation, rotation, scale);
      const node = new Node(trs, name);
      const realMesh = gltf.meshes[mesh];
      if (skin !== undefined) {
        skinNodes.push({node, mesh: realMesh, skinNdx: skin});
      } else if (realMesh) {
        node.drawables.push(new MeshRenderer(realMesh));
      }
      return node;
    });
 
    gltf.skins = gltf.skins.map((skin) => {
      const joints = skin.joints.map(ndx => gltf.nodes[ndx]);
      const {stride, array} = getAccessorTypedArrayAndStride(gl, gltf, skin.inverseBindMatrices);
      return new Skin(joints, array);
    });
 
    for (const {node, mesh, skinNdx} of skinNodes) {
      node.drawables.push(new SkinRenderer(mesh, gltf.skins[skinNdx],skinProgramInfo));
    }
 
    gltf.nodes.forEach((node, ndx) => {
      const children = origNodes[ndx].children;
      if (children) {
        addChildren(gltf.nodes, node, children);
      }
    });
 
    for (const scene of gltf.scenes) {
      scene.root = new Node(new TRS(), scene.name);
      addChildren(gltf.nodes, scene.root, scene.nodes);
    }

    return gltf;
  }

  function addChildren(nodes, node, childIndices) {
    childIndices.forEach((childNdx) => {
      const child = nodes[childNdx];
      child.setParent(node);
    });
  }

  async function loadFile(url, typeFunc) {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`could not load: ${url}`);
    }
    return await response[typeFunc]();
  }

  async function loadBinary(url) {
    return loadFile(url, 'arrayBuffer');
  }

  async function loadJSON(url) {
    return loadFile(url, 'json');
  }

  const gltf = await loadGLTF('../model/whale.CYCLES.gltf');

  function degToRad(deg) {
    return deg * Math.PI / 180;
  }

  const origMatrices = new Map();
  function animSkin(skin, a) {
    for (let i = 0; i < skin.joints.length; ++i) {
      const joint = skin.joints[i];
 
      if (!origMatrices.has(joint)) {
    
        origMatrices.set(joint, joint.source.getMatrix());
      }
    
      const origMatrix = origMatrices.get(joint);
      
      const m = m4.xRotate(origMatrix, a);
      m4.decompose(m, joint.source.position, joint.source.rotation, joint.source.scale);
    }
  }

  function render(time) {
    time *= 0.001;  

    twgl.resizeCanvasToDisplaySize(gl.canvas);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.clearColor(.7, .7, .8, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    const fieldOfViewRadians = degToRad(60);
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const projection = m4.perspective(fieldOfViewRadians, aspect, 1, 2000);

    const cameraPosition = [10, 0, -5];
    const target = [0, 0, -10];
 
    const up = [0, 1, 0]; 
    const camera = m4.lookAt(cameraPosition, target, up);
 
    const view = m4.inverse(camera);

    animSkin(gltf.skins[0], Math.sin(time) * .5);

    const sharedUniforms = {
      u_lightDirection: m4.normalize([-1, 3, 5]),
    };

    function renderDrawables(node) {
      for (const drawable of node.drawables) {
        drawable.render(node, projection, view, sharedUniforms);
      }
    }

    for (const scene of gltf.scenes) { 
      scene.root.updateWorldMatrix(); 
      scene.root.traverse(renderDrawables);
    }

    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
}

window.addEventListener("load",async()=>{
  main();
  let result666=await get_666();
  console.log(`${result666}_!!!!`);
});

function get_666(){
  let promise=new Promise(function(res,rej){
       setTimeout(()=>{
         res("666_111");
       })
  });
  return promise;
}
 