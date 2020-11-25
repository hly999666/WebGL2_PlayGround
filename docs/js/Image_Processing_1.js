let vertexShaderSource = /*glsl*/`#version 300 es


in vec2 a_position;
in vec2 a_texCoord;

uniform vec2 u_resolution;

out vec2 v_texCoord;


void main() {

//pixel to clipSpace
  vec2 zeroToOne = a_position / u_resolution;

  vec2 zeroToTwo = zeroToOne * 2.0;

  vec2 clipSpace = zeroToTwo - 1.0;
// reverse y axial
  gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
 
  v_texCoord = a_texCoord;
}
`;

let fragmentShaderSource = /*glsl*/ `#version 300 es
precision highp float;

uniform sampler2D u_image;

in vec2 v_texCoord;

out vec4 outColor;

void main() {
    vec4 color= texture(u_image, v_texCoord);
    float r=color.r;
    color.r=color.g;
    color.g=r;
  outColor =color;
}
`;

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
       x2, y2,
    ]), gl.STATIC_DRAW);
  }
  
 function renderImage(image){
   // setup webgl
   let canvas = document.querySelector("#canvas");
   let gl = canvas.getContext("webgl2");
  if (!gl) {
    return;
  }

  // setup GLSL program
  let program = webglUtils.createProgramFromSources(gl,
      [vertexShaderSource, fragmentShaderSource]);

    //get location in shader
    let positionAttributeLocation = gl.getAttribLocation(program, "a_position");
    let texCoordAttributeLocation = gl.getAttribLocation(program, "a_texCoord");
    let resolutionLocation = gl.getUniformLocation(program, "u_resolution");
    let imageLocation = gl.getUniformLocation(program, "u_image");


  // create vao to contain data
  let vao = gl.createVertexArray();
  gl.bindVertexArray(vao);

   // handle position 
   let positionBuffer = gl.createBuffer();

   gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
     size = 2;           
     type = gl.FLOAT;   
     normalize = false;  
     stride = 0;      
     offset = 0; 
  // set up pointer method(how to pull out data from buffer) ,note don't need actual data in GPU
  
  gl.enableVertexAttribArray(positionAttributeLocation);
  gl.vertexAttribPointer(
    positionAttributeLocation, size, type, normalize, stride, offset);

   // handle texCoord  

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
 //set up texture 
 let texture = gl.createTexture();
 gl.activeTexture(gl.TEXTURE0 + 0);
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
               image);

// set up viewport 
webglUtils.resizeCanvasToDisplaySize(gl.canvas);
gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

// set up clear state 
gl.clearColor(0, 0, 0, 0);
gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  /*finish setup */
  // bind progrom and vao 
  gl.useProgram(program);
  gl.bindVertexArray(vao);
  //bind uniform 
  gl.uniform2f(resolutionLocation, gl.canvas.width, gl.canvas.height);
  gl.uniform1i(imageLocation, 0);
  //bind buffer  and send pos data to GPU

   gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

   setRectangle(gl, 0, 0, image.width*2, image.height*2);
  //set position data to GPU 

  // Draw cell 
  let primitiveType = gl.TRIANGLES;
   offset = 0;
  let count = 6;
  gl.drawArrays(primitiveType, offset, count);
 

}
window.addEventListener("load",()=>{

    let image = new Image();
    image.src = "./texture/leaves.jpg";  // MUST BE SAME DOMAIN!!!
    image.onload = function() {
    renderImage(image);
  };
  });