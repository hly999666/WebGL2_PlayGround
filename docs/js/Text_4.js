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

var fFragmentShaderSource =/*glsl*/ `#version 300 es

precision highp float;
 
in vec4 v_color;
 
out vec4 outColor;

void main() {
  outColor = v_color;
}
`;

var textVertexShaderSource = /*glsl*/`#version 300 es
in vec4 a_position;
in vec2 a_texcoord;

uniform mat4 u_matrix;

out vec2 v_texcoord;

void main() { 
  gl_Position = u_matrix * a_position;
 
  v_texcoord = a_texcoord;
}
`;

var textFragmentShaderSource =  /*glsl*/`#version 300 es
precision highp float;
 
in vec2 v_texcoord;

uniform sampler2D u_texture;

out vec4 outColor;

void main() {
   outColor = texture(u_texture, v_texcoord);
}
`;

let fontInfo = {
  letterHeight: 8,
  spaceWidth: 8,
  spacing: -1,
  textureWidth: 64,
  textureHeight: 40,
  glyphInfos: {
    'a': { x:  0, y:  0, width: 8, },
    'b': { x:  8, y:  0, width: 8, },
    'c': { x: 16, y:  0, width: 8, },
    'd': { x: 24, y:  0, width: 8, },
    'e': { x: 32, y:  0, width: 8, },
    'f': { x: 40, y:  0, width: 8, },
    'g': { x: 48, y:  0, width: 8, },
    'h': { x: 56, y:  0, width: 8, },
    'i': { x:  0, y:  8, width: 8, },
    'j': { x:  8, y:  8, width: 8, },
    'k': { x: 16, y:  8, width: 8, },
    'l': { x: 24, y:  8, width: 8, },
    'm': { x: 32, y:  8, width: 8, },
    'n': { x: 40, y:  8, width: 8, },
    'o': { x: 48, y:  8, width: 8, },
    'p': { x: 56, y:  8, width: 8, },
    'q': { x:  0, y: 16, width: 8, },
    'r': { x:  8, y: 16, width: 8, },
    's': { x: 16, y: 16, width: 8, },
    't': { x: 24, y: 16, width: 8, },
    'u': { x: 32, y: 16, width: 8, },
    'v': { x: 40, y: 16, width: 8, },
    'w': { x: 48, y: 16, width: 8, },
    'x': { x: 56, y: 16, width: 8, },
    'y': { x:  0, y: 24, width: 8, },
    'z': { x:  8, y: 24, width: 8, },
    '0': { x: 16, y: 24, width: 8, },
    '1': { x: 24, y: 24, width: 8, },
    '2': { x: 32, y: 24, width: 8, },
    '3': { x: 40, y: 24, width: 8, },
    '4': { x: 48, y: 24, width: 8, },
    '5': { x: 56, y: 24, width: 8, },
    '6': { x:  0, y: 32, width: 8, },
    '7': { x:  8, y: 32, width: 8, },
    '8': { x: 16, y: 32, width: 8, },
    '9': { x: 24, y: 32, width: 8, },
    '-': { x: 32, y: 32, width: 8, },
    '*': { x: 40, y: 32, width: 8, },
    '!': { x: 48, y: 32, width: 8, },
    '?': { x: 56, y: 32, width: 8, },
  },
};


function makeVerticesForString(fontInfo, s) {
  let len = s.length;
  let numVertices = len * 6;
  let positions = new Float32Array(numVertices * 2);
  let texcoords = new Float32Array(numVertices * 2);
  let offset = 0;
  let x = 0;
  let maxX = fontInfo.textureWidth;
  let maxY = fontInfo.textureHeight;
  for (let ii = 0; ii < len; ++ii) {
    let letter = s[ii];
    let glyphInfo = fontInfo.glyphInfos[letter];
    if (glyphInfo) {
        let x2 = x + glyphInfo.width;
        let u1 = glyphInfo.x / maxX;
        let v1 = (glyphInfo.y + fontInfo.letterHeight - 1) / maxY;
        let u2 = (glyphInfo.x + glyphInfo.width - 1) / maxX;
        let v2 = glyphInfo.y / maxY;

      // 6 vertices per letter
      positions[offset + 0] = x;
      positions[offset + 1] = 0;
      texcoords[offset + 0] = u1;
      texcoords[offset + 1] = v1;

      positions[offset + 2] = x2;
      positions[offset + 3] = 0;
      texcoords[offset + 2] = u2;
      texcoords[offset + 3] = v1;

      positions[offset + 4] = x;
      positions[offset + 5] = fontInfo.letterHeight;
      texcoords[offset + 4] = u1;
      texcoords[offset + 5] = v2;

      positions[offset + 6] = x;
      positions[offset + 7] = fontInfo.letterHeight;
      texcoords[offset + 6] = u1;
      texcoords[offset + 7] = v2;

      positions[offset + 8] = x2;
      positions[offset + 9] = 0;
      texcoords[offset + 8] = u2;
      texcoords[offset + 9] = v1;

      positions[offset + 10] = x2;
      positions[offset + 11] = fontInfo.letterHeight;
      texcoords[offset + 10] = u2;
      texcoords[offset + 11] = v2;

      x += glyphInfo.width + fontInfo.spacing;
      offset += 12;
    } else { 
      x += fontInfo.spaceWidth;
    }
  }
 
  return {
    arrays: {
      position: new Float32Array(positions.buffer, 0, offset),
      texcoord: new Float32Array(texcoords.buffer, 0, offset),
    },
    numVertices: offset / 2,
  };
}
function degToRad(d) {
    return d * Math.PI / 180;
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
  let fVAO = twgl.createVAOFromBufferInfo(
      gl, fProgramInfo, fBufferInfo);
 
  let textBufferInfo = {
    attribs: {
      a_position: { buffer: gl.createBuffer(), numComponents: 2, },
      a_texcoord: { buffer: gl.createBuffer(), numComponents: 2, },
    },
    numElements: 0,
  };
  let textVAO = twgl.createVAOFromBufferInfo(
      gl, textProgramInfo, textBufferInfo);

 
  let glyphTex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, glyphTex);
 
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
                new Uint8Array([0, 0, 255, 255]));
 
  let image = new Image();
  image.src = "./texture/8x8-font.png";
  image.addEventListener('load', function() { 
    gl.bindTexture(gl.TEXTURE_2D, glyphTex);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  });

  var names = [
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
  ];

  let fUniforms = {
    u_matrix: m4.identity(),
  };

  let textUniforms = {
    u_matrix: m4.identity(),
    u_texture: glyphTex,
    u_color: [0, 0, 0, 1],  // black
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
    for (var yy = -1; yy <= 1; ++yy) {
      for (var xx = -2; xx <= 2; ++xx) {
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

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.depthMask(false);
 
    gl.useProgram(textProgramInfo.program);
    gl.bindVertexArray(textVAO);

    textPositions.forEach(function(pos, ndx) {
      let name = names[ndx];
      let s = name + ":" + pos[0].toFixed(0) + "," + pos[1].toFixed(0) + "," + pos[2].toFixed(0);
      let vertices = makeVerticesForString(fontInfo, s);
 
      textBufferInfo.attribs.a_position.numComponents = 2;
      gl.bindBuffer(gl.ARRAY_BUFFER, textBufferInfo.attribs.a_position.buffer);
      gl.bufferData(gl.ARRAY_BUFFER, vertices.arrays.position, gl.DYNAMIC_DRAW);
      gl.bindBuffer(gl.ARRAY_BUFFER, textBufferInfo.attribs.a_texcoord.buffer);
      gl.bufferData(gl.ARRAY_BUFFER, vertices.arrays.texcoord, gl.DYNAMIC_DRAW);
 
      let fromEye = m4.normalize(pos);
      let amountToMoveTowardEye = 150;  
      let viewX = pos[0] - fromEye[0] * amountToMoveTowardEye;
      let viewY = pos[1] - fromEye[1] * amountToMoveTowardEye;
      let viewZ = pos[2] - fromEye[2] * amountToMoveTowardEye;
      let desiredTextScale = -1 / gl.canvas.height * 2;   
      let scale = viewZ * desiredTextScale;

      let textMatrix = m4.translate(projectionMatrix, viewX, viewY, viewZ);
      textMatrix = m4.scale(textMatrix, scale, scale, 1);
 
      gl.useProgram(textProgramInfo.program);

      gl.bindVertexArray(textVAO);

      m4.copy(textMatrix, textUniforms.u_matrix);
      twgl.setUniforms(textProgramInfo, textUniforms);
 
      gl.drawArrays(gl.TRIANGLES, 0, vertices.numVertices);
    });

    requestAnimationFrame(drawScene);
  }
}


window.addEventListener("load",()=>{main();});