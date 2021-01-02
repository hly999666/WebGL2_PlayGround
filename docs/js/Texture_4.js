 
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


function main() {
 
  let canvas = document.querySelector("#canvas");
  let gl = canvas.getContext("webgl2");
  if (!gl) {
      alert("No WebGL2");
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
 
  let positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
 
  let positions = [
    -1, -1,
    -1,  1,
     1, -1,
     1, -1,
    -1,  1,
     1,  1,
  ];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

 
  gl.enableVertexAttribArray(positionAttributeLocation);
 
  let size = 2;         
  let type = gl.FLOAT;  
  let normalize = false; 
  let stride = 0;         
  let offset = 0;      
  gl.vertexAttribPointer(
      positionAttributeLocation, size, type, normalize, stride, offset);
 
  let texcoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
 
  let texcoords = [
    0, 0,
    0, 1,
    1, 0,
    1, 0,
    0, 1,
    1, 1,
  ];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texcoords), gl.STATIC_DRAW);
 
  gl.enableVertexAttribArray(texcoordAttributeLocation);
 
    size = 2;        
    type = gl.FLOAT;  
    normalize = true;  
    stride = 0;         
    offset = 0;         
  gl.vertexAttribPointer(
      texcoordAttributeLocation, size, type, normalize, stride, offset);

// from CORS permission  request
  function requestCORSIfNotSameOrigin(img, url) {
      //window.location.href
    if ((new URL(url)).origin !== window.location.origin) {
      img.crossOrigin = "";
    }
  }
 
  function loadImageAndCreateTextureInfo(url) {
    let tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    // Fill the texture with a 1x1 blue pixel.
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
                  new Uint8Array([0, 0, 255, 255]));

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    let textureInfo = {
      width: 1,    
      height: 1,
      texture: tex,
    };
    let img = new Image();
    img.addEventListener('load', function() {
      textureInfo.width = img.width;
      textureInfo.height = img.height;

      gl.bindTexture(gl.TEXTURE_2D, textureInfo.texture);
      //send loaded image
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      gl.generateMipmap(gl.TEXTURE_2D);
    });
    requestCORSIfNotSameOrigin(img, url);
    img.src = url;

    return textureInfo;
  }

  let texInfo = loadImageAndCreateTextureInfo('https://c1.staticflickr.com/9/8873/18598400202_3af67ef38f_q.jpg');
// finishing setup
  function render(time) {
    time *= 0.001; 

    webglUtils.resizeCanvasToDisplaySize(gl.canvas);
 
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    gl.clear(gl.COLOR_BUFFER_BIT);
 
    gl.useProgram(program); 
    gl.bindVertexArray(vao);

    let textureUnit = 0; 
    gl.uniform1i(textureLocation, textureUnit);
 
    gl.activeTexture(gl.TEXTURE0 + textureUnit);
    gl.bindTexture(gl.TEXTURE_2D, texInfo.texture);

    let aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    let matrix = m4.scaling(1, aspect, 1);
    matrix = m4.zRotate(matrix, time);
    matrix = m4.scale(matrix, 0.5, 0.5, 1);
 
    gl.uniformMatrix4fv(matrixLocation, false, matrix);
 
    gl.uniform1i(textureLocation, 0);

 
    let offset = 0;
    let count = 6;
    gl.drawArrays(gl.TRIANGLES, offset, count);

    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);

}
window.addEventListener("load",()=>{main();});
