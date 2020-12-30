
let vertexShaderSource =/*glsl*/ `#version 300 es
  
in vec4 a_position;
in vec2 a_texcoord;
 
uniform mat4 u_matrix; 
out vec2 v_texcoord;
 
void main() { 
     
  v_texcoord = a_texcoord;
  gl_Position = u_matrix * a_position;

}
`;

let fragmentShaderSource = /*glsl*/`#version 300 es

precision highp float;
 
in vec2 v_texcoord;

 
uniform sampler2D u_texture;
 
out vec4 outColor;

void main() {
  outColor = texture(u_texture, v_texcoord);
}
`;
function degToRad(d) {
    return d * Math.PI / 180;
  };
  function setGeometry(gl) {
    let positions = new Float32Array(
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
  };
  function setTexcoords(gl) {
    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(
          [
            0, 0,
            0, 1,
            1, 0,
            0, 1,
            1, 1,
            1, 0,
  
            0, 0,
            0, 1,
            1, 0,
            1, 0,
            0, 1,
            1, 1,
  
            0, 0,
            0, 1,
            1, 0,
            0, 1,
            1, 1,
            1, 0,
  
            0, 0,
            0, 1,
            1, 0,
            1, 0,
            0, 1,
            1, 1,
  
            0, 0,
            0, 1,
            1, 0,
            0, 1,
            1, 1,
            1, 0,
  
            0, 0,
            0, 1,
            1, 0,
            1, 0,
            0, 1,
            1, 1,
  
        ]),
        gl.STATIC_DRAW);
  }
function main() {
  
  let canvas = document.querySelector("#canvas");
  let gl = canvas.getContext("webgl2");
  if (!gl) {
      alert("No webgl2");
    return;
  }
 
  let program = webglUtils.createProgramFromSources(gl,
      [vertexShaderSource, fragmentShaderSource]);
 
  let positionAttributeLocation = gl.getAttribLocation(program, "a_position");
  let texcoordAttributeLocation = gl.getAttribLocation(program, "a_texcoord");
 
  let matrixLocation = gl.getUniformLocation(program, "u_matrix");
  let textureLocation = gl.getUniformLocation(program, "u_texture");
 

 
  let vao = gl.createVertexArray();
 
  gl.bindVertexArray(vao);
 

  gl.enableVertexAttribArray(positionAttributeLocation);

  let positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
 
  setGeometry(gl);
 
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

 
  let texture = gl.createTexture();

 
  gl.activeTexture(gl.TEXTURE0 + 0);
 
  gl.bindTexture(gl.TEXTURE_2D, texture);
 
  //Setup texture
  {
    const level = 0;
    const internalFormat = gl.RGB8;
    const width = 3;
    const height = 2;
    const border = 0;
    const format = gl.RGB;
    const type = gl.UNSIGNED_BYTE;
    const data = new Uint8Array([
      128,128,128, 0,128,0, 0,0,128,
      128,0,0, 128,128,0 ,128, 0,128
    ]);
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, width, height, border,
                  format, type, data);
 
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  }



  let fieldOfViewRadians = degToRad(60);
  let modelXRotationRadians = degToRad(0);
  let modelYRotationRadians = degToRad(0);
 
  let then = 0;

  requestAnimationFrame(drawScene);
 
  function drawScene(time) {
 
    time *= 0.001; 
    let deltaTime = time - then; 
    then = time;

    webglUtils.resizeCanvasToDisplaySize(gl.canvas);

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    gl.enable(gl.DEPTH_TEST);

    gl.enable(gl.CULL_FACE);

    modelYRotationRadians += -0.7 * deltaTime;
    modelXRotationRadians += -0.4 * deltaTime;

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.useProgram(program);

    gl.bindVertexArray(vao);

    let aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    let projectionMatrix =
        m4.perspective(fieldOfViewRadians, aspect, 1, 2000);

        let cameraPosition = [0, 0, 2];
        let up = [0, 1, 0];
        let target = [0, 0, 0];
 
    let cameraMatrix = m4.lookAt(cameraPosition, target, up);
 
    let viewMatrix = m4.inverse(cameraMatrix);

    let viewProjectionMatrix = m4.multiply(projectionMatrix, viewMatrix);

    let matrix = m4.xRotate(viewProjectionMatrix, modelXRotationRadians);
    matrix = m4.yRotate(matrix, modelYRotationRadians);
 
    gl.uniformMatrix4fv(matrixLocation, false, matrix);
 
    gl.uniform1i(textureLocation, 0);

 
    let primitiveType = gl.TRIANGLES;
    let offset = 0;
    let count = 6 * 6;
    gl.drawArrays(primitiveType, offset, count);

    requestAnimationFrame(drawScene);
  }
}

 window.addEventListener("load",()=>{main();});
 