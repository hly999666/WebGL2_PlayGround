"use strict";

let vertexShaderSource =/*glsl*/ `#version 300 es
 
in vec2 a_position;
 
uniform vec2 u_resolution;
 
void main() {
 
  vec2 zeroToOne = a_position / u_resolution;
 
  vec2 zeroToTwo = zeroToOne * 2.0;
 
  vec2 clipSpace = zeroToTwo - 1.0;

  gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
}
`;

var fragmentShaderSource =/*glsl*/  `#version 300 es

precision highp float;

uniform vec4 u_color;
 
out vec4 outColor;

void main() {
  outColor = u_color;
}
`;
 
function randomInt(range) {
  return Math.floor(Math.random() * range);
}
 
function setRectangle(gl, x, y, width, height,positionBuffer) {
  gl.bindBuffer(gl.ARRAY_BUFFER,positionBuffer);
  let x1 = x;
  let x2 = x + width;
  let y1 = y;
  let y2 = y + height;
  //bufferData is rewrite all data in buffer from beginning
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
     x1, y1,  // vertex 0
     x2, y1,  // vertex 1
     x1, y2,  // vertex 2
     x2, y2,  // vertex 3
  ]), gl.STATIC_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER,null);
}

function main() {
 
  let canvas = document.querySelector("#canvas");
  let gl = canvas.getContext("webgl2");
  if (!gl) {
    alert("No Webgl2!!!");
    return;
  }
 
  let program = webglUtils.createProgramFromSources(gl,
      [vertexShaderSource, fragmentShaderSource]);
 
  let positionAttributeLocation = gl.getAttribLocation(program, "a_position");

 
  let resolutionUniformLocation = gl.getUniformLocation(program, "u_resolution");
  let colorLocation = gl.getUniformLocation(program, "u_color");
 
  let positionBuffer = gl.createBuffer();
 
  let vao = gl.createVertexArray();
 
  gl.bindVertexArray(vao);
 
  gl.enableVertexAttribArray(positionAttributeLocation);
 
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
 
  let size = 2;          
  let type = gl.FLOAT;   
  let normalize = false; 
  let stride = 0;         
  let offset = 0;  
  gl.vertexAttribPointer(
      positionAttributeLocation, size, type, normalize, stride, offset);
 
  const indexBuffer = gl.createBuffer();
 //note gl.ELEMENT_ARRAY_BUFFER is bind to current vao,not gobal bindBuffer
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
 
  const indices = [
    0, 1, 2,  
    2, 1, 3,   
  ];
  gl.bufferData(
      gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(indices),
      gl.STATIC_DRAW
  );

  webglUtils.resizeCanvasToDisplaySize(gl.canvas);
 
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
 
  gl.clearColor(0, 0, 0, 0); 
 
  gl.useProgram(program);
 
  gl.bindVertexArray(vao);
 
  gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);
 
  for (var ii = 0; ii < 50; ++ii) {
    
    setRectangle(
        gl, randomInt(gl.canvas.width), randomInt(gl.canvas.height), randomInt(300), randomInt(300),positionBuffer);

 
    gl.uniform4f(colorLocation, Math.random(), Math.random(), Math.random(), 1);
 
    let primitiveType = gl.TRIANGLES;
    let offset = 0;
    let count = 6;
    let indexType = gl.UNSIGNED_SHORT;
    gl.drawElements(primitiveType, count, indexType, offset);
  }
}

window.addEventListener("load",()=>{main();});
