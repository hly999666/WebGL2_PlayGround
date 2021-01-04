 
let vertexShaderSource =/*glsl*/ `#version 300 es

in vec4 a_position;
in float a_brightness;

out float v_brightness;

void main() {

  gl_Position = a_position;

   
  v_brightness = a_brightness;
}
`;

var fragmentShaderSource = /*glsl*/`#version 300 es

precision highp float;

in float v_brightness;

out vec4 outColor;

void main() {
  outColor = vec4(fract(v_brightness * 10.), 0, 0, 1);
}
`;

function main() {
 
  let canvas = document.querySelector("#canvas");
  let gl = canvas.getContext("webgl2");
  if (!gl) {
      alert("No Webgl2!");
    return;
  }
 
  let program = webglUtils.createProgramFromSources(gl,
      [vertexShaderSource, fragmentShaderSource]);

 
    let positionAttributeLocation = gl.getAttribLocation(program, "a_position");
    let brightnessAttributeLocation = gl.getAttribLocation(program, "a_brightness");
 
    let positionBuffer = gl.createBuffer();

 
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  let mult = 20;
  let positions = [
      -.8,  .8, 0, 1,   
       .8,  .8, 0, 1,
      -.8,  .2, 0, 1,
      -.8,  .2, 0, 1,  
       .8,  .8, 0, 1,
       .8,  .2, 0, 1,

      -.8       , -.2       , 0,    1,   
       .8 * mult, -.2 * mult, 0, mult,
      -.8       , -.8       , 0,    1,
      -.8       , -.8       , 0,    1,  
       .8 * mult, -.2 * mult, 0, mult,
       .8 * mult, -.8 * mult, 0, mult,
  ];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

 
  let brightnessBuffer = gl.createBuffer();
 
  gl.bindBuffer(gl.ARRAY_BUFFER, brightnessBuffer);

  var brightness = [
    0,  
    1,
    0,
    0,   
    1,
    1,

    0,   
    1,
    0,
    0,  
    1,
    1,
  ];

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(brightness), gl.STATIC_DRAW);

 
  let vao = gl.createVertexArray();
 
  gl.bindVertexArray(vao);
 
  gl.enableVertexAttribArray(positionAttributeLocation);
 
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

 
  let size = 4;          
  let type = gl.FLOAT;   
  let normalize = false; 
  let stride = 0;      
  let offset = 0;     
  gl.vertexAttribPointer(
      positionAttributeLocation, size, type, normalize, stride, offset);
 
  gl.enableVertexAttribArray(brightnessAttributeLocation);
 
  gl.bindBuffer(gl.ARRAY_BUFFER, brightnessBuffer);
 
    size = 1;        
    type = gl.FLOAT;    
    normalize = false;  
    stride = 0;       
    offset = 0;      
  gl.vertexAttribPointer(
      brightnessAttributeLocation, size, type, normalize, stride, offset);
 

  webglUtils.resizeCanvasToDisplaySize(gl.canvas);
 
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
 
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);
 
  gl.useProgram(program);
 
  gl.bindVertexArray(vao);

 
  let primitiveType = gl.TRIANGLES;
     offset = 0;
  let count = 4 * 3;  
  gl.drawArrays(primitiveType, offset, count);
}

window.addEventListener("load",()=>{main();});