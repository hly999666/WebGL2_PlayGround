"use strict";

let vs = /*glsl*/`#version 300 es
in vec2 a_position;
in vec4 a_color;
uniform mat3 u_matrix;

out vec4 v_color;

void main() {
  // Multiply the position by the matrix.
  gl_Position = vec4((u_matrix * vec3(a_position, 1)).xy, 0, 1);

  // Convert from clipspace to colorspace.
  // Clipspace goes -1.0 to +1.0
  // Colorspace goes from 0.0 to 1.0
  v_color = a_color;
}
`;

let fs =  /*glsl*/`#version 300 es

precision highp float;

in vec4 v_color;

out vec4 outColor;

void main() {
  outColor = v_color;
}
`;
function setGeometry(gl) {
  gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        -150, -100,
        150, -100,
       -150,  100,
        150, -100,
       -150,  100,
        150,  100,
      ]),
      gl.STATIC_DRAW);
}
function setColors_1(gl) {
  // Pick 2 random colors.
  let r1 = Math.random();
  let b1 = Math.random();
  let g1 = Math.random();
 
  let r2 = Math.random();
  let b2 = Math.random();
  let g2 = Math.random();
 
  gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(
        [ r1, b1, g1, 1,
          r1, b1, g1, 1,
          r1, b1, g1, 1,
          r2, b2, g2, 1,
          r2, b2, g2, 1,
          r2, b2, g2, 1]),
      gl.STATIC_DRAW);
}
function setColors_2(gl) {
  // Make every vertex a different color.
  gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(
        [ Math.random(), Math.random(), Math.random(), 1,
          Math.random(), Math.random(), Math.random(), 1,
          Math.random(), Math.random(), Math.random(), 1,
          Math.random(), Math.random(), Math.random(), 1,
          Math.random(), Math.random(), Math.random(), 1,
          Math.random(), Math.random(), Math.random(), 1]),
      gl.STATIC_DRAW);
}
function setColors_3(gl) {
  // Pick 2 random colors.
  var r1 = Math.random() * 256; // 0 to 255.99999
  var b1 = Math.random() * 256; // these values
  var g1 = Math.random() * 256; // will be truncated
  var r2 = Math.random() * 256; // when stored in the
  var b2 = Math.random() * 256; // Uint8Array
  var g2 = Math.random() * 256;
 
  gl.bufferData(
      gl.ARRAY_BUFFER,
      new Uint8Array(   // Uint8Array
        [ r1, b1, g1, 255,
          r1, b1, g1, 255,
          r1, b1, g1, 255,
          r2, b2, g2, 255,
          r2, b2, g2, 255,
          r2, b2, g2, 255]),
      gl.STATIC_DRAW);
}
function main() {
  // Get A WebGL context
  /** @type {HTMLCanvasElement} */
  let canvas = document.querySelector("#canvas");
  let gl = canvas.getContext("webgl2");
  if (!gl) {
    return;
  }

  // setup GLSL program
  let program = webglUtils.createProgramFromSources(gl, [vs, fs]);

  // look up where the vertex data needs to go.
  let positionLocation = gl.getAttribLocation(program, "a_position");
  let colorLocation = gl.getAttribLocation(program, "a_color");
  // lookup uniforms
  let matrixLocation = gl.getUniformLocation(program, "u_matrix");

  // Create set of attributes
  let vao = gl.createVertexArray();
  gl.bindVertexArray(vao);

  // Create a buffer.
  let pos_buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, pos_buffer);

  // Set Geometry.
  setGeometry(gl);

  // tell the position attribute how to pull data out of the current ARRAY_BUFFER
  gl.enableVertexAttribArray(positionLocation);
  let size = 2;
  let type = gl.FLOAT;
  let normalize = false;
  let stride = 0;
  let offset = 0;
  gl.vertexAttribPointer(positionLocation, size, type, normalize, stride, offset);


   // Create a buffer for the colors.
   let color_buffer = gl.createBuffer();
   gl.bindBuffer(gl.ARRAY_BUFFER, color_buffer);
  
   // Set the colors.
   setColors_2(gl);
   gl.enableVertexAttribArray(colorLocation);
     size = 4;
     type = gl.FLOAT;
     normalize = false;
     stride = 0;
     offset = 0;
   gl.vertexAttribPointer(colorLocation, size, type, normalize, stride, offset);
   
  let translation = [200, 150];
  let angleInRadians = 0;
  let scale = [1, 1];
// Draw the scene.
let  drawScene=function() {
  webglUtils.resizeCanvasToDisplaySize(gl.canvas);

  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  // Clear the canvas
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Compute the matrix
  let matrix = m3.projection(gl.canvas.clientWidth, gl.canvas.clientHeight);
  matrix = m3.translate(matrix, translation[0], translation[1]);
  matrix = m3.rotate(matrix, angleInRadians);
  matrix = m3.scale(matrix, scale[0], scale[1]);

  // Tell it to use our program (pair of shaders)
  gl.useProgram(program);

  // Bind the attribute/buffer set we want.
  gl.bindVertexArray(vao);

  // Set the matrix.
  gl.uniformMatrix3fv(matrixLocation, false, matrix);

  // Draw the geometry.
  let offset = 0;
  let count =6;
  gl.drawArrays(gl.TRIANGLES, offset, count);
}
 
  drawScene();
  function updatePosition(index) {
    return function(event, ui) {
      translation[index] = ui.value;
      drawScene();
    };
  }

  function updateAngle(event, ui) {
    let angleInDegrees = 360 - ui.value;
    angleInRadians = angleInDegrees * Math.PI / 180;
    drawScene();
  }

  function updateScale(index) {
    return function(event, ui) {
      scale[index] = ui.value;
      drawScene();
    };
  }
  // Setup a ui.
  webglLessonsUI.setupSlider("#x",      {value: translation[0], slide: updatePosition(0), max: gl.canvas.width });
  webglLessonsUI.setupSlider("#y",      {value: translation[1], slide: updatePosition(1), max: gl.canvas.height});
  webglLessonsUI.setupSlider("#angle",  {slide: updateAngle, max: 360});
  webglLessonsUI.setupSlider("#scaleX", {value: scale[0], slide: updateScale(0), min: -5, max: 5, step: 0.01, precision: 2});
  webglLessonsUI.setupSlider("#scaleY", {value: scale[1], slide: updateScale(1), min: -5, max: 5, step: 0.01, precision: 2});

  // Draw the scene.



  
}

// Fill the buffer with the values that define a triangle.

window.addEventListener("load",()=>{

  main();
});
