 
let vertexShaderSource =/*glsl*/ `#version 300 es
 
in vec2 a_position;
in vec2 a_texCoord;
 
uniform vec2 u_resolution;
 
out vec2 v_texCoord;

// all shaders have a main function
void main() {
    v_texCoord = a_texCoord;

  vec2 zeroToOne = a_position / u_resolution;

 
  vec2 zeroToTwo = zeroToOne * 2.0;
 
  vec2 clipSpace = zeroToTwo - 1.0;

  gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
 

}
`;

let fragmentShaderSource =/*glsl*/ `#version 300 es
 
precision highp float;
 
uniform sampler2D u_image0;
uniform sampler2D u_image1;
 
in vec2 v_texCoord; 
out vec4 outColor;

void main() {
  vec4 color0 = texture(u_image0, v_texCoord);
  vec4 color1 = texture(u_image1, v_texCoord);
  outColor = color0 * color1;
}
`;

function loadImage(url, callback) {
  var image = new Image();
  image.src = url;
  image.onload = callback;
  return image;
}

function loadImages(urls, callback) {
  var images = [];
  var imagesToLoad = urls.length;
 
  var onImageLoad = function() {
    --imagesToLoad; 
    if (imagesToLoad === 0) {
      callback(images);
    }
  };

  for (var ii = 0; ii < imagesToLoad; ++ii) {
    var image = loadImage(urls[ii], onImageLoad);
    images.push(image);
  }
}

function main() {
  loadImages([
    "./texture/leaves.jpg",
    "./texture/star.jpg",
  ], render);
}
function setRectangle(gl, x, y, width, height) {
    var x1 = x;
    var x2 = x + width;
    var y1 = y;
    var y2 = y + height;
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
       x1, y1,
       x2, y1,
       x1, y2,
       x1, y2,
       x2, y1,
       x2, y2,
    ]), gl.STATIC_DRAW);
  }


function render(images) { 
  let  canvas = document.querySelector("#canvas");
  let gl = canvas.getContext("webgl2");
  if (!gl) {
      alert("No webgl2");
    return;
  }

  
  let program = webglUtils.createProgramFromSources(gl,
      [vertexShaderSource, fragmentShaderSource]);
 
  let positionAttributeLocation = gl.getAttribLocation(program, "a_position");
  let texCoordAttributeLocation = gl.getAttribLocation(program, "a_texCoord");

 
  let resolutionLocation = gl.getUniformLocation(program, "u_resolution");
  let u_image0Location = gl.getUniformLocation(program, "u_image0");
  let u_image1Location = gl.getUniformLocation(program, "u_image1");
 
  let vao = gl.createVertexArray(); 
  gl.bindVertexArray(vao);
 
  let positionBuffer = gl.createBuffer();
 
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
 
  gl.enableVertexAttribArray(positionAttributeLocation);
 
  let size = 2;       
  let type = gl.FLOAT;   
  let normalize = false; 
  let stride = 0;       
  let offset = 0;    
  gl.vertexAttribPointer(
      positionAttributeLocation, size, type, normalize, stride, offset);

 
  let texCoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      0.0,  0.0,
      1.0,  0.0,
      0.0,  1.0,
      0.0,  1.0,
      1.0,  0.0,
      1.0,  1.0,
  ]), gl.STATIC_DRAW);
 
  gl.enableVertexAttribArray(texCoordAttributeLocation);

 
    size = 2;        
    type = gl.FLOAT;   
    normalize = false;  
    stride = 0;    
    offset = 0;     
  gl.vertexAttribPointer(
      texCoordAttributeLocation, size, type, normalize, stride, offset);

  
  let textures = [];
  for (let ii = 0; ii < 2; ++ii) {
    let texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

 
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
 
    let mipLevel = 0;            
    let internalFormat = gl.RGBA;  
    let srcFormat = gl.RGBA;         
    let srcType = gl.UNSIGNED_BYTE;  
    gl.texImage2D(gl.TEXTURE_2D,
                  mipLevel,
                  internalFormat,
                  srcFormat,
                  srcType,
                  images[ii]); 
    textures.push(texture);
  }
 
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
 
  setRectangle(gl, 0, 0, images[0].width*4, images[0].height*4);

  webglUtils.resizeCanvasToDisplaySize(gl.canvas);
 
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
 
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
 
  gl.useProgram(program);
  
  gl.bindVertexArray(vao);
 
  gl.uniform2f(resolutionLocation, gl.canvas.width, gl.canvas.height);
 
  gl.uniform1i(u_image0Location, 0);  
  gl.uniform1i(u_image1Location, 1);  
 
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, textures[0]);
  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, textures[1]);
 
  let primitiveType = gl.TRIANGLES;
  let v_offset = 0;
  let count = 6;
  gl.drawArrays(primitiveType, v_offset, count);
}

window.addEventListener("load",()=>{main();});

