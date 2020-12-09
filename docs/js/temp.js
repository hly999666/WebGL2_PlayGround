"use strict";

var vertexShaderSource = `#version 300 es

// an attribute is an input (in) to a vertex shader.
// It will receive data from a buffer
in vec4 a_position;
in vec2 a_texcoord;

// A matrix to transform the positions by
uniform mat4 u_matrix;

// a varying to pass the texture coordinates to the fragment shader
out vec2 v_texcoord;

// all shaders have a main function
void main() {
  // Multiply the position by the matrix.
  gl_Position = u_matrix * a_position;

  // Pass the texcoord to the fragment shader.
  v_texcoord = a_texcoord;
}
`;

var fragmentShaderSource = `#version 300 es

precision highp float;

// Passed in from the vertex shader.
in vec2 v_texcoord;

// The texture.
uniform sampler2D u_texture;

// we need to declare an output for the fragment shader
out vec4 outColor;

void main() {
  outColor = texture(u_texture, v_texcoord);
}
`;


function main() {
  // Get A WebGL context
  /** @type {HTMLCanvasElement} */
  var canvas = document.querySelector("#canvas");
  var gl = canvas.getContext("webgl2");
  if (!gl) {
    return;
  }

  var gridContainer = document.querySelector("#gridContainer");

  // Use our boilerplate utils to compile the shaders and link into a program
  var program = webglUtils.createProgramFromSources(gl,
      [vertexShaderSource, fragmentShaderSource]);

  // look up where the vertex data needs to go.
  var positionAttributeLocation = gl.getAttribLocation(program, "a_position");
  var texcoordAttributeLocation = gl.getAttribLocation(program, "a_texcoord");

  // look up uniform locations
  var matrixLocation = gl.getUniformLocation(program, "u_matrix");

  // Create a buffer
  var positionBuffer = gl.createBuffer();

  // Create a vertex array object (attribute state)
  var vao = gl.createVertexArray();

  // and make it the one we're currently working with
  gl.bindVertexArray(vao);

  // Turn on the attribute
  gl.enableVertexAttribArray(positionAttributeLocation);

  // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  // Set Geometry.
  setGeometry(gl);

  // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
  var size = 3;          // 3 components per iteration
  var type = gl.FLOAT;   // the data is 32bit floats
  var normalize = false; // don't normalize the data
  var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
  var offset = 0;        // start at the beginning of the buffer
  gl.vertexAttribPointer(
      positionAttributeLocation, size, type, normalize, stride, offset);

  // create the texcoord buffer, make it the current ARRAY_BUFFER
  // and copy in the texcoord values
  var texcoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
  setTexcoords(gl);

  // Turn on the attribute
  gl.enableVertexAttribArray(texcoordAttributeLocation);

  // Tell the attribute how to get data out of texcoordBuffer (ARRAY_BUFFER)
  var size = 2;          // 2 components per iteration
  var type = gl.FLOAT;   // the data is 32bit floating point values
  var normalize = true;  // convert from 0-255 to 0.0-1.0
  var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next color
  var offset = 0;        // start at the beginning of the buffer
  gl.vertexAttribPointer(
      texcoordAttributeLocation, size, type, normalize, stride, offset);

  // Create a texture.
  var texture = gl.createTexture();

  // use texture unit 0
  gl.activeTexture(gl.TEXTURE0 + 0);

  // bind to the TEXTURE_2D bind point of texture unit 0
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Fill the texture with a 1x1 blue pixel.
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
                new Uint8Array([0, 0, 255, 255]));

  // Asynchronously load an image
  var image = new Image();
  image.src = "https://webgl2fundamentals.org/webgl/resources/f-texture.png";
  image.addEventListener('load', function() {
    // Now that the image has loaded make copy it to the texture.
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.generateMipmap(gl.TEXTURE_2D);
    drawScene();
  });

  var wrapS = gl.REPEAT;
  var wrapT = gl.REPEAT;

  document.querySelector("#wrap_s0").addEventListener('click', function() { wrapS = gl.REPEAT;          drawScene(); });  // eslint-disable-line
  document.querySelector("#wrap_s1").addEventListener('click', function() { wrapS = gl.CLAMP_TO_EDGE;   drawScene(); });  // eslint-disable-line
  document.querySelector("#wrap_s2").addEventListener('click', function() { wrapS = gl.MIRRORED_REPEAT; drawScene(); });  // eslint-disable-line
  document.querySelector("#wrap_t0").addEventListener('click', function() { wrapT = gl.REPEAT;          drawScene(); });  // eslint-disable-line
  document.querySelector("#wrap_t1").addEventListener('click', function() { wrapT = gl.CLAMP_TO_EDGE;   drawScene(); });  // eslint-disable-line
  document.querySelector("#wrap_t2").addEventListener('click', function() { wrapT = gl.MIRRORED_REPEAT; drawScene(); });  // eslint-disable-line

  drawScene();

  window.addEventListener('resize', drawScene);

  // Draw the scene.
  function drawScene() {
    webglUtils.resizeCanvasToDisplaySize(gl.canvas);

    // Tell WebGL how to convert from clip space to pixels
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    // Clear the canvas
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // turn on depth testing
    gl.enable(gl.DEPTH_TEST);

    // Tell it to use our program (pair of shaders)
    gl.useProgram(program);

    // Bind the attribute/buffer set we want.
    gl.bindVertexArray(vao);

    // Compute the matrix
    var scaleFactor = 2.5;
    var size = 80 * scaleFactor;
    var x = gl.canvas.clientWidth / 2 - size / 2;
    var y = gl.canvas.clientHeight - size - 60;
    gridContainer.style.left = (x - 50 * scaleFactor) + 'px';
    gridContainer.style.top  = (y - 50 * scaleFactor) + 'px';
    gridContainer.style.width  = (scaleFactor * 400) + 'px';
    gridContainer.style.height = (scaleFactor * 300) + 'px';

    var matrix = m4.orthographic(0, gl.canvas.clientWidth, gl.canvas.clientHeight, 0, -1, 1);
    matrix = m4.translate(matrix, x, y, 0);
    matrix = m4.scale(matrix, size, size, 1);
    matrix = m4.translate(matrix, 0.5, 0.5, 0);

    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrapS);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrapT);

    // Set the matrix.
    gl.uniformMatrix4fv(matrixLocation, false, matrix);

    // Draw the geometry.
    var primitiveType = gl.TRIANGLES;
    var offset = 0;
    var count = 1 * 6;
    gl.drawArrays(primitiveType, offset, count);
  }
}

// Fill the current ARRAY_BUFFER buffer
// with the values that define plane
function setGeometry(gl) {
  var positions = new Float32Array([
      -0.5,  0.5,  0.5,
       0.5,  0.5,  0.5,
      -0.5, -0.5,  0.5,
      -0.5, -0.5,  0.5,
       0.5,  0.5,  0.5,
       0.5, -0.5,  0.5,
  ]);

  gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
}

// Fill the current ARRAY_BUFFER buffer
// with texture coordinates for a plane
function setTexcoords(gl) {
  gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
          -3, -1,
           2, -1,
          -3,  4,
          -3,  4,
           2, -1,
           2,  4,
      ]),
      gl.STATIC_DRAW);
}

main();
