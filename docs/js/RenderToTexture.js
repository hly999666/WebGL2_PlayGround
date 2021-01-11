 
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

var fragmentShaderSource =/*glsl*/  `#version 300 es

precision highp float;
 
in vec2 v_texcoord;

 
uniform sampler2D u_texture;
uniform vec4 u_colorMult;
 
out vec4 outColor;

void main() {
   outColor = vec4(texture(u_texture, v_texcoord).rrr, 1) * u_colorMult;
}
`;
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
  }
   
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

  function degToRad(d) {
    return d * Math.PI / 180;
  }
function main() {
 
  let canvas = document.querySelector("#canvas");
  let gl = canvas.getContext("webgl2");
  if (!gl) {
      alert("No WebGL2!!!");
    return;
  }
 
  let program = webglUtils.createProgramFromSources(gl,
      [vertexShaderSource, fragmentShaderSource]);
 
  let positionAttributeLocation = gl.getAttribLocation(program, "a_position");
  let texcoordAttributeLocation = gl.getAttribLocation(program, "a_texcoord");

  let matrixLocation = gl.getUniformLocation(program, "u_matrix");
  let textureLocation = gl.getUniformLocation(program, "u_texture");
  let colorMultLocation = gl.getUniformLocation(program, "u_colorMult");
 
  let positionBuffer = gl.createBuffer();
 
  let vao = gl.createVertexArray();
 
  gl.bindVertexArray(vao);
 
  gl.enableVertexAttribArray(positionAttributeLocation);
 
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
 
  {
    const level = 0;
    const internalFormat = gl.R8;
    const width = 3;
    const height = 2;
    const border = 0;
    const format = gl.RED;
    const type = gl.UNSIGNED_BYTE;
    const data = new Uint8Array([
      128,  64, 128,
        0, 192,   0,
    ]);
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, width, height, border,
                  format, type, data);
  }
 
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  // create texture for render
  const targetTextureWidth = 256;
  const targetTextureHeight = 256;
  const targetTexture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, targetTexture);

  { 
    const level = 0;
    const internalFormat = gl.RGBA;
    const border = 0;
    const format = gl.RGBA;
    const type = gl.UNSIGNED_BYTE;
    const data = null;
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                  targetTextureWidth, targetTextureHeight, border,
                  format, type, data);

    
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  }

  // create  framebuffer
  const fb = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, fb);

  // attach color texture
  const attachmentPoint = gl.COLOR_ATTACHMENT0;
  const level = 0;
  gl.framebufferTexture2D(gl.FRAMEBUFFER, attachmentPoint, gl.TEXTURE_2D, targetTexture, level);

 
  const depthTexture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, depthTexture);
 
  {
 
    const level = 0;
    const internalFormat = gl.DEPTH_COMPONENT24;
    const border = 0;
    const format = gl.DEPTH_COMPONENT;
    const type = gl.UNSIGNED_INT;
    const data = null;
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                  targetTextureWidth, targetTextureHeight, border,
                  format, type, data);
 
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
 
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, depthTexture, level);
  }



  let fieldOfViewRadians = degToRad(60);
  let modelXRotationRadians = degToRad(0);
  let modelYRotationRadians = degToRad(0);
 
  let then = 0;

  requestAnimationFrame(drawScene);

  function drawCube(aspect) {
    
    gl.useProgram(program);
 
    gl.bindVertexArray(vao);
 
    let projectionMatrix =
        m4.perspective(fieldOfViewRadians, aspect, 1, 2000);

    let cameraPosition = [0, 0, 2];
    let up = [0, 1, 0];
    let target = [0, 0, 0];
 
    let cameraMatrix = m4.lookAt(cameraPosition, target, up);
 
    let viewMatrix = m4.inverse(cameraMatrix);

    let viewProjectionMatrix = m4.multiply(projectionMatrix, viewMatrix);

    for (let x = -1; x <= 1; ++x) {
        let matrix = m4.translate(viewProjectionMatrix, x * .9, 0, 0);
      matrix = m4.xRotate(matrix, modelXRotationRadians * x);
      matrix = m4.yRotate(matrix, modelYRotationRadians * x);
 
      gl.uniformMatrix4fv(matrixLocation, false, matrix);
 
      gl.uniform1i(textureLocation, 0);

      const c = x * .5 + .5;
      gl.uniform4fv(colorMultLocation, [c * .5 + .5, 1, 1 - c, 1]);

      
      let primitiveType = gl.TRIANGLES;
      let offset = 0;
      let count = 6 * 6;
      gl.drawArrays(primitiveType, offset, count);
    }
  }

  function drawScene(time) {
   
    time *= 0.001;
    let deltaTime = time - then;
  
    
    then = time;
 
    modelYRotationRadians += -0.7 * deltaTime;
    modelXRotationRadians += -0.4 * deltaTime;

    webglUtils.resizeCanvasToDisplaySize(gl.canvas);

    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);
    //render texture
    { 
      gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
 
      gl.bindTexture(gl.TEXTURE_2D, texture);
 
      gl.viewport(0, 0, targetTextureWidth, targetTextureHeight);
 
      gl.clearColor(.5, .7, 1, 1);   
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      const aspect = targetTextureWidth / targetTextureHeight;
      drawCube(aspect);
    }
    //render scene
    {
    
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
 
      gl.bindTexture(gl.TEXTURE_2D, targetTexture);
 
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
 
      gl.clearColor(0.6, 0.6, 0.6, 1);    
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


      const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
      drawCube(aspect);
    }

    requestAnimationFrame(drawScene);
  }
}
 

window.addEventListener("load",()=>{main();});