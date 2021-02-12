const vs =/*glsl*/ `#version 300 es
in ivec2 positionAndTexcoordIndices;

uniform sampler2D positionTexture;
uniform sampler2D texcoordTexture;

uniform mat4 u_matrix;

out vec2 v_texcoord;

vec4 getValueByIndexFromTexture(sampler2D tex, int index) {
  int texWidth = textureSize(tex, 0).x;
  int col = index % texWidth;
  int row = index / texWidth;
  return texelFetch(tex, ivec2(col, row), 0);
}

void main() {
  int positionIndex = positionAndTexcoordIndices.x;
  vec3 position = getValueByIndexFromTexture(
      positionTexture, positionIndex).xyz;
 
   int texcoordIndex = positionAndTexcoordIndices.y;
  vec2 texcoord = getValueByIndexFromTexture(
      texcoordTexture, texcoordIndex).xy;
 

  v_texcoord = texcoord; 
  gl_Position = u_matrix * vec4(position, 1);


}
`;
const fs =/*glsl*/ `#version 300 es
precision highp float;

 
in vec2 v_texcoord;
 
uniform sampler2D u_texture;

out vec4 outColor;

void main() {
  outColor = texture(u_texture, v_texcoord);
}
`;
function radToDeg(r) {
    return r * 180 / Math.PI;
  }

  function degToRad(d) {
    return d * Math.PI / 180;
  }
function makeDataTexture(gl, data, numComponents) {
    const numElements = data.length / numComponents;
    const expandedData = new Float32Array(numElements * 4);
    //expand to 4D data,with padding 
    for (let i = 0; i < numElements; ++i) {
      const srcOff = i * numComponents;
      const dstOff = i * 4;
      for (let j = 0; j < numComponents; ++j) {
        expandedData[dstOff + j] = data[srcOff + j];
      }
    }
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(
        gl.TEXTURE_2D,
        0,            // mip level
        gl.RGBA32F,   // format
        numElements,  // width
        1,            // height
        0,            // border
        gl.RGBA,      // format
        gl.FLOAT,     // type
        expandedData,
    );
    // no filtering
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    return tex;
  }

function main() {
 
  const canvas = document.querySelector("#canvas");
  const gl = canvas.getContext("webgl2");
  if (!gl) {
      alert("No WebGL2!!");
    return;
  }
 
  const program = webglUtils.createProgramFromSources(gl, [vs, fs]);
 
  const posTexIndexLoc = gl.getAttribLocation(
      program, "positionAndTexcoordIndices");
 
  const matrixLoc = gl.getUniformLocation(program, "u_matrix");
  const positionTexLoc = gl.getUniformLocation(program, "positionTexture");
  const texcoordTexLoc = gl.getUniformLocation(program, "texcoordTexture");
  const u_textureLoc = gl.getUniformLocation(program, "u_texture");

  const positions = [
    -1, -1,  1,  // 0
     1, -1,  1,  // 1
    -1,  1,  1,  // 2
     1,  1,  1,  // 3
    -1, -1, -1,  // 4
     1, -1, -1,  // 5
    -1,  1, -1,  // 6
     1,  1, -1,  // 7
  ];
  const uvs = [
    0, 0,  // 0
    1, 0,  // 1
    0, 1,  // 2
    1, 1,  // 3
  ];
  const positionIndexUVIndex = [
    // front
    0, 1, // 0
    1, 3, // 1
    2, 0, // 2
    3, 2, // 3
    // right
    1, 1, // 4
    5, 3, // 5
    3, 0, // 6
    7, 2, // 7
    // back
    5, 1, // 8
    4, 3, // 9
    7, 0, // 10
    6, 2, // 11
    // left
    4, 1, // 12
    0, 3, // 13
    6, 0, // 14
    2, 2, // 15
    // top
    7, 1, // 16
    6, 3, // 17
    3, 0, // 18
    2, 2, // 19
    // bottom
    1, 1, // 20
    0, 3, // 21
    5, 0, // 22
    4, 2, // 23
  ];
  const indices = [
     0,  1,  2,   2,  1,  3,  // front
     4,  5,  6,   6,  5,  7,  // right
     8,  9, 10,  10,  9, 11,  // back
    12, 13, 14,  14, 13, 15,  // left
    16, 17, 18,  18, 17, 19,  // top
    20, 21, 22,  22, 21, 23,  // bottom
  ];

//create data texture
  const positionTexture = makeDataTexture(gl, positions, 3);
  const texcoordTexture = makeDataTexture(gl, uvs, 2);
 
  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);
 
  const positionIndexUVIndexBuffer = gl.createBuffer(); 

  gl.bindBuffer(gl.ARRAY_BUFFER, positionIndexUVIndexBuffer);
 
  gl.bufferData(gl.ARRAY_BUFFER, new Uint32Array(positionIndexUVIndex), gl.STATIC_DRAW);
 
  gl.enableVertexAttribArray(posTexIndexLoc);
 
  {
    const size = 2;               
    const type = gl.INT;        
    const stride = 0;              
    const offset = 0;    
    gl.vertexAttribIPointer(
        posTexIndexLoc, size, type, stride, offset);
  }
 //create index buffer
  const indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

  // Create a checker texture.
  const checkerTexture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, checkerTexture);
 
  gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.LUMINANCE,
      4,
      4,
      0,
      gl.LUMINANCE,
      gl.UNSIGNED_BYTE,
      new Uint8Array([
        0xDD, 0x99, 0xDD, 0xAA,
        0x88, 0xCC, 0x88, 0xDD,
        0xCC, 0x88, 0xCC, 0xAA,
        0x88, 0xCC, 0x88, 0xCC,
      ]),
  );
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);



  const fieldOfViewRadians = degToRad(60);
  let modelXRotationRadians = degToRad(0);
  let modelYRotationRadians = degToRad(0);

 
  let then = 0;

  requestAnimationFrame(drawScene);

  // Draw the scene.
  function drawScene(time) {
 
    time *= 0.001;
   
    const deltaTime = time - then;
 
    then = time;

    webglUtils.resizeCanvasToDisplaySize(gl.canvas);

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);

 
    modelYRotationRadians += -0.7 * deltaTime;
    modelXRotationRadians += -0.4 * deltaTime;
 
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
 
    gl.useProgram(program);
 
    gl.bindVertexArray(vao);

 
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const projectionMatrix =
        m4.perspective(fieldOfViewRadians, aspect, 1, 2000);

    const cameraPosition = [0, 0, 4];
    const up = [0, 1, 0];
    const target = [0, 0, 0];

 
    const cameraMatrix = m4.lookAt(cameraPosition, target, up);

 
    const viewMatrix = m4.inverse(cameraMatrix);

    const viewProjectionMatrix = m4.multiply(projectionMatrix, viewMatrix);

    let matrix = m4.xRotate(viewProjectionMatrix, modelXRotationRadians);
    matrix = m4.yRotate(matrix, modelYRotationRadians);

 //setup uniform
    gl.uniformMatrix4fv(matrixLoc, false, matrix);
 
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, positionTexture);
    gl.uniform1i(positionTexLoc, 0);

  
    gl.activeTexture(gl.TEXTURE0 + 1);
    gl.bindTexture(gl.TEXTURE_2D, texcoordTexture);
    gl.uniform1i(texcoordTexLoc, 1);

    // put the checkboard texture on texture unit 2
    gl.activeTexture(gl.TEXTURE0 + 2);
    gl.bindTexture(gl.TEXTURE_2D, checkerTexture);
    // Tell the shader to use texture unit 2 for u_texture
    gl.uniform1i(u_textureLoc, 2);

    // Draw the geometry using index drawElements
    gl.drawElements(gl.TRIANGLES, 6 * 6, gl.UNSIGNED_SHORT, 0);

    requestAnimationFrame(drawScene);
  }
}

window.addEventListener("load",()=>{main();});
