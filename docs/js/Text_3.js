 
let fVertexShaderSource = /*glsl*/`#version 300 es
in vec4 a_position;
in vec4 a_color;

uniform mat4 u_matrix;

out vec4 v_color;

void main() {
  gl_Position = u_matrix * a_position;
  v_color = a_color;
}
`;

let fFragmentShaderSource = /*glsl*/`#version 300 es
precision highp float;

in vec4 v_color;

out vec4 outColor;

void main() {
  outColor = v_color;
}
`;

let textVertexShaderSource = /*glsl*/`#version 300 es
in vec4 a_position;
in vec2 a_texcoord;

uniform mat4 u_matrix;

out vec2 v_texcoord;

void main() { 
  gl_Position = u_matrix * a_position;
 
  v_texcoord = a_texcoord;
}
`;

var textFragmentShaderSource =/*glsl*/ `#version 300 es
precision highp float;
 
in vec2 v_texcoord;

uniform sampler2D u_texture;
uniform vec4 u_color;

out vec4 outColor;

void main() {
   outColor = texture(u_texture, v_texcoord) * u_color;
}
`;
function degToRad(d) {
    return d * Math.PI / 180;
  }
let textCtx = document.createElement("canvas").getContext("2d");
 
//draw text using canvas 2D API
function makeTextCanvas(text, width, height) {
  textCtx.canvas.width  = width;
  textCtx.canvas.height = height;
  textCtx.font = "40px monospace";
  textCtx.textAlign = "center";
  textCtx.textBaseline = "middle";
  textCtx.fillStyle = "white";
  textCtx.clearRect(0, 0, textCtx.canvas.width, textCtx.canvas.height);
  textCtx.fillText(text, width / 2, height / 2);
  return textCtx.canvas;
}

function main() { 
  let canvas = document.querySelector("#canvas");
  let gl = canvas.getContext("webgl2");
  if (!gl) {
    alert("No Webgl2!!!");
    return;
  }
 
  twgl.setAttributePrefix("a_");
 
  let fProgramInfo = twgl.createProgramInfo(
      gl, [fVertexShaderSource, fFragmentShaderSource]);
  let textProgramInfo = twgl.createProgramInfo(
      gl, [textVertexShaderSource, textFragmentShaderSource]);
 
  let fBufferInfo = twgl.primitives.create3DFBufferInfo(gl);
  let fVAO = twgl.createVAOFromBufferInfo(gl, fProgramInfo, fBufferInfo);
 
  let textBufferInfo = twgl.primitives.createXYQuadBufferInfo(gl, 1);
  let textVAO = twgl.createVAOFromBufferInfo(
      gl, textProgramInfo, textBufferInfo);
 
    //color and text for F
  let colors = [
    [0.0, 0.0, 0.0, 1], // 0
    [1.0, 0.0, 0.0, 1], // 1
    [0.0, 1.0, 0.0, 1], // 2
    [1.0, 1.0, 0.0, 1], // 3
    [0.0, 0.0, 1.0, 1], // 4
    [1.0, 0.0, 1.0, 1], // 5
    [0.0, 1.0, 1.0, 1], // 6
    [0.5, 0.5, 0.5, 1], // 7
    [0.5, 0.0, 0.0, 1], // 8
    [0.0, 0.0, 0.0, 1], // 9
    [0.5, 5.0, 0.0, 1], // 10
    [0.0, 5.0, 0.0, 1], // 11
    [0.5, 0.0, 5.0, 1], // 12,
    [0.0, 0.0, 5.0, 1], // 13,
    [0.5, 5.0, 5.0, 1], // 14,
    [0.0, 5.0, 5.0, 1], // 15,
  ];
 
  let textTextures = [
    "anna",   // 0
    "colin",  // 1
    "james",  // 2
    "danny",  // 3
    "kalin",  // 4
    "hiro",   // 5
    "eddie",  // 6
    "shu",    // 7
    "brian",  // 8
    "tami",   // 9
    "rick",   // 10
    "gene",   // 11
    "natalie",// 12,
    "evan",   // 13,
    "sakura", // 14,
    "kai",    // 15,
  ].map(function(name) {
    let textCanvas = makeTextCanvas(name, 100*2, 26*2);
    let textWidth  = textCanvas.width;
    let textHeight = textCanvas.height;
    let textTex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, textTex);
    //note flip_y because coordinate is different
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    //premultiply alpha for anti-aliasing
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    //pushing canvas 2D into texture directly
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textCanvas);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return {
      texture: textTex,
      width: textWidth,
      height: textHeight,
    };
  });

  let fUniforms = {
    u_matrix: m4.identity(),
  };

  let textUniforms = {
    u_matrix: m4.identity(),
//    u_texture: textTex,
  };

 

  let translation = [0, 30, 0];
  let rotation = [degToRad(190), degToRad(0), degToRad(0)];
  let scale = [1, 1, 1];
  let fieldOfViewRadians = degToRad(60);
  let rotationSpeed = 1.2;

  let then = 0;

  requestAnimationFrame(drawScene);

  function drawScene(time) {
  
    let now = time * 0.001; 
    let deltaTime = now - then; 
    then = now;

    twgl.resizeCanvasToDisplaySize(gl.canvas);
 
    rotation[1] += rotationSpeed * deltaTime;
 
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
 
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
 
    gl.enable(gl.DEPTH_TEST);
 
    gl.enable(gl.CULL_FACE);
     //draw model first with writing to z-buffer and no blending
    gl.disable(gl.BLEND);
    gl.depthMask(true);

 
    let aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    let zNear = 1;
    let zFar = 2000;
    let projectionMatrix = m4.perspective(fieldOfViewRadians, aspect, zNear, zFar);
 
    let cameraRadius = 360;
    let cameraPosition = [Math.cos(now) * cameraRadius, 0, Math.sin(now) * cameraRadius];
    let target = [0, 0, 0];
    let up = [0, 1, 0];
    let cameraMatrix = m4.lookAt(cameraPosition, target, up);
    let viewMatrix = m4.inverse(cameraMatrix);

    let textPositions = [];

    let spread = 170;
    for (let yy = -1; yy <= 1; ++yy) {
      for (let xx = -2; xx <= 2; ++xx) {
        let fViewMatrix = m4.translate(viewMatrix,
            translation[0] + xx * spread, translation[1] + yy * spread, translation[2]);
        fViewMatrix = m4.xRotate(fViewMatrix, rotation[0]);
        fViewMatrix = m4.yRotate(fViewMatrix, rotation[1] + yy * xx * 0.2);
        fViewMatrix = m4.zRotate(fViewMatrix, rotation[2] + now + (yy * 3 + xx) * 0.1);
        fViewMatrix = m4.scale(fViewMatrix, scale[0], scale[1], scale[2]);
        fViewMatrix = m4.translate(fViewMatrix, -50, -75, 0);
 
        textPositions.push([fViewMatrix[12], fViewMatrix[13], fViewMatrix[14]]);
 
        gl.useProgram(fProgramInfo.program);
 
        gl.bindVertexArray(fVAO);

        fUniforms.u_matrix = m4.multiply(projectionMatrix, fViewMatrix);

        twgl.setUniforms(fProgramInfo, fUniforms);

        twgl.drawBufferInfo(gl, fBufferInfo);
      }
    }
  //draw text
    gl.enable(gl.BLEND);
    //https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/blendFunc 
    // in here ,because of premultiply alpha,text is fully opacity
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    // disable writing to z-buffer, avoiding occlusion of model by text plane
    //but z-test is performed normally.
    gl.depthMask(false);

    textPositions.forEach(function(pos, ndx) {
     
      let tex = textTextures[ndx];

      //note pos is already in camera coordinate
      let fromEye = m4.normalize(pos);
      let amountToMoveTowardEye =150; 
      //move text close to camera
      let viewX = pos[0] - fromEye[0] * amountToMoveTowardEye;
      let viewY = pos[1] - fromEye[1] * amountToMoveTowardEye;
      let viewZ = pos[2] - fromEye[2] * amountToMoveTowardEye;
 
      let desiredTextScale = 1 / gl.canvas.height;  // 1x1 pixels
      let scale = -1.0*viewZ * desiredTextScale;

      let textMatrix = m4.translate(projectionMatrix,
          viewX, viewY, viewZ);
       //counter perspective scaling,size is const in all distance
      textMatrix = m4.scale(textMatrix, tex.width * scale, tex.height * scale, 1);

    
      gl.useProgram(textProgramInfo.program);

      gl.bindVertexArray(textVAO);

      m4.copy(textMatrix, textUniforms.u_matrix);
      textUniforms.u_texture = tex.texture;
      textUniforms.u_color = colors[ndx];

      twgl.setUniforms(textProgramInfo, textUniforms);
 
      twgl.drawBufferInfo(gl, textBufferInfo);
    });

    requestAnimationFrame(drawScene);
  }
}

window.addEventListener("load",()=>{main();});