const vs =/*glsl*/ `#version 300 es

in vec4 a_position;
in vec4 a_color;

uniform mat4 u_viewProjection;
uniform mat4 u_world;

out vec4 v_color;

void main() {
   
  gl_Position = u_viewProjection * u_world * a_position;
 
  v_color = a_color;
}
`;

const fs =/*glsl*/ `#version 300 es
precision highp float;
 
in vec4 v_color;
uniform vec4 u_colorMult;
out vec4 outColor;

void main() {
   outColor = v_color * u_colorMult;
}
`;

const pickingVS = /*glsl*/`#version 300 es
  in vec4 a_position;
  
  uniform mat4 u_viewProjection;
  uniform mat4 u_world;
  
  void main() {
 
    gl_Position = u_viewProjection * u_world * a_position;
  }
`;

const pickingFS =/*glsl*/ `#version 300 es
  precision highp float;
  
  uniform vec4 u_id;

  out vec4 outColor;
  
  void main() {
     outColor = u_id;
  }
`;
function degToRad(d) {
    return d * Math.PI / 180;
  }

  function rand(min, max) {
    if (max === undefined) {
      max = min;
      min = 0;
    }
    return Math.random() * (max - min) + min;
  }

  function eMod(x, n) {
    return x >= 0 ? (x % n) : ((n - (-x % n)) % n);
  }
let _gl;
  function setFramebufferAttachmentSizes(width, height,targetTexture,depthBuffer) {
      let gl=_gl;
    gl.bindTexture(gl.TEXTURE_2D, targetTexture);
 
    const level = 0;
    const internalFormat = gl.RGBA;
    const border = 0;
    const format = gl.RGBA;
    const type = gl.UNSIGNED_BYTE;
    const data = null;
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                  width, height, border,
                  format, type, data);

    gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
  }

function main() {
  
  const canvas = document.getElementById("canvas");
  const gl = canvas.getContext("webgl2");
  if (!gl) {
      alert("No Webgl2!!!");
    return;
  } 
  _gl=gl;
  twgl.setAttributePrefix("a_");
 
  const options = {
    attribLocations: {
      a_position: 0,
      a_color: 1,
    },
  };
  const programInfo = twgl.createProgramInfo(gl, [vs, fs], options);
  const pickingProgramInfo = twgl.createProgramInfo(gl, [pickingVS, pickingFS], options);
 
  const sphereBufferInfo = flattenedPrimitives.createSphereBufferInfo(gl, 10, 12, 6);
  const cubeBufferInfo   = flattenedPrimitives.createCubeBufferInfo(gl, 20);
  const coneBufferInfo   = flattenedPrimitives.createTruncatedConeBufferInfo(gl, 10, 0, 20, 12, 1, true, false);

  const sphereVAO = twgl.createVAOFromBufferInfo(gl, programInfo, sphereBufferInfo);
  const cubeVAO   = twgl.createVAOFromBufferInfo(gl, programInfo, cubeBufferInfo);
  const coneVAO   = twgl.createVAOFromBufferInfo(gl, programInfo, coneBufferInfo);



  const fieldOfViewRadians = degToRad(60);
  const near = 1;
  const far = 2000;
 
  const shapes = [
    { bufferInfo: sphereBufferInfo, vertexArray: sphereVAO, },
    { bufferInfo: cubeBufferInfo,   vertexArray: cubeVAO, },
    { bufferInfo: coneBufferInfo,   vertexArray: coneVAO, },
  ];

  const objectsToDraw = [];
  const objects = [];
  const viewProjectionMatrix = m4.identity();
 
  const baseHue = rand(0, 360);
  const numObjects = 200;
  for (let ii = 0; ii < numObjects; ++ii) {
    const id = ii + 1;
 
    const shape = shapes[rand(shapes.length) | 0];
 
    const object = {
      uniforms: {
        u_colorMult: chroma.hsv(eMod(baseHue + rand(0, 120), 360), rand(0.5, 1), rand(0.5, 1)).gl(),
        u_world: m4.identity(),
        u_viewProjection: viewProjectionMatrix,
        u_id: [
          ((id >>  0) & 0xFF) / 0xFF,
          ((id >>  8) & 0xFF) / 0xFF,
          ((id >> 16) & 0xFF) / 0xFF,
          ((id >> 24) & 0xFF) / 0xFF,
        ],
      },
      translation: [rand(-100, 100), rand(-100, 100), rand(-150, -50)],
      xRotationSpeed: rand(0.8, 1.2),
      yRotationSpeed: rand(0.8, 1.2),
    };
    objects.push(object);

    objectsToDraw.push({
      programInfo: programInfo,
      bufferInfo: shape.bufferInfo,
      vertexArray: shape.vertexArray,
      uniforms: object.uniforms,
    });
  }
 
  //set picking texture
  const targetTexture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, targetTexture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
 
  const depthBuffer = gl.createRenderbuffer();
  gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer);


  setFramebufferAttachmentSizes(1, 1,targetTexture,depthBuffer);
 
  //create framebuffer
  const fb = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, fb);

 
  const attachmentPoint = gl.COLOR_ATTACHMENT0;
  const level = 0;
  gl.framebufferTexture2D(gl.FRAMEBUFFER, attachmentPoint, gl.TEXTURE_2D, targetTexture, level);

  //setup renderbuffer for depth-test ,renderbuffer is different from texture because it can't access in shader
  gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer);

  function computeMatrix(translation, xRotation, yRotation) {
    let matrix = m4.translation(
        translation[0],
        translation[1],
        translation[2]);
    matrix = m4.xRotate(matrix, xRotation);
    return m4.yRotate(matrix, yRotation);
  }

  requestAnimationFrame(drawScene);

  function drawObjects(objectsToDraw, overrideProgramInfo) {
    objectsToDraw.forEach(function(object) {
      const programInfo = overrideProgramInfo || object.programInfo;
      const bufferInfo = object.bufferInfo;
      const vertexArray = object.vertexArray;

      gl.useProgram(programInfo.program);
 
      gl.bindVertexArray(vertexArray);
 
      twgl.setUniforms(programInfo, object.uniforms);
 
      twgl.drawBufferInfo(gl, object.bufferInfo);
    });
  }
 
  let mouseX = -1;
  let mouseY = -1;
  let oldPickNdx = -1;
  let oldPickColor;
  let frameCount = 0;
 
  function drawScene(time) {
    time *= 0.0005;
    ++frameCount;

    twgl.resizeCanvasToDisplaySize(gl.canvas);
 
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const projectionMatrix =
        m4.perspective(fieldOfViewRadians, aspect, 1, 2000);
 
    const cameraPosition = [0, 0, 100];
    const target = [0, 0, 0];
    const up = [0, 1, 0];
    const cameraMatrix = m4.lookAt(cameraPosition, target, up);
 
    const viewMatrix = m4.inverse(cameraMatrix);
 
    objects.forEach(function(object) {
      object.uniforms.u_world = computeMatrix(
          object.translation,
          object.xRotationSpeed * time,
          object.yRotationSpeed * time);
    });
 

    {
      // compute frustum for entire viewport
      const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
      const top = Math.tan(fieldOfViewRadians * 0.5) * near;
      const bottom = -top;
      const left = aspect * bottom;
      const right = aspect * top;
      const width = Math.abs(right - left);
      const height = Math.abs(top - bottom);
     // compute frustum for pixel under mouse,note computing in coordinate of viewport
      const pixelX = mouseX * gl.canvas.width / gl.canvas.clientWidth;
      const pixelY = gl.canvas.height - mouseY * gl.canvas.height / gl.canvas.clientHeight - 1;
    
      const subLeft = left + pixelX * width / gl.canvas.width;
      const subBottom = bottom + pixelY * height / gl.canvas.height;
      const subWidth = 1 / gl.canvas.width;
      const subHeight = 1 / gl.canvas.height;

      //  frustum of one pixel
      const projectionMatrix = m4.frustum(
          subLeft,
          subLeft + subWidth,
          subBottom,
          subBottom + subHeight,
          near,
          far);
      m4.multiply(projectionMatrix, viewMatrix, viewProjectionMatrix);
    }

    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    gl.viewport(0, 0, 1, 1);

    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);

 
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    //render picking pixel,overwrite default programInfo
    drawObjects(objectsToDraw, pickingProgramInfo);
 
    const data = new Uint8Array(4);
    gl.readPixels(
        0,              
        0,              
        1,                 
        1,               
        gl.RGBA,         
        gl.UNSIGNED_BYTE,  
        data);
                    
    const id = data[0] + (data[1] << 8) + (data[2] << 16) + (data[3] << 24);

    // restore previous obj color
    if (oldPickNdx >= 0) {
      const object = objects[oldPickNdx];
      object.uniforms.u_colorMult = oldPickColor;
      oldPickNdx = -1;
    }

    // highlight current obj
    if (id > 0) {
      const pickNdx = id - 1;
      oldPickNdx = pickNdx;
      const object = objects[pickNdx];
      oldPickColor = object.uniforms.u_colorMult;
      object.uniforms.u_colorMult = (frameCount & 0x8) ? [1, 0, 0, 1] : [1, 1, 0, 1];
    }
 

    {
      // Compute the projection matrix
      const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
      const projectionMatrix =
          m4.perspective(fieldOfViewRadians, aspect, near, far);

      m4.multiply(projectionMatrix, viewMatrix, viewProjectionMatrix);
    }
    
    //render actual buffer
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    
    drawObjects(objectsToDraw);

    requestAnimationFrame(drawScene);
  }

  gl.canvas.addEventListener('mousemove', (e) => {
     const rect = canvas.getBoundingClientRect();
     mouseX = e.clientX - rect.left;
     mouseY = e.clientY - rect.top;
  });
}

window.addEventListener("load",()=>{main();});
