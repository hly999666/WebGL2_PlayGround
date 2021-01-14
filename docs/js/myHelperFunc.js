
function makeCheckerBoardTexture(gl)
{
  let checkerboardTexture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, checkerboardTexture);
  gl.texImage2D(
      gl.TEXTURE_2D,
      0,           
      gl.LUMINANCE,      
      8,               
      8,                 
      0,                
      gl.LUMINANCE,    
      gl.UNSIGNED_BYTE,  
      new Uint8Array([  
        0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC,
        0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF,
        0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC,
        0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF,
        0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC,
        0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF,
        0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC,
        0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF,
      ]));
  gl.generateMipmap(gl.TEXTURE_2D);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

  return checkerboardTexture;
}
function renderTexturePlane(gl,image,isTexture){
    let vertexShaderSource = /*glsl*/`#version 300 es
    in vec2 a_position;
    in vec2 a_texCoord;
    out vec2 v_texCoord;
    void main() {
    //pixel to clipSpace
      gl_Position = vec4(a_position,0.0,1.0);
     
      v_texCoord = a_texCoord;
    }
    `;
    let fragmentShaderSource = /*glsl*/ `#version 300 es
    precision highp float;
    
    uniform sampler2D u_image;
    in vec2 v_texCoord;
    out vec4 outColor;
    void main() {
    // outColor = texture(u_image,v_texCoord);
    vec4 tex_col=texture(u_image,v_texCoord);
    float z=tex_col.r;
    float d=z;
    //d=d*0.5;
    outColor = vec4(d,d,d,1.0);
    }
    `;
  let program = webglUtils.createProgramFromSources(gl,
    [vertexShaderSource, fragmentShaderSource]);
 let positionAttributeLocation = gl.getAttribLocation(program, "a_position");
 let texCoordAttributeLocation = gl.getAttribLocation(program, "a_texCoord");
 let imageLocation = gl.getUniformLocation(program, "u_image");


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

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1.0, 1.0,
      1.0, -1.0,
      1.0, 1.0,
      -1.0, 1.0,
       -1.0, -1.0,
       1.0, -1.0
  ]), gl.STATIC_DRAW);
  
   // handle texCoord  

   let texCoordBuffer = gl.createBuffer();
   gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
   gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    0.0, 0.0,
    1.0, 1.0,
    1.0, 0.0,
    0.0, 0.0,
    0.0, 1.0,
    1.0, 1.0
   ]), gl.STATIC_DRAW);
 
   gl.enableVertexAttribArray(texCoordAttributeLocation);
 
     size = 2;          
    type = gl.FLOAT;  
    normalize = false;  
    stride = 0;       
    offset = 0;     
  gl.vertexAttribPointer(
      texCoordAttributeLocation, size, type, normalize, stride, offset);

     let texture=image;


      //webglUtils.resizeCanvasToDisplaySize(gl.canvas);


// set up clear state 

//gl.clearColor(0.8, 0.8, 0.0, 1.0);
gl.bindFramebuffer(gl.FRAMEBUFFER, null);   
gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  /*finish setup */
  // bind progrom and vao 

  gl.useProgram(program);
  
  gl.bindVertexArray(vao);
  //bind uniform  
  gl.uniform1i(imageLocation, 8);
  gl.activeTexture(gl.TEXTURE0 + 8);
  gl.bindTexture(gl.TEXTURE_2D, texture);
 /*  gl.disable(gl.CULL_FACE);
  gl.disable(gl.DEPTH_TEST); */
  let primitiveType = gl.TRIANGLES;
  offset = 0;
 let count = 6;
 gl.drawArrays(primitiveType, offset, count);
/*  gl.enable(gl.CULL_FACE);
 gl.enable(gl.DEPTH_TEST); */
}

/* 
window.addEventListener("load",()=>{
   
  let gl = canvas.getContext("webgl2");
  renderTexturePlane(gl);
}); */