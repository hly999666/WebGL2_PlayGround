 
let vertexShaderSource = /*glsl*/`#version 300 es
in vec4 a_position;
in vec2 a_texcoord;

uniform mat4 u_matrix;
 
out vec2 v_texcoord;
 
void main() { 


  v_texcoord = a_texcoord;
  gl_Position = u_matrix * a_position;
}
`;

let fragmentShaderSource = /*glsl*/ `#version 300 es

precision highp float;
 
in vec2 v_texcoord;
 
uniform sampler2D u_texture; 
out vec4 outColor;

void main() {
  outColor = texture(u_texture, v_texcoord);
}
`;

function setGeometry(gl) {
  var positions = new Float32Array(
    [
    -0.5, -0.5,  -0.5,
    -0.5,  0.5,  -0.5,
     0.5, -0.5,  -0.5,
    -0.5,  0.5,  -0.5,
     0.5,  0.5,  -0.5,
     0.5, -0.5,  -0.5,

    -0.5, -0.5,   0.5,
     0.5, -0.5,   0.5,
    -0.5,  0.5,   0.5,
    -0.5,  0.5,   0.5,
     0.5, -0.5,   0.5,
     0.5,  0.5,   0.5,

    -0.5,   0.5, -0.5,
    -0.5,   0.5,  0.5,
     0.5,   0.5, -0.5,
    -0.5,   0.5,  0.5,
     0.5,   0.5,  0.5,
     0.5,   0.5, -0.5,

    -0.5,  -0.5, -0.5,
     0.5,  -0.5, -0.5,
    -0.5,  -0.5,  0.5,
    -0.5,  -0.5,  0.5,
     0.5,  -0.5, -0.5,
     0.5,  -0.5,  0.5,

    -0.5,  -0.5, -0.5,
    -0.5,  -0.5,  0.5,
    -0.5,   0.5, -0.5,
    -0.5,  -0.5,  0.5,
    -0.5,   0.5,  0.5,
    -0.5,   0.5, -0.5,

     0.5,  -0.5, -0.5,
     0.5,   0.5, -0.5,
     0.5,  -0.5,  0.5,
     0.5,  -0.5,  0.5,
     0.5,   0.5, -0.5,
     0.5,   0.5,  0.5,

    ]);
  gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
}
 
function setTexcoords(gl) {
  gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(
        [
        //top left 
        0   , 0  ,
        0   , 0.5,
        0.25, 0  ,
        0   , 0.5,
        0.25, 0.5,
        0.25, 0  ,
        //top middle  
        0.25, 0  ,
        0.5 , 0  ,
        0.25, 0.5,
        0.25, 0.5,
        0.5 , 0  ,
        0.5 , 0.5,
        //top right 
        0.5 , 0  ,
        0.5 , 0.5,
        0.75, 0  ,
        0.5 , 0.5,
        0.75, 0.5,
        0.75, 0  ,
        //bottom left
        0   , 0.5,
        0.25, 0.5,
        0   , 1  ,
        0   , 1  ,
        0.25, 0.5,
        0.25, 1  ,
        //bottom middle
        0.25, 0.5,
        0.25, 1  ,
        0.5 , 0.5,
        0.25, 1  ,
        0.5 , 1  ,
        0.5 , 0.5,
        //bottom right
        0.5 , 0.5,
        0.75, 0.5,
        0.5 , 1  ,
        0.5 , 1  ,
        0.75, 0.5,
        0.75, 1  ,

      ]),
      gl.STATIC_DRAW);
}

function degToRad(d) {
  return d * Math.PI / 180;
}

function main() { 
 
  let canvas = document.querySelector("#canvas");

  let gl = canvas.getContext("webgl2");
  if (!gl) {
    alert("No WebGL!!");
    return;
  }
 
  let program = webglUtils.createProgramFromSources(gl,
      [vertexShaderSource, fragmentShaderSource]);
 
  let positionAttributeLocation = gl.getAttribLocation(program, "a_position");
  let texcoordAttributeLocation = gl.getAttribLocation(program, "a_texcoord");
 
  let matrixLocation = gl.getUniformLocation(program, "u_matrix");
 
  let vao = gl.createVertexArray();
 
  gl.bindVertexArray(vao);
 
  let positionBuffer = gl.createBuffer(); 

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
 
  setGeometry(gl);

  gl.enableVertexAttribArray(positionAttributeLocation);

  let size = 3;        
  let type = gl.FLOAT;   
  let normalize = false;
  let stride = 0;   
  let offset = 0; 
  gl.vertexAttribPointer(
      positionAttributeLocation, size, type, normalize, stride, offset);
 
  let texcoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
  setTexcoords(gl);
 
  gl.enableVertexAttribArray(texcoordAttributeLocation);
 
   size = 2;        
   type = gl.FLOAT;    
   normalize = true; 
   stride = 0;     
   offset = 0;    
  gl.vertexAttribPointer(
      texcoordAttributeLocation, size, type, normalize, stride, offset);
 
  //set up image
  let texture = gl.createTexture();
  gl.activeTexture(gl.TEXTURE0 + 0);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
                new Uint8Array([0, 0, 255, 255]));
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
 
  let image = new Image();
  image.src = "./texture/cats.jpg";
  image.addEventListener('load', function() { 
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.generateMipmap(gl.TEXTURE_2D);
  });



  let fieldOfViewRadians = degToRad(60);
  let  modelXRotationRadians = degToRad(0);
  let modelYRotationRadians = degToRad(0);
 
  let then = 0;

  requestAnimationFrame(drawScene);
 
  function drawScene(time) {
 
    time *= 0.001;
    
    var deltaTime = time - then; 
    then = time;

    webglUtils.resizeCanvasToDisplaySize(gl.canvas);
 
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
 
    modelYRotationRadians += -0.7 * deltaTime;
    modelXRotationRadians += -0.4 * deltaTime;
 
    gl.enable(gl.DEPTH_TEST);
 
    gl.enable(gl.CULL_FACE);
 
    gl.useProgram(program);
 
    gl.bindVertexArray(vao);
 
    let aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    let zNear = 1;
    let zFar = 2000;
    let projectionMatrix = m4.perspective(fieldOfViewRadians, aspect, zNear, zFar);

    let cameraPosition = [0, 0, 2];
    let up = [0, 1, 0];
    let target = [0, 0, 0];
 
    let cameraMatrix = m4.lookAt(cameraPosition, target, up);
 
    let viewMatrix = m4.inverse(cameraMatrix);

    let viewProjectionMatrix = m4.multiply(projectionMatrix, viewMatrix);

    let matrix = m4.xRotate(viewProjectionMatrix, modelXRotationRadians);
    matrix = m4.yRotate(matrix, modelYRotationRadians);
 
    gl.uniformMatrix4fv(matrixLocation, false, matrix);
 
    let primitiveType = gl.TRIANGLES;
    let offset = 0;
    let count = 6 * 6;
    gl.drawArrays(primitiveType, offset, count);
 
    requestAnimationFrame(drawScene);
  }
}
 
window.addEventListener("load",()=>{main();});