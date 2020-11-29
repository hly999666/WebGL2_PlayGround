let vertexShaderSource = /*glsl*/`#version 300 es
 
in vec2 a_position;
in vec2 a_texCoord;
 
uniform vec2 u_resolution;
//uniform float u_flipY;
uniform int image_H;
out vec2 v_texCoord;
 //out vec4 debug_color;
void main() {
 //map a_position to clipspace
  vec2 zeroToOne = a_position / u_resolution;
  
  vec2 zeroToTwo = zeroToOne * 2.0;
  float y_offset=float(image_H)/u_resolution.y;
  y_offset= y_offset* 2.0;y_offset=1.0-y_offset;
  vec2 clipSpace =vec2(zeroToTwo.x-1.0,zeroToTwo.y +y_offset);
  v_texCoord = a_texCoord;
  //debug_color=vec4(image_H,image_H,image_H,1.0);
  gl_Position = vec4(clipSpace, 0, 1);
}
`;



let fragmentShaderSource =/*glsl*/  `#version 300 es

 
precision highp float;
 
uniform sampler2D u_image;
 
uniform float u_kernel[9];
uniform float u_kernelWeight;

 
in vec2 v_texCoord;
 
out vec4 outColor;

void main() {
    //find next pixel in cilpspace
  vec2 onePixel = vec2(1.0,1.0) / vec2(textureSize(u_image, 0));
//note:in clipSpace ,texture y is reverse 
 
//apply 2D convolution
  vec4 colorSum =
      texture(u_image, v_texCoord + onePixel * vec2(-1, -1)) * u_kernel[0] +
      texture(u_image, v_texCoord + onePixel * vec2( 0, -1)) * u_kernel[1] +
      texture(u_image, v_texCoord + onePixel * vec2( 1, -1)) * u_kernel[2] +
      texture(u_image, v_texCoord + onePixel * vec2(-1,  0)) * u_kernel[3] +
      texture(u_image, v_texCoord + onePixel * vec2( 0,  0)) * u_kernel[4] +
      texture(u_image, v_texCoord + onePixel * vec2( 1,  0)) * u_kernel[5] +
      texture(u_image, v_texCoord + onePixel * vec2(-1,  1)) * u_kernel[6] +
      texture(u_image, v_texCoord + onePixel * vec2( 0,  1)) * u_kernel[7] +
      texture(u_image, v_texCoord + onePixel * vec2( 1,  1)) * u_kernel[8] ;
  outColor = vec4((colorSum / u_kernelWeight).rgb, 1);
}
`;

function main() {
  let image = new Image();
  image.src = "./texture/leaves.jpg";  // must from same source 
  image.onload = function() {
    render(image);
  };
}
//produce rect vertex position
function setRectangle(gl, x, y, width, height,positionBuffer) {
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
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

  let kernels = {
    normal: [
      0, 0, 0,
      0, 1, 0,
      0, 0, 0,
    ],
    gaussianBlur: [
      0.045, 0.122, 0.045,
      0.122, 0.332, 0.122,
      0.045, 0.122, 0.045,
    ],
    gaussianBlur2: [
      1, 2, 1,
      2, 4, 2,
      1, 2, 1,
    ],
    gaussianBlur3: [
      0, 1, 0,
      1, 1, 1,
      0, 1, 0,
    ],
    unsharpen: [
      -1, -1, -1,
      -1,  9, -1,
      -1, -1, -1,
    ],
    sharpness: [
       0, -1,  0,
      -1,  5, -1,
       0, -1,  0,
    ],
    sharpen: [
       -1, -1, -1,
       -1, 16, -1,
       -1, -1, -1,
    ],
    edgeDetect: [
       -0.125, -0.125, -0.125,
       -0.125,  1,     -0.125,
       -0.125, -0.125, -0.125,
    ],
    edgeDetect2: [
       -1, -1, -1,
       -1,  8, -1,
       -1, -1, -1,
    ],
    edgeDetect3: [
       -5, 0, 0,
        0, 0, 0,
        0, 0, 5,
    ],
    edgeDetect4: [
       -1, -1, -1,
        0,  0,  0,
        1,  1,  1,
    ],
    edgeDetect5: [
       -1, -1, -1,
        2,  2,  2,
       -1, -1, -1,
    ],
    edgeDetect6: [
       -5, -5, -5,
       -5, 39, -5,
       -5, -5, -5,
    ],
    sobelHorizontal: [
        1,  2,  1,
        0,  0,  0,
       -1, -2, -1,
    ],
    sobelVertical: [
        1,  0, -1,
        2,  0, -2,
        1,  0, -1,
    ],
    previtHorizontal: [
        1,  1,  1,
        0,  0,  0,
       -1, -1, -1,
    ],
    previtVertical: [
        1,  0, -1,
        1,  0, -1,
        1,  0, -1,
    ],
    boxBlur: [
        0.111, 0.111, 0.111,
        0.111, 0.111, 0.111,
        0.111, 0.111, 0.111,
    ],
    triangleBlur: [
        0.0625, 0.125, 0.0625,
        0.125,  0.25,  0.125,
        0.0625, 0.125, 0.0625,
    ],
    emboss: [
       -2, -1,  0,
       -1,  1,  1,
        0,  1,  2,
    ],
  };
  function computeKernelWeight(kernel) {
    let weight = kernel.reduce(function(prev, curr) {
        return prev + curr;
    });
    return weight <= 0 ? 1 : weight;
  }



function render(image) {


 //set up webgl
  let canvas = document.querySelector("#canvas");
  let gl = canvas.getContext("webgl2");
  if (!gl) {
      alert("No WebGL2");
    return;
  }
  let program = webglUtils.createProgramFromSources(gl,
      [vertexShaderSource, fragmentShaderSource]);

 //find Attribute
  let positionAttributeLocation = gl.getAttribLocation(program, "a_position");
  let texCoordAttributeLocation = gl.getAttribLocation(program, "a_texCoord");

  // find uniforms
  let resolutionLocation = gl.getUniformLocation(program, "u_resolution");

  let imageLocation = gl.getUniformLocation(program, "u_image");
  let kernelLocation = gl.getUniformLocation(program, "u_kernel[0]");
  let kernelWeightLocation = gl.getUniformLocation(program, "u_kernelWeight");

  let image_H_Location = gl.getUniformLocation(program, "image_H");
//create vao
  let vao = gl.createVertexArray();
  gl.bindVertexArray(vao);

  // handle position buffer  
  let positionBuffer = gl.createBuffer();

  gl.enableVertexAttribArray(positionAttributeLocation);

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  let size = 2;        
  let type = gl.FLOAT;   
  let normalize = false; 
  let stride = 0;      
  let offset = 0;         
  gl.vertexAttribPointer(
      positionAttributeLocation, size, type, normalize, stride, offset);

  // handle texCoord buffer .
  let texCoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
  //top-right as position direction as framebuffer
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      0.0,  0.0,
      1.0,  0.0,
      0.0, 1.0,
      0.0,  1.0,
      1.0, 0.0,
      1.0,  1.0
  ]), gl.STATIC_DRAW);

  gl.enableVertexAttribArray(texCoordAttributeLocation);

    size = 2;          
    type = gl.FLOAT;  
    normalize = false; 
    stride = 0;        
    offset = 0;       
  gl.vertexAttribPointer(
      texCoordAttributeLocation, size, type, normalize, stride, offset);

  function createAndSetupTexture(gl) {
    let texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
 
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    return texture;
  }

  // create a texture  
  let originalImageTexture = createAndSetupTexture(gl);
  //flip input texture so its direction is aligned with framebuffer
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true); 
  // upload the image to GPU
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

  // create 2 textures and attach them to seperate framebuffers.
  let textures = [];
  let framebuffers = [];
  for (let ii = 0; ii < 2; ++ii) {
    let texture = createAndSetupTexture(gl);
  
   
    textures.push(texture);
 
    let mipLevel = 0;            
    let internalFormat = gl.RGBA;   
    let border = 0;           
    let srcFormat = gl.RGBA;        
    let srcType = gl.UNSIGNED_BYTE;  
    let data = null;                
    gl.texImage2D(
        gl.TEXTURE_2D, mipLevel, internalFormat, image.width, image.height, border,
        srcFormat, srcType, data);

    // create a framebuffer
    let fbo = gl.createFramebuffer();
    framebuffers.push(fbo);
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);

    // Attach a texture to it.
    let attachmentPoint = gl.COLOR_ATTACHMENT0;
