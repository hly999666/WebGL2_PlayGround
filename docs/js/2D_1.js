
let vertexShaderSource = /*glsl*/`#version 300 es

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

let fragmentShaderSource = /*glsl*/ `#version 300 es
precision highp float;

in vec2 v_texcoord;

uniform sampler2D u_texture;

out vec4 outColor;

void main() {
   if (v_texcoord.x < 0.0 ||
       v_texcoord.y < 0.0 ||
       v_texcoord.x > 1.0 ||
       v_texcoord.y > 1.0) {
     outColor = vec4(0.8,0.8, 0.9,1.0); // blue
     return;
   }

   outColor = texture(u_texture, v_texcoord);
}
`;

function main() {
 
  let canvas = document.querySelector("#canvas");
  let gl = canvas.getContext("webgl2");
  if (!gl) {
      alert("No WebGL2!!");
    return;
  }
 
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
      width: 1,   // we don't know the size until it loads
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

  let textureInfos = [
    loadImageAndCreateTextureInfo('./texture/cat_1.jpg'),
    loadImageAndCreateTextureInfo('./texture/cat_2.jpg'),
    loadImageAndCreateTextureInfo('./texture/cat_3.jpg'),
  ];

  let drawInfos = [];
  let numToDraw = 9;
  let speed = 60;
  for (var ii = 0; ii < numToDraw; ++ii) {
    let scale = Math.random() * 0.25 + 0.25;
    let drawInfo = {
      x: Math.random() * gl.canvas.width,
      y: Math.random() * gl.canvas.height,
      dx: Math.random() > 0.5 ? -1 : 1,
      dy: Math.random() > 0.5 ? -1 : 1,
      xScale: scale,
      yScale: scale,
      offX: 0,
      offY: 0,
      rotation: Math.random() * Math.PI * 2,
      deltaRotation: (0.5 + Math.random() * 0.5) * (Math.random() > 0.5 ? -1 : 1),
      width:  1,
      height: 1,
      textureInfo: textureInfos[Math.random() * textureInfos.length | 0],
    };
    drawInfos.push(drawInfo);
  }
  function drawImage(
    tex, texWidth, texHeight,
    srcX, srcY, srcWidth, srcHeight,
    dstX, dstY, dstWidth, dstHeight,
    srcRotation) {
  if (dstX === undefined) {
    dstX = srcX;
    srcX = 0;
  }
  if (dstY === undefined) {
    dstY = srcY;
    srcY = 0;
  }
  if (srcWidth === undefined) {
    srcWidth = texWidth;
  }
  if (srcHeight === undefined) {
    srcHeight = texHeight;
  }
  if (dstWidth === undefined) {
    dstWidth = srcWidth;
    srcWidth = texWidth;
  }
  if (dstHeight === undefined) {
    dstHeight = srcHeight;
    srcHeight = texHeight;
  }
  if (srcRotation === undefined) {
    srcRotation = 0;
  }

  gl.useProgram(program);
 
  gl.bindVertexArray(vao);

  let textureUnit = 0; 
  gl.uniform1i(textureLocation, textureUnit);
 
  gl.activeTexture(gl.TEXTURE0 + textureUnit);
  gl.bindTexture(gl.TEXTURE_2D, tex);
 
  let matrix = m4.orthographic(
      0, gl.canvas.clientWidth, gl.canvas.clientHeight, 0, -1, 1);
 
  matrix = m4.translate(matrix, dstX, dstY, 0);
 
  matrix = m4.scale(matrix, dstWidth, dstHeight, 1);
 
  gl.uniformMatrix4fv(matrixLocation, false, matrix);
 
  let texMatrix = m4.scaling(1 / texWidth, 1 / texHeight, 1);
 
    texMatrix = m4.translate(texMatrix, texWidth * 0.5, texHeight * 0.5, 0);
    texMatrix = m4.zRotate(texMatrix, srcRotation);
    texMatrix = m4.translate(texMatrix, texWidth * -0.5, texHeight * -0.5, 0);
 
    texMatrix = m4.translate(texMatrix, srcX, srcY, 0);
    texMatrix = m4.scale(texMatrix, srcWidth, srcHeight, 1);
 
  gl.uniformMatrix4fv(textureMatrixLocation, false, texMatrix);
 
  let offset = 0;
  let count = 6;
  gl.drawArrays(gl.TRIANGLES, offset, count);
}

  function update(deltaTime) {
    drawInfos.forEach(function(drawInfo) {
      drawInfo.x += drawInfo.dx * speed * deltaTime;
      drawInfo.y += drawInfo.dy * speed * deltaTime;
      if (drawInfo.x < 0) {
        drawInfo.dx = 1;
      }
      if (drawInfo.x >= gl.canvas.width) {
        drawInfo.dx = -1;
      }
      if (drawInfo.y < 0) {
        drawInfo.dy = 1;
      }
      if (drawInfo.y >= gl.canvas.height) {
        drawInfo.dy = -1;
      }
      drawInfo.rotation += drawInfo.deltaRotation * deltaTime;
    });
  }

  function draw() {
    webglUtils.resizeCanvasToDisplaySize(gl.canvas);
   
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
 
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    drawInfos.forEach(function(drawInfo) {
        let dstX      = drawInfo.x;
        let dstY      = drawInfo.y;
        let dstWidth  = drawInfo.textureInfo.width  * drawInfo.xScale;
        let dstHeight = drawInfo.textureInfo.height * drawInfo.yScale;

        let srcX      = drawInfo.textureInfo.width  * drawInfo.offX;
        let srcY      = drawInfo.textureInfo.height * drawInfo.offY;
        let srcWidth  = drawInfo.textureInfo.width  * drawInfo.width;
        let srcHeight = drawInfo.textureInfo.height * drawInfo.height;

      drawImage(
        drawInfo.textureInfo.texture,
        drawInfo.textureInfo.width,
        drawInfo.textureInfo.height,
        srcX, srcY, srcWidth, srcHeight,
        dstX, dstY, dstWidth, dstHeight,
        drawInfo.rotation);
    });
  }

  let then = 0;
  function render(time) {
    var now = time * 0.001;
    var deltaTime = Math.min(0.1, now - then);
    then = now;

    update(deltaTime);
    draw();

    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
 
  
}

window.addEventListener("load",()=>{main();})