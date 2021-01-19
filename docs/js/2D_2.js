 
let vertexShaderSource =/*glsl*/ `#version 300 es

in vec4 a_position;
in vec2 a_texcoord;

uniform mat4 u_matrix;
uniform mat4 u_textureMatrix;

out vec2 v_texcoord;

void main() {
  gl_Position = u_matrix * a_position;
  v_texcoord = (u_textureMatrix * vec4(a_texcoord, 0, 1)).xy;
}
`;

var fragmentShaderSource =/*glsl*/ `#version 300 es
precision highp float;

in vec2 v_texcoord;

uniform sampler2D u_texture;

out vec4 outColor;

void main() {
   outColor = texture(u_texture, v_texcoord);
}
`;

class MatrixStack{
    constructor(){
        this.stack = [];
        this.restore();
    }
    restore() {
        this.stack.pop();
        // Never let the stack be totally empty
        if (this.stack.length < 1) {
          this.stack[0] = m4.identity();
        }
    }
    save() {
        this.stack.push(this.getCurrentMatrix());
      };
      getCurrentMatrix() {
        return this.stack[this.stack.length - 1].slice(); // makes a copy
     };
      setCurrentMatrix = function(m) {
        this.stack[this.stack.length - 1] = m;
      };
      translate(x, y, z) {
        if (z === undefined)z = 0;
        let m = this.getCurrentMatrix();
        this.setCurrentMatrix(m4.translate(m, x, y, z));
      };
       rotateZ(angleInRadians) {
        let m = this.getCurrentMatrix();
        this.setCurrentMatrix(m4.zRotate(m, angleInRadians));
      }; 
      scale(x, y, z) {
        if (z === undefined)  z = 1;
        let m = this.getCurrentMatrix();
        this.setCurrentMatrix(m4.scale(m, x, y, z));
      };
}

function main() {
 
  let canvas = document.querySelector("#canvas");
  let gl = canvas.getContext("webgl2");
  if (!gl) {
      alert("No WebGL2!!");
    return;
  }

  let matrixStack = new MatrixStack();
 
  let program = webglUtils.createProgramFromSources(gl,
      [vertexShaderSource, fragmentShaderSource]);
 
   let positionAttributeLocation = gl.getAttribLocation(program, "a_position");
   let texcoordAttributeLocation = gl.getAttribLocation(program, "a_texcoord");
 
   let matrixLocation = gl.getUniformLocation(program, "u_matrix");
   let textureLocation = gl.getUniformLocation(program, "u_texture");
   let textureMatrixLocation = gl.getUniformLocation(program, "u_textureMatrix");
 
  let vao = gl.createVertexArray();
 
  gl.bindVertexArray(vao);
 
  let positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
 
  let positions = [
    0, 0,
    0, 1,
    1, 0,
    1, 0,
    0, 1,
    1, 1,
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
  // Put texcoords in the buffer
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
 
  function loadImageAndCreateTextureInfo(url) {
    let tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
 
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
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      gl.generateMipmap(gl.TEXTURE_2D);
    });
    img.src = url;

    return textureInfo;
  }

  let textureInfo = loadImageAndCreateTextureInfo('./texture/cat_2.jpg');
  function drawImage(
    tex, texWidth, texHeight,
    srcX, srcY, srcWidth, srcHeight,
    dstX, dstY, dstWidth, dstHeight) {
  if (dstX === undefined) {
    dstX = srcX;
  }
  if (dstY === undefined) {
    dstY = srcY;
  }
  if (srcWidth === undefined) {
    srcWidth = texWidth;
  }
  if (srcHeight === undefined) {
    srcHeight = texHeight;
  }
  if (dstWidth === undefined) {
    dstWidth = srcWidth;
  }
  if (dstHeight === undefined) {
    dstHeight = srcHeight;
  }

  gl.useProgram(program);
 
  gl.bindVertexArray(vao);

  let textureUnit = 0; 
  gl.uniform1i(textureLocation, textureUnit);
 
  gl.activeTexture(gl.TEXTURE0 + textureUnit);
  gl.bindTexture(gl.TEXTURE_2D, tex);
 
  let matrix = m4.orthographic(
      0, gl.canvas.clientWidth, gl.canvas.clientHeight, 0, -1, 1);
 
  matrix = m4.multiply(matrix, matrixStack.getCurrentMatrix());
 
  matrix = m4.translate(matrix, dstX, dstY, 0);
 
  matrix = m4.scale(matrix, dstWidth, dstHeight, 1);
 
  gl.uniformMatrix4fv(matrixLocation, false, matrix);

  let texMatrix = m4.translation(srcX / texWidth, srcY / texHeight, 0);
  texMatrix = m4.scale(texMatrix, srcWidth / texWidth, srcHeight / texHeight, 1);

 
  gl.uniformMatrix4fv(textureMatrixLocation, false, texMatrix);
 
  let offset = 0;
  let count = 6;
  gl.drawArrays(gl.TRIANGLES, offset, count);
}

  function draw(time) {
    webglUtils.resizeCanvasToDisplaySize(gl.canvas);
 
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
 
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    matrixStack.save();
    matrixStack.translate(gl.canvas.width / 2, gl.canvas.height / 2);
    matrixStack.rotateZ(time);

    matrixStack.save();
    {
      matrixStack.translate(textureInfo.width / -2, textureInfo.height / -2);

      drawImage(
        textureInfo.texture,
        textureInfo.width,
        textureInfo.height,
        0, 0);

    }
     matrixStack.restore();

     matrixStack.save();
     { 
       matrixStack.translate(textureInfo.width / -2, textureInfo.height / -2);
       matrixStack.rotateZ(Math.sin(time * 2.2));
       matrixStack.scale(0.2, 0.2);
    
       matrixStack.translate(-textureInfo.width, -textureInfo.height);
 
       drawImage(
         textureInfo.texture,
         textureInfo.width,
         textureInfo.height,
         0, 0);
 
     }
     matrixStack.restore();

     matrixStack.save();
     { 
       matrixStack.translate(textureInfo.width / 2, textureInfo.height / -2);
       matrixStack.rotateZ(Math.sin(time * 2.3));
       matrixStack.scale(0.2, 0.2); 
       matrixStack.translate(0, -textureInfo.height);
 
       drawImage(
         textureInfo.texture,
         textureInfo.width,
         textureInfo.height,
         0, 0);
 
     }
     matrixStack.restore();

     matrixStack.save();
     { 
       matrixStack.translate(textureInfo.width / -2, textureInfo.height / 2);
       matrixStack.rotateZ(Math.sin(time * 2.4));
       matrixStack.scale(0.2, 0.2);
      
       matrixStack.translate(-textureInfo.width, 0);
 
       drawImage(
         textureInfo.texture,
         textureInfo.width,
         textureInfo.height,
         0, 0);
 
     }
     matrixStack.restore();

     matrixStack.save();
     { 
       matrixStack.translate(textureInfo.width / 2, textureInfo.height / 2);
       matrixStack.rotateZ(Math.sin(time * 2.5));
       matrixStack.scale(0.2, 0.2); 
       matrixStack.translate(0, 0);   
 
       drawImage(
         textureInfo.texture,
         textureInfo.width,
         textureInfo.height,
         0, 0);
 
     }
     matrixStack.restore();

    matrixStack.restore();
    matrixStack.restore();
     
  }

  function render(time) {
    time *= 0.001;

    draw(time);

    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);


}

window.addEventListener("load",()=>{main();});
