 
let vs =/*glsl*/ `#version 300 es

in vec4 a_position;
in vec4 a_color;

uniform mat4 u_matrix;

out vec4 v_color;

void main() {
  v_color = a_color;
  gl_Position = u_matrix * a_position;
}
`;

var fs =/*glsl*/ `#version 300 es
precision highp float;
 
in vec4 v_color;

uniform vec4 u_colorMult;

out vec4 outColor;

void main() {
   outColor = v_color * u_colorMult;
}
`;
function degToRad(d) {
    return d * Math.PI / 180;
  }

  function computeMatrix(viewProjectionMatrix, translation, xRotation, yRotation) {
    let matrix = m4.translate(viewProjectionMatrix,
        translation[0],
        translation[1],
        translation[2]);
    matrix = m4.xRotate(matrix, xRotation);
    return m4.yRotate(matrix, yRotation);
  }

function main() {
 
  
  let canvas = document.querySelector("#canvas");
  let gl = canvas.getContext("webgl2");
  if (!gl) {
    return;
  }
 
  twgl.setAttributePrefix("a_");

  let sphereBufferInfo = flattenedPrimitives.createSphereBufferInfo(gl, 10, 12, 6);
  let cubeBufferInfo   = flattenedPrimitives.createCubeBufferInfo(gl, 20);
  let coneBufferInfo   = flattenedPrimitives.createTruncatedConeBufferInfo(gl, 10, 0, 20, 12, 1, true, false);
 
  let programInfo = twgl.createProgramInfo(gl, [vs, fs]);

  let sphereVAO = twgl.createVAOFromBufferInfo(gl, programInfo, sphereBufferInfo);
  let cubeVAO   = twgl.createVAOFromBufferInfo(gl, programInfo, cubeBufferInfo);
  let coneVAO   = twgl.createVAOFromBufferInfo(gl, programInfo, coneBufferInfo);

  let fieldOfViewRadians = degToRad(60);


 
  let sphereUniforms = {
    u_colorMult: [0.5, 1, 0.5, 1],
    u_matrix: m4.identity(),
  };
  let cubeUniforms = {
    u_colorMult: [1, 0.5, 0.5, 1],
    u_matrix: m4.identity(),
  };
  let coneUniforms = {
    u_colorMult: [0.5, 0.5, 1, 1],
    u_matrix: m4.identity(),
  };
  let sphereTranslation = [  0, 0, 0];
  let cubeTranslation   = [-40, 0, 0];
  let coneTranslation   = [ 40, 0, 0];

  let objectsToDraw = [
    {
      programInfo: programInfo,
      bufferInfo: sphereBufferInfo,
      vertexArray: sphereVAO,
      uniforms: sphereUniforms,
    },
    {
      programInfo: programInfo,
      bufferInfo: cubeBufferInfo,
      vertexArray: cubeVAO,
      uniforms: cubeUniforms,
    },
    {
      programInfo: programInfo,
      bufferInfo: coneBufferInfo,
      vertexArray: coneVAO,
      uniforms: coneUniforms,
    },
  ];

  function drawScene(time) {
    time = time * 0.0005;

    twgl.resizeCanvasToDisplaySize(gl.canvas);

   
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);
 
    let aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    let projectionMatrix =
        m4.perspective(fieldOfViewRadians, aspect, 1, 2000);
 
        let cameraPosition = [0, 0, 100];
        let target = [0, 0, 0];
        let up = [0, 1, 0];
        let cameraMatrix = m4.lookAt(cameraPosition, target, up);
 
    let viewMatrix = m4.inverse(cameraMatrix);

    let viewProjectionMatrix = m4.multiply(projectionMatrix, viewMatrix);

    let sphereXRotation =  time;
    let sphereYRotation =  time;
    let cubeXRotation   = -time;
    let cubeYRotation   =  time;
    let coneXRotation   =  time;
    let coneYRotation   = -time;

  
    sphereUniforms.u_matrix = computeMatrix(
        viewProjectionMatrix,
        sphereTranslation,
        sphereXRotation,
        sphereYRotation);

    cubeUniforms.u_matrix = computeMatrix(
        viewProjectionMatrix,
        cubeTranslation,
        cubeXRotation,
        cubeYRotation);

    coneUniforms.u_matrix = computeMatrix(
        viewProjectionMatrix,
        coneTranslation,
        coneXRotation,
        coneYRotation);

 

    objectsToDraw.forEach(function(object) {
      let programInfo = object.programInfo;

      gl.useProgram(programInfo.program);

     
      gl.bindVertexArray(object.vertexArray);
 
      twgl.setUniforms(programInfo, object.uniforms);

      twgl.drawBufferInfo(gl, object.bufferInfo);
    });

    requestAnimationFrame(drawScene);
  }

  requestAnimationFrame(drawScene);

 

}

window.addEventListener("load",()=>{main();})
