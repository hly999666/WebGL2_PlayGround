"use strict";


function createShader(gl, type, source) {
  let shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  let success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (success) {
    return shader;
  }
 
  console.log(gl.getShaderInfoLog(shader));
  gl.deleteShader(shader);
}

function createProgram(gl, vertexShader, fragmentShader) {
  let program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  let success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (success) {
    return program;
  }
 
  console.log(gl.getProgramInfoLog(program));
  gl.deleteProgram(program);
}
function randomInt(range) {
  return Math.floor(Math.random() * range);
}
function setRectangle(gl, x, y, width, height) {
  let x1 = x;
  let x2 = x + width;
  let y1 = y;
  let y2 = y + height;
 
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
     x1, y1,
     x2, y1,
     x1, y2,
     x1, y2,
     x2, y1,
     x2, y2]), gl.STATIC_DRAW);
}
function main() {
  let canvas = document.querySelector("#c");
  let gl = canvas.getContext("webgl2");
 
  if (!gl) {
    alert("No WebGL2!");
    return;
    }
    let vertexShader = createShader(gl, gl.VERTEX_SHADER, window.vertexShaderSource);
    let fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, window.fragmentShaderSource);
    
    let program = createProgram(gl, vertexShader, fragmentShader);
 
   //no looping!
   let positionAttributeLocation = gl.getAttribLocation(program, "a_position");
   let  resolutionUniformLocation = gl.getUniformLocation(program, "u_resolution");
    //buffer
    let positionBuffer = gl.createBuffer();
   //note bindBuffer set current buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    let positions = [
      20, 20,
      80, 20,
      20, 30,
      20, 30,
      80, 20,
      80, 50
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
    //note VertexArray amd Buffer is seperate ,VertexArray just like a pointer
    let vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    gl.enableVertexAttribArray(positionAttributeLocation);

    let size = 2;       
    let type = gl.FLOAT;   
    let normalize = false; 
let stride =0;      
let offset = 0;  
   //note vertexAttribPointer bind current buffer (i.e. positionBuffer) to vertexAttribArray
gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);


webglUtils.resizeCanvasToDisplaySize(gl.canvas);
//set draw area
gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
gl.clearColor(0, 0, 0, 0);
gl.clear(gl.COLOR_BUFFER_BIT);
gl.useProgram(program);
//bind draw data
gl.bindVertexArray(vao);
 
//set uniform data
gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);
//color blending 
/* gl.enable(gl.BLEND);
gl.blendFunc(gl.SRC_COLOR, gl.DST_COLOR); */
let colorLocation = gl.getUniformLocation(program, "u_color");
for (var ii = 0; ii < 4; ++ii) {
  // Put a rectangle in the position buffer
  setRectangle(
      gl, ii*50, ii*50,45, 45);

  // Set a random color.
 
   //note vertexAttribPointer bind current buffer (i.e. positionBuffer) to vertexAttribArray
   //and vertexAttribPointer setting unchanged ,i.e. bind send to positionAttributeLocation as old format

 //change pointing method , output change
   gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, 0);
let lit= ii /4;
  gl.uniform4f(colorLocation, lit,lit, 0.8,0.8);

  // Draw the rectangle.
  let primitiveType = gl.TRIANGLES;
  let offset = 0;
  let count = 6;
  //note vao unchaged but binding data changed
  gl.drawArrays(primitiveType, offset, count);
}
  }
window.addEventListener("load",()=>main());


