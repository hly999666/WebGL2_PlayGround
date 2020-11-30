 

let  vertexShaderSource = /*glsl*/`#version 300 es

in vec2 a_position;

uniform vec2 u_resolution;

uniform vec2 u_translation;


void main() {
//apply transform
  vec2 position = a_position + u_translation;

//send to clipspace
  vec2 zeroToOne = position / u_resolution;
  vec2 zeroToTwo = zeroToOne * 2.0;
  vec2 clipSpace = zeroToTwo - 1.0;
//flip Y
  gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
}
`;

var fragmentShaderSource =  /*glsl*/`#version 300 es

precision highp float;

uniform vec4 u_color;
 
out vec4 outColor;
void main() {
  outColor = u_color;
}
`;
function setGeometry(gl,positionBuffer) {
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
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
 //set up webgl
  let canvas = document.querySelector("#canvas");
  let gl = canvas.getContext("webgl2");
  if (!gl) {
      alert("no webgl");
    return;
  } 
  let program = webglUtils.createProgramFromSources(gl,
      [vertexShaderSource, fragmentShaderSource]);

  // find pointer in shader
  let positionAttributeLocation = gl.getAttribLocation(program, "a_position");

  let resolutionUniformLocation = gl.getUniformLocation(program, "u_resolution");
  let colorLocation = gl.getUniformLocation(program, "u_color");
  let translationLocation = gl.getUniformLocation(program, "u_translation");
 
  //  create vao
  let vao = gl.createVertexArray();

 
  gl.bindVertexArray(vao);
 

  gl.enableVertexAttribArray(positionAttributeLocation); 
  //note this also work,   bindBuffer can after enableVertexAttribArray,but must before vertexAttribPointer
  let positionBuffer = gl.createBuffer();

  setGeometry(gl,positionBuffer);

  //set pull out method for attribute from buffer
  let size = 2;        
  let type = gl.FLOAT;   
  let normalize = false; 
  let stride = 0;         
  let offset = 0;       
  gl.vertexAttribPointer(
      positionAttributeLocation, size, type, normalize, stride, offset);

 
  let  translation = [0, 0];
  let color = [Math.random(), Math.random(), Math.random(), 1];
  //set up finished

  let drawScene=function() {
    webglUtils.resizeCanvasToDisplaySize(gl.canvas);

    // set up viewport and clear color
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    //set shader program
    gl.useProgram(program);

    // bind vao
    gl.bindVertexArray(vao);

  //send uniform
    gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);
    gl.uniform4fv(colorLocation, color);
    gl.uniform2fv(translationLocation, translation);

    //draw 
    let  primitiveType = gl.TRIANGLES;
    let offset = 0;
    let count = 18;
    gl.drawArrays(primitiveType, offset, count);
  }

  drawScene();
 //handle ui
  webglLessonsUI.setupSlider("#x", {slide: updatePosition(0), max: gl.canvas.width });
  webglLessonsUI.setupSlider("#y", {slide: updatePosition(1), max: gl.canvas.height});

  //update and rerender
  function updatePosition(index) {
    return function(event, ui) {
      translation[index] = ui.value;
      drawScene();
    };
}
}

 


window.addEventListener("load",()=>{main();});
