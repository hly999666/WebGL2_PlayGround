const vertexShaderSource = /*glsl*/`#version 300 es
in vec4 a_position;
in vec4 color;
in mat4 matrix;
uniform mat4 projection;
uniform mat4 view;

out vec4 v_color;

void main() {
  gl_Position = projection * view * matrix * a_position;

  v_color = color;
}
`;

const fragmentShaderSource =/*glsl*/ `#version 300 es
precision highp float;


in vec4 v_color;

out vec4 outColor;

void main() {
  outColor = v_color;
}
`;

function main() {
    const canvas = document.querySelector('#canvas');
    const gl = canvas.getContext('webgl2');
    if (!gl) {
        alert("No webgl2");
      return;
    }
//build shader program
  let program = webglUtils.createProgramFromSources(gl,
      [vertexShaderSource, fragmentShaderSource]);

// get location in shader
const positionLoc = gl.getAttribLocation(program, 'a_position');
const colorLoc = gl.getAttribLocation(program, 'color');
const matrixLoc = gl.getAttribLocation(program, 'matrix');
const projectionLoc = gl.getUniformLocation(program, 'projection');
const viewLoc = gl.getUniformLocation(program, 'view');

// Create vao
const vao = gl.createVertexArray();

gl.bindVertexArray(vao);
// handle pos 
const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    -0.1,  0.4,
    -0.1, -0.4,
     0.1, -0.4,
     0.1, -0.4,
    -0.1,  0.4,
     0.1,  0.4,
     0.4, -0.1,
    -0.4, -0.1,
    -0.4,  0.1,
    -0.4,  0.1,
     0.4, -0.1,
     0.4,  0.1,
  ]), gl.STATIC_DRAW);
const numVertices = 12;

gl.enableVertexAttribArray(positionLoc);
gl.vertexAttribPointer(
    positionLoc, 
    2,             
    gl.FLOAT, 
    false,      
    0,        
    0,    
);
//hande instance matrix
const numInstances = 5;
const matrixData = new Float32Array(numInstances * 16);
const matrices = [];
for (let i = 0; i < numInstances; ++i) {
  const byteOffsetToMatrix = i * 16 * 4;
  const numFloatsForView = 16;
  //note this way is like to push a point to matrices , change matrixData will matrices,vice verse
  matrices.push(new Float32Array(
      matrixData.buffer,
      byteOffsetToMatrix,
      numFloatsForView));
}; 
 
const matrixBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, matrixBuffer);
// just allocate the buffer
gl.bufferData(gl.ARRAY_BUFFER, matrixData.byteLength, gl.DYNAMIC_DRAW);
//setup instanced matrix format
const bytesPerMatrix = 4 * 16;
for (let i = 0; i < 4; ++i) {
    //note  change think matrixLoc is a pointer  of vec4 ,+1 is shift 32 bit
    // mat4 pointer is actually 4 vec4 pointer
  const loc = matrixLoc + i;
  gl.enableVertexAttribArray(loc);
  
  const offset = i * 16;  
  gl.vertexAttribPointer(
      loc,            
      4,               
      gl.FLOAT,       
      false,       
      bytesPerMatrix,    
      offset,        
  );
  // set instance per data
  gl.vertexAttribDivisor(loc, 1);
}
//set up color
const colorBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
gl.bufferData(gl.ARRAY_BUFFER,
    new Float32Array([
        1, 0, 0, 1,   
        0, 1, 0, 1,   
        0, 0, 1, 1,  
        1, 0, 1, 1,   
        0, 1, 1, 1,  
      ]),
    gl.STATIC_DRAW);
gl.enableVertexAttribArray(colorLoc);
gl.vertexAttribPointer(colorLoc, 4, gl.FLOAT, false, 0, 0);
gl.vertexAttribDivisor(colorLoc, 1);

function render(time) {
    time *= 0.001;  

    webglUtils.resizeCanvasToDisplaySize(gl.canvas);
 
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    gl.useProgram(program);
 
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    gl.uniformMatrix4fv(projectionLoc, false,
        m4.orthographic(-aspect, aspect, -1, 1, -1, 1));
    gl.uniformMatrix4fv(viewLoc, false, m4.zRotation(time * .1));

    
    gl.bindVertexArray(vao);
 
    matrices.forEach((mat, ndx) => {
      m4.translation(-0.5 + ndx * 0.25, 0, 0, mat);
      m4.zRotate(mat, time * (0.1 + 5 * ndx), mat);
    });

    gl.bindBuffer(gl.ARRAY_BUFFER, matrixBuffer);
    //use bufferSubData instead of bufferData for better performance,bufferData is for initializing
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, matrixData);

    gl.drawArraysInstanced(
      gl.TRIANGLES,
      0,             // offset
      numVertices,   // num vertices per instance
      numInstances,  // num instances
    );
    //requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
}

window.addEventListener("load",()=>main());
