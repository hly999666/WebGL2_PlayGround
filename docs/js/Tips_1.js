const canvas=document.querySelector('#canvas');
const gl =canvas.getContext('webgl2');

 

function drawRect(x, y, width, height, color) {
  gl.enable(gl.SCISSOR_TEST);
  gl.scissor(x, y, width, height);
  gl.clearColor(...color);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.disable(gl.SCISSOR_TEST);
}
function drawLotsRect(n){
  for (let i = 0; i < n; ++i) {
    const x = rand(0, 300);
    const y = rand(0, 150);
    const width = rand(0, 300 - x);
    const height = rand(0, 150 - y);
    drawRect(x, y, width, height, [rand(1), rand(1), rand(1), 1]);
  }
}
function rand(min, max) {
    if (max === undefined) {
      max = min;
      min = 0;
    }
    return Math.random() * (max - min) + min;
  }
function drawLargePoint(){
  const vs =/*glsl*/ `#version 300 es
 
void main() {
  gl_Position = vec4(0, 0, 0, 1);   
  gl_PointSize = 30.0;
} 
`;

const fs =/*glsl*/  `#version 300 es
 
precision highp float;

out vec4 outColor;

void main() {
  outColor = vec4(1, 0, 0, 1);  
}
`;

// setup GLSL program
const program = webglUtils.createProgramFromSources(gl, [vs, fs]);
gl.useProgram(program);

const offset = 0;
const count = 1;
gl.drawArrays(gl.POINTS, offset, count);
}
function drawTexturedPoint(){ 
  const vs = /*glsl*/`#version 300 es
 
  void main() {
    gl_Position = vec4(0, 0, 0, 1);  
    gl_PointSize = 120.0;
  } 
  `;
  
  const fs = /*glsl*/`#version 300 es
 
  precision highp float;
  
  uniform sampler2D tex;
  
  out vec4 outColor;
  
  void main() {
    //quad actually is a quad,have PointCoord
    outColor = texture(tex, gl_PointCoord.xy);
  }
  `;
  
 
  const program = webglUtils.createProgramFromSources(gl, [vs, fs]);
 
  const pixels = new Uint8Array([
    0xFF, 0x00, 0x00, 0xFF, /* & */0x00, 0xFF, 0x00, 0xFF,  
    0x00, 0x00, 0xFF, 0xFF, /* & */0xFF, 0x00, 0xFF, 0xFF
  ]);
  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texImage2D(
      gl.TEXTURE_2D,
      0,                  
      gl.RGBA,          
      2,                
      2,            
      0,           
      gl.RGBA,        
      gl.UNSIGNED_BYTE,   
      pixels,   
  );
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  
  gl.useProgram(program);
  
  const offset = 0;
  const count = 1;
  gl.drawArrays(gl.POINTS, offset, count);
}

function drawLotsPoints(n){
  const vs =/*glsl*/ `#version 300 es
 
in vec4 position;

void main() {
  gl_Position = position;
  gl_PointSize = 20.0;
} 
`;

const fs = /*glsl*/ `#version 300 es
 
precision highp float;

uniform vec4 color;

out vec4 outColor;

void main() {
  outColor = color;
}
`;

 
const program = webglUtils.createProgramFromSources(gl, [vs, fs]);
const positionLoc = gl.getAttribLocation(program, 'position');
const colorLoc = gl.getUniformLocation(program, 'color');

gl.useProgram(program);

let numPoints =n;
for (let i = 0; i < numPoints; ++i) {
  const u = i / (numPoints - 1);   
  const clipspace = u * 1.6 - 0.8;   
  gl.vertexAttrib2f(positionLoc, clipspace, clipspace);

  gl.uniform4f(colorLoc, u, 0, 1 - u, 1);

  const offset = 0;
  const count = 1;
  gl.drawArrays(gl.POINTS, offset, count);
}
}
window.addEventListener("load",()=>{
  gl.enable(gl.SCISSOR_TEST);
  //note coordinate is lower-left right-top and nothing about viewport
  gl.scissor(0.5*canvas.width, 0.5*canvas.height, canvas.width, canvas.height);
  gl.clearColor(0.0,0.4,0.6,1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.disable(gl.SCISSOR_TEST);

   //query parameter
  const [minSize, maxSize] = gl.getParameter(gl.ALIASED_POINT_SIZE_RANGE);
  gl.viewport(0, 0, canvas.width*0.5, canvas.height*0.5);
  //note clear is effected by scissor, but not by viewport
  gl.clearColor(0.8, 0.6,0.4, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT); 
 // drawLargePoint();
  //drawLotsRect(15);
  //drawTexturedPoint();

  drawLotsPoints(10);
})