//note :render to framebuffer must have a a texture so it can be shader processing
    gl.framebufferTexture2D(
        gl.FRAMEBUFFER, attachmentPoint, gl.TEXTURE_2D, texture, mipLevel);
  }

  //  create rect position and send to GPU
 

  // Set a rectangle the same size as the image.
  gl.useProgram(program);
  setRectangle(gl, 0, 0, image.width*2, image.height*2,positionBuffer);
  gl.uniform1i(image_H_Location,image.height*2);
  // Define several convolution kernels


  let effects = [
    { name: "gaussianBlur3", on: true },
    { name: "gaussianBlur3", on: true },
    { name: "gaussianBlur3", on: true },
    { name: "sharpness", },
    { name: "sharpness", },
    { name: "sharpness", },
    { name: "sharpen", },
    { name: "sharpen", },
    { name: "sharpen", },
    { name: "unsharpen", },
    { name: "unsharpen", },
    { name: "unsharpen", },
    { name: "emboss", on: true },
    { name: "edgeDetect", },
    { name: "edgeDetect", },
    { name: "edgeDetect3", },
    { name: "edgeDetect3", },
  ];

  // setup  ui.
  let ui = document.querySelector("#ui");
  let table = document.createElement("table");
  let tbody = document.createElement("tbody");
  for (var ii = 0; ii < effects.length; ++ii) {
    let effect = effects[ii];
    let tr = document.createElement("tr");
    let td = document.createElement("td");
    let chk = document.createElement("input");
    chk.value = effect.name;
    chk.type = "checkbox";
    if (effect.on) {
      chk.checked = "true";
    }
    chk.onchange = drawEffects;
    td.appendChild(chk);
    td.appendChild(document.createTextNode(effect.name));
    tr.appendChild(td);
    tbody.appendChild(tr);
  }
  table.appendChild(tbody);
  ui.appendChild(table);
  $("#ui table").tableDnD({onDrop: drawEffects});

  function setFramebuffer(fbo, width, height) {
    //bind fbo 
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);

   //set render size 
    gl.uniform2f(resolutionLocation, width, height);
    gl.viewport(0, 0, width, height);
  }

  function drawWithKernel(name) {
    // set the kernel and it's weight
    gl.uniform1fv(kernelLocation, kernels[name]);
    gl.uniform1f(kernelWeightLocation, computeKernelWeight(kernels[name]));

    // Draw the rectangle.
    let primitiveType = gl.TRIANGLES;
    let offset = 0;
    let count = 6;
    gl.drawArrays(primitiveType, offset, count);
  }

  function drawEffects() {
      //set up viewport
    webglUtils.resizeCanvasToDisplaySize(gl.canvas);

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
//set up clearColor
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    //bind shaderProgram
    gl.useProgram(program);

    // bind vao.
    gl.bindVertexArray(vao);
//bind texture
    gl.activeTexture(gl.TEXTURE0 + 0);
    gl.bindTexture(gl.TEXTURE_2D, originalImageTexture);
    gl.uniform1i(imageLocation, 0);
 

    // loop and ping pong apply effect
    let count = 0;
    for (let ii = 0; ii < tbody.rows.length; ++ii) {
        let checkbox = tbody.rows[ii].firstChild.firstChild;
      if (checkbox.checked) {
        // setup current framebuffers.
        setFramebuffer(framebuffers[count % 2], image.width, image.height);
        // draw on framebuffer 
        drawWithKernel(checkbox.value);

        //bind input texture to framebuffer
        gl.bindTexture(gl.TEXTURE_2D, textures[count % 2]);

        ++count;
      }
    }

     //set curent framebuffer to gl.canvas
    setFramebuffer(null, gl.canvas.width, gl.canvas.height);

    // Clear the canvas
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
   //note implicic using last time framebuffer texture

  //explicitly binding
  if(count==0){
    gl.bindTexture(gl.TEXTURE_2D, originalImageTexture);
  }else{
    gl.bindTexture(gl.TEXTURE_2D, textures[(count -1)% 2]);
  }
    drawWithKernel("normal");
  }

  


  drawEffects();

  
}



window.addEventListener("load",()=>{main();});