 
const vs =/*glsl*/ `#version 300 es

in float a;
in float b;
out float sum;
out float difference;
out float product;

void main() {
  sum = a + b;
  difference = a - b;
  product = a * b;
}
`;

const fs =/*glsl*/ `#version 300 es
precision highp float;
void main() {
}
`;

function makeBuffer(gl, sizeOrData) {
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, sizeOrData, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    return buf;
  }
  
  function makeBufferAndSetAttribute(gl,data, loc) {
  
    const buf = makeBuffer(gl, data);
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    // setup our attributes to tell WebGL how to pull
    // the data from the buffer above to the attribute
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(
        loc,
        1,         // size (num components)
        gl.FLOAT,  // type of data in buffer
        false,     // normalize
        0,         // stride (0 = auto)
        0,         // offset
    );
  }

  function printResults(gl, buffer, label) {
    const results = new Float32Array(a.length);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.getBufferSubData(
        gl.ARRAY_BUFFER,
        0,    // byte offset into GPU buffer,
        results,
    );
    // print the results
    log(`${label}: ${results}`);
  }
  //...args cast input 1,2,3 as [1,2,3]
  function log(...args) {
    const elem = document.createElement('pre');
    let uidiv=document.getElementById("output_div");
    elem.textContent = args.join(' ');
    uidiv.appendChild(elem);
  }
function main(){

const canvas = document.createElement('canvas');
const gl = canvas.getContext('webgl2');

function createShader(gl, type, src) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(shader));
  }
  return shader;
}

const vShader = createShader(gl, gl.VERTEX_SHADER, vs);
const fShader = createShader(gl, gl.FRAGMENT_SHADER, fs);

const program = gl.createProgram();
gl.attachShader(program, vShader);
gl.attachShader(program, fShader);
//setup transformFeedback before linking
gl.transformFeedbackVaryings(
    program,
    ['sum', 'difference', 'product'],
    gl.SEPARATE_ATTRIBS,
);
gl.linkProgram(program);
if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
  throw new Error(gl.getProgramParameter(program));
}

const aLoc = gl.getAttribLocation(program, 'a');
const bLoc = gl.getAttribLocation(program, 'b');
 
const vao = gl.createVertexArray();
gl.bindVertexArray(vao);



const a = [1, 2, 3, 4, 5, 6];
const b = [3, 6, 9, 12, 15, 18];

// put data in buffers
const aBuffer = makeBufferAndSetAttribute(gl, new Float32Array(a), aLoc);
const bBuffer = makeBufferAndSetAttribute(gl, new Float32Array(b), bLoc);

// create and fill out a transform feedback
const tf = gl.createTransformFeedback();
gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, tf);

// make buffers  output
const sumBuffer = makeBuffer(gl, a.length * 4);
const differenceBuffer = makeBuffer(gl, a.length * 4);
const productBuffer = makeBuffer(gl, a.length * 4);

// bind the buffers to the transform feedback
gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, sumBuffer);
gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 1, differenceBuffer);
gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 2, productBuffer);

//unbind tf
gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, null);

  
gl.useProgram(program);
 
gl.bindVertexArray(vao);

// fs no need 
gl.enable(gl.RASTERIZER_DISCARD);

gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, tf);
//must set as same type drawArrays
gl.beginTransformFeedback(gl.LINE);
gl.drawArrays(gl.line, 0, a.length);
gl.endTransformFeedback();
gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, null);

// turn on fs again
gl.disable(gl.RASTERIZER_DISCARD);

//output 
log(`a: ${a}`);
log(`b: ${b}`);

printResults(gl, sumBuffer, 'sums');
printResults(gl, differenceBuffer, 'differences');
printResults(gl, productBuffer, 'products');


}

window.addEventListener("load",()=>{main();});