 

let vertexShaderSource = /*glsl*/`#version 300 es
 
in vec2 a_position;

 
uniform vec2 u_resolution;
 
uniform vec2 u_translation;
 
uniform vec2 u_rotation;

 
void main() {
  // rotate
  vec2 rotatedPosition = vec2(
     a_position.x * u_rotation.y + a_position.y * u_rotation.x,
     a_position.y * u_rotation.y - a_position.x * u_rotation.x);
 //translate
  vec2 position = rotatedPosition + u_translation;

  //convert to clipspace
  vec2 zeroToOne = position / u_resolution;
  vec2 zeroToTwo = zeroToOne * 2.0;
  vec2 clipSpace = zeroToTwo - 1.0;

  gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
}
`;

let fragmentShaderSource = /*glsl*/`#version 300 es

precision highp float;

uniform vec4 u_color;

  
out vec4 outColor;

void main() {
  outColor = u_color;
}
`;

function setGeometry(gl) {
    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([
            // left column
            0, 0,
            30, 0,
            0, 150,
            0, 150,
            30, 0,
            30, 150,
  
            // top rung
            30, 0,
            100, 0,
            30, 30,
            30, 30,
            100, 0,
            100, 30,
  
            // middle rung
            30, 60,
            67, 60,
            30, 90,
            30, 90,
            67, 60,
            67, 90,
        ]),
        gl.STATIC_DRAW);
  }
  
function main() {
 
  let canvas = document.querySelector("#canvas");
  let gl = canvas.getContext("webgl2");
  if (!gl) {
    return;
  }
 
  let program = webglUtils.createProgramFromSources(gl,
      [vertexShaderSource, fragmentShaderSource]);
 
  let positionAttributeLocation = gl.getAttribLocation(program, "a_position");
 
  let resolutionUniformLocation = gl.getUniformLocation(program, "u_resolution");
  let colorLocation = gl.getUniformLocation(program, "u_color");
  let translationLocation = gl.getUniformLocation(program, "u_translation");
  let rotationLocation = gl.getUniformLocation(program, "u_rotation");
 
  let positionBuffer = gl.createBuffer();
 
  let vao = gl.createVertexArray();
 
  gl.bindVertexArray(vao);

 
  gl.enableVertexAttribArray(positionAttributeLocation);

 
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
 
  setGeometry(gl);
 
  let size = 2;         
  let type = gl.FLOAT;   
  let normalize = false; 
  let stride = 0;      
  let offset = 0;      
  gl.vertexAttribPointer(
      positionAttributeLocation, size, type, normalize, stride, offset);
 
  let translation = [150, 100];
  let rotation = [0, 1];
  let color = [Math.random(), Math.random(), Math.random(), 1];

  //set up finished 

  function drawScene() {
    webglUtils.resizeCanvasToDisplaySize(gl.canvas);

    
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
 
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
 
    gl.useProgram(program);
 
    gl.bindVertexArray(vao);
 
    gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);
 
    gl.uniform4fv(colorLocation, color);
 
    gl.uniform2fv(translationLocation, translation);
 
    gl.uniform2fv(rotationLocation, rotation);
 
    let primitiveType = gl.TRIANGLES;
    let offset = 0;
    let count = 18;
    gl.drawArrays(primitiveType, offset, count);
  }


  drawScene();

 
  webglLessonsUI.setupSlider("#x",     {value: translation[0], slide: updatePosition(0), max: gl.canvas.width });
  webglLessonsUI.setupSlider("#y",     {value: translation[1], slide: updatePosition(1), max: gl.canvas.height});
  webglLessonsUI.setupSlider("#angle", {slide: updateAngle, max: 360});

  function updatePosition(index) {
    return function(event, ui) {
      translation[index] = ui.value;
      drawScene();
    };
  }

  function updateAngle(event, ui) {
    let angleInDegrees = 360 - ui.value;
    let angleInRadians = angleInDegrees * Math.PI / 180;
    rotation[0] = Math.sin(angleInRadians);
    rotation[1] = Math.cos(angleInRadians);
    drawScene();
  }

 

}
 
window.addEventListener("load",()=>{main();});