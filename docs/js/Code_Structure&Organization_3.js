 
let vs = /*glsl*/`#version 300 es

in vec4 a_position;
in vec4 a_color;

uniform mat4 u_matrix;

out vec4 v_color;

void main() {
  gl_Position = u_matrix * a_position;

  v_color = a_color;
}
`;

let fs = /*glsl*/ `#version 300 es
precision highp float;
in vec4 v_color;

uniform vec4 u_colorMult;
uniform vec4 u_colorOffset;

out vec4 outColor;

void main() {
   outColor = v_color * u_colorMult + u_colorOffset;
}
`;

class Node{
    constructor(){
        this.children = [];
        this.localMatrix = m4.identity();
        this.worldMatrix = m4.identity();
    }
    setParent(parent){
        if (this.parent) {
            let ndx = this.parent.children.indexOf(this);
            if (ndx >= 0) {
              this.parent.children.splice(ndx, 1);
            }
          }
        
          // Add us to our new parent
          if (parent) {
            parent.children.push(this);
          }
          this.parent = parent;
    }
    updateWorldMatrix(matrix) {
        if (matrix) {
          m4.multiply(matrix, this.localMatrix, this.worldMatrix);
        } else {
          m4.copy(this.localMatrix, this.worldMatrix);
        }
        let worldMatrix = this.worldMatrix;
        this.children.forEach(function(child) {
          child.updateWorldMatrix(worldMatrix);
        });
      };
}
 

function degToRad(d) {
    return d * Math.PI / 180;
  }

function main() {
 
  let canvas = document.querySelector("#canvas");
  let gl = canvas.getContext("webgl2");
  if (!gl) {
    return;
  }
 
  twgl.setAttributePrefix("a_");

  let sphereBufferInfo = flattenedPrimitives.createSphereBufferInfo(gl, 10, 12, 6);

  let programInfo = twgl.createProgramInfo(gl, [vs, fs]);

  let sphereVAO = twgl.createVAOFromBufferInfo(gl, programInfo, sphereBufferInfo);



  let fieldOfViewRadians = degToRad(60);

 
  let solarSystemNode = new Node();
  let earthOrbitNode = new Node();
  
  earthOrbitNode.localMatrix = m4.translation(100, 0, 0);

  let moonOrbitNode = new Node();
 
  moonOrbitNode.localMatrix = m4.translation(30, 0, 0);

  let sunNode = new Node();
  sunNode.localMatrix = m4.scaling(5, 5, 5);  
  sunNode.drawInfo = {
    uniforms: {
      u_colorOffset: [0.6, 0.6, 0, 1], 
      u_colorMult:   [0.4, 0.4, 0, 1],
    },
    programInfo: programInfo,
    bufferInfo: sphereBufferInfo,
    vertexArray: sphereVAO,
  };

  let earthNode = new Node();
 
  earthNode.localMatrix = m4.scaling(2, 2, 2);  
  earthNode.drawInfo = {
    uniforms: {
      u_colorOffset: [0.2, 0.5, 0.8, 1], 
      u_colorMult:   [0.8, 0.5, 0.2, 1],
    },
    programInfo: programInfo,
    bufferInfo: sphereBufferInfo,
    vertexArray: sphereVAO,
  };

  let moonNode = new Node();
  moonNode.localMatrix = m4.scaling(0.4, 0.4, 0.4);
  moonNode.drawInfo = {
    uniforms: {
      u_colorOffset: [0.6, 0.6, 0.6, 1],   
      u_colorMult:   [0.1, 0.1, 0.1, 1],
    },
    programInfo: programInfo,
    bufferInfo: sphereBufferInfo,
    vertexArray: sphereVAO,
  };
 
  sunNode.setParent(solarSystemNode);
  earthOrbitNode.setParent(solarSystemNode);
  earthNode.setParent(earthOrbitNode);
  moonOrbitNode.setParent(earthOrbitNode);
  moonNode.setParent(moonOrbitNode);

  let objects = [
    sunNode,
    earthNode,
    moonNode,
  ];

  let objectsToDraw = [
    sunNode.drawInfo,
    earthNode.drawInfo,
    moonNode.drawInfo,
  ];

  function drawScene(time) {
    time *= 0.001;

    twgl.resizeCanvasToDisplaySize(gl.canvas);
 
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);

    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    
    let aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    let projectionMatrix =
        m4.perspective(fieldOfViewRadians, aspect, 1, 2000);

    
    let cameraPosition = [0, -200, 0];
    let target = [0, 0, 0];
    let up = [0, 0, 1];
    let cameraMatrix = m4.lookAt(cameraPosition, target, up);

    let viewMatrix = m4.inverse(cameraMatrix);

    let viewProjectionMatrix = m4.multiply(projectionMatrix, viewMatrix);

 
    m4.multiply(m4.yRotation(0.01), earthOrbitNode.localMatrix, earthOrbitNode.localMatrix);
    m4.multiply(m4.yRotation(0.01), moonOrbitNode.localMatrix, moonOrbitNode.localMatrix);
 
    m4.multiply(m4.yRotation(0.005), sunNode.localMatrix, sunNode.localMatrix);
    m4.multiply(m4.yRotation(0.05), earthNode.localMatrix, earthNode.localMatrix);
    m4.multiply(m4.yRotation(-0.01), moonNode.localMatrix, moonNode.localMatrix);

    solarSystemNode.updateWorldMatrix();
 
    objects.forEach(function(object) {
        object.drawInfo.uniforms.u_matrix = m4.multiply(viewProjectionMatrix, object.worldMatrix);
    });

  

    twgl.drawObjectList(gl, objectsToDraw);

    requestAnimationFrame(drawScene);
  }
  requestAnimationFrame(drawScene);
 
}
window.addEventListener("load",()=>{main();});
