const closestLineVS =/*glsl*/ `#version 300 es
in vec3 point;

uniform sampler2D linesTex;
uniform int numLineSegments;
//using the flat keyword, no interpolation is done
flat out int closestNdx;

vec4 getAs1D(sampler2D tex, ivec2 dimensions, int index) {
  int y = index / dimensions.x;
  int x = index % dimensions.x;
  return texelFetch(tex, ivec2(x, y), 0);
}

// a is the point, b,c is the line segment
float distanceFromPointToLine(in vec3 a, in vec3 b, in vec3 c) {
  vec3 ba = a - b;
  vec3 bc = c - b;
  float d = dot(ba, bc);
  float len = length(bc);
  float param = 0.0;
  if (len != 0.0) {
    param = clamp(d / (len * len), 0.0, 1.0);
  }
  vec3 r = b + bc * param;
  return distance(a, r);
}

void main() {
  ivec2 linesTexDimensions = textureSize(linesTex, 0);
  
  // find the closest line segment
  float minDist = 10000000.0; 
  int minIndex = -1;
  for (int i = 0; i < numLineSegments; ++i) {
    vec3 lineStart = getAs1D(linesTex, linesTexDimensions, i * 2).xyz;
    vec3 lineEnd = getAs1D(linesTex, linesTexDimensions, i * 2 + 1).xyz;
    float dist = distanceFromPointToLine(point, lineStart, lineEnd);
    if (dist < minDist) {
      minDist = dist;
      minIndex = i;
    }
  }
  
  closestNdx = minIndex;
}
`;

const closestLineFS =/*glsl*/  `#version 300 es
precision highp float;
void main() {
}
`;

const drawClosestLinesVS =/*glsl*/  `#version 300 es
in int closestNdx;
uniform float numPoints;
uniform sampler2D linesTex;
uniform mat4 matrix;

out vec4 v_color;

vec4 getAs1D(sampler2D tex, ivec2 dimensions, int index) {
  int y = index / dimensions.x;
  int x = index % dimensions.x;
  return texelFetch(tex, ivec2(x, y), 0);
}
 
vec3 hsv2rgb(vec3 c) {
  c = vec3(c.x, clamp(c.yz, 0.0, 1.0));
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

void main() {
  ivec2 linesTexDimensions = textureSize(linesTex, 0);

  // pull the position from the texture
  int linePointId = closestNdx * 2 + gl_VertexID % 2;
  vec4 position = getAs1D(linesTex, linesTexDimensions, linePointId);

  // do the common matrix math
  gl_Position = matrix * vec4(position.xy, 0, 1);

  int pointId = gl_InstanceID;
  float hue = float(pointId) / numPoints;
  v_color = vec4(hsv2rgb(vec3(hue, 1, 1)), 1);
}
`;

const drawPointsVS =/*glsl*/   `#version 300 es
in vec4 point;

uniform float numPoints;
uniform mat4 matrix;

out vec4 v_color;
 
vec3 hsv2rgb(vec3 c) {
  c = vec3(c.x, clamp(c.yz, 0.0, 1.0));
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

void main() {
  gl_Position = matrix * point;
  gl_PointSize = 10.0;

  float hue = float(gl_VertexID) / numPoints;
  v_color = vec4(hsv2rgb(vec3(hue, 1, 1)), 1);
}
`;

const drawClosestLinesPointsFS =/*glsl*/   `#version 300 es
precision highp float;
in vec4 v_color;
out vec4 outColor;
void main() {
  outColor = v_color;
}`;

const drawLinesVS =/*glsl*/   `#version 300 es
uniform sampler2D linesTex;
uniform mat4 matrix;

out vec4 v_color;

vec4 getAs1D(sampler2D tex, ivec2 dimensions, int index) {
  int y = index / dimensions.x;
  int x = index % dimensions.x;
  return texelFetch(tex, ivec2(x, y), 0);
}

void main() {
  ivec2 linesTexDimensions = textureSize(linesTex, 0);

  // pull the position from the texture,using gl_VertexID as index,no need for input data
  vec4 position = getAs1D(linesTex, linesTexDimensions, gl_VertexID);

  // do the common matrix math
  gl_Position = matrix * vec4(position.xy, 0, 1);

  // just so we can use the same fragment shader
  v_color = vec4(0.8, 0.8, 0.8, 1);
}
`;

const updateLinesVS =/*glsl*/ `#version 300 es
in vec4 position;
void main() {
  gl_Position = position;
}
`;
 
const updateLinesFS =/*glsl*/  `#version 300 es
precision highp float;
 
uniform sampler2D linesTex;
uniform sampler2D velocityTex;
uniform vec2 canvasDimensions;
uniform float deltaTime;
 
out vec4 outColor;
 
vec2 euclideanModulo(vec2 n, vec2 m) {
    //return mod(mod(n, m) + m, m);
    return mod(n, m);
}
 
void main() { 
  ivec2 texelCoord = ivec2(gl_FragCoord.xy);
 
  vec2 position = texelFetch(linesTex, texelCoord, 0).xy;
  vec2 velocity = texelFetch(velocityTex, texelCoord, 0).xy;
  vec2 newPosition = euclideanModulo(position + velocity * deltaTime, canvasDimensions);
 
 //read to position of gl_FragCoord.xy
  outColor = vec4(newPosition, 0, 1);
}
`;


const updatePositionVS = /*glsl*/ `#version 300 es
  in vec2 oldPosition;
  in vec2 velocity;

  uniform float deltaTime;
  uniform vec2 canvasDimensions;

  out vec2 newPosition;

  vec2 euclideanModulo(vec2 n, vec2 m) {
  	return mod(mod(n, m) + m, m);
  }

  void main() {
    //output data using transformFeedback
    newPosition = euclideanModulo(
        oldPosition + velocity * deltaTime,
        canvasDimensions);
  }
  `;

  const updatePositionFS =/*glsl*/  `#version 300 es
  precision highp float;
  void main() {
  }
  `;
function createShader(gl, type, src) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(shader));
  }
  return shader;
}

function createProgram(gl, shaderSources, transformFeedbackVaryings) {
  const program = gl.createProgram();
  [gl.VERTEX_SHADER, gl.FRAGMENT_SHADER].forEach((type, ndx) => {
    const shader = createShader(gl, type, shaderSources[ndx]);
    gl.attachShader(program, shader);
  });
  if (transformFeedbackVaryings) {
    gl.transformFeedbackVaryings(
        program,
        transformFeedbackVaryings,
        gl.SEPARATE_ATTRIBS,
    );
  }
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramParameter(program));
  }
  return program;
}


function createPoints(numPoints, ranges) {
  const points = [];
  for (let i = 0; i < numPoints; ++i) {
    points.push(...ranges.map(range => r(...range)));
  }
  return points;
}

const r = (min, max) => min + Math.random() * (max - min);
function makeBuffer(gl, sizeOrData, usage) {
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, sizeOrData, usage);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  return buf;
}

function createDataTexture(gl, data, numComponents, internalFormat, format, type) {
  const numElements = data.length / numComponents;

  // compute texture size
  const width = Math.ceil(Math.sqrt(numElements));
  const height = Math.ceil(numElements / width);

  const bin = new Float32Array(width * height * numComponents);
  bin.set(data);

  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texImage2D(
      gl.TEXTURE_2D,
      0,        // mip level
      internalFormat,
      width,
      height,
      0,        // border
      format,
      type,
      bin,
  );
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  return {tex, dimensions: [width, height]};
}
function makeVertexArray(gl, bufLocPairs) {
  const va = gl.createVertexArray();
  gl.bindVertexArray(va);
  for (const [buffer, loc] of bufLocPairs) {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(
        loc,      // attribute location
        2,        // number of elements
        gl.FLOAT, // type of data
        false,    // normalize
        0,        // stride (0 = auto)
        0,        // offset
    );
  }
  gl.bindVertexArray(null);
  return va;
}

function makeTransformFeedback(gl, buffer) {
  const tf = gl.createTransformFeedback();
  gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, tf);
  gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, buffer);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  gl.bindBuffer(gl.TRANSFORM_FEEDBACK_BUFFER, null);
  return tf;
}
function createFramebuffer(gl, tex) {
  const fb = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  return fb;
}
function log(...args) {
  const elem = document.createElement('pre');
  elem.textContent = args.join(' ');
  document.body.appendChild(elem);
}
function main() {
   
  const canvas = document.querySelector("#canvas");
  const gl = canvas.getContext("webgl2");
  if (!gl) {
    alert("No WebGL2");
    return;
  }
  const ext = gl.getExtension('EXT_color_buffer_float');
  if (!ext) {
    alert('need EXT_color_buffer_float');
    return;
  }
//set up shader program
  const closestLinePrg = createProgram(
    gl, [closestLineVS, closestLineFS], ['closestNdx']);
const drawLinesPrg = createProgram(
    gl, [drawLinesVS, drawClosestLinesPointsFS]);
const drawClosestLinesPrg = createProgram(
    gl, [drawClosestLinesVS, drawClosestLinesPointsFS]);
const drawPointsPrg = createProgram(
    gl, [drawPointsVS, drawClosestLinesPointsFS]);
  const updatePositionPrg = createProgram(
      gl, [updatePositionVS, updatePositionFS], ['newPosition']);
  const updateLinesPrg = createProgram(
      gl, [updateLinesVS, updateLinesFS]);


  //find data location
const closestLinePrgLocs = {
  point: gl.getAttribLocation(closestLinePrg, 'point'),
  linesTex: gl.getUniformLocation(closestLinePrg, 'linesTex'),
  numLineSegments: gl.getUniformLocation(closestLinePrg, 'numLineSegments'),
};
const drawLinesPrgLocs = {
  linesTex: gl.getUniformLocation(drawLinesPrg, 'linesTex'),
  matrix: gl.getUniformLocation(drawLinesPrg, 'matrix'),
};
const drawClosestLinesPrgLocs = {
  closestNdx: gl.getAttribLocation(drawClosestLinesPrg, 'closestNdx'),
  linesTex: gl.getUniformLocation(drawClosestLinesPrg, 'linesTex'),
  matrix: gl.getUniformLocation(drawClosestLinesPrg, 'matrix'),
  numPoints: gl.getUniformLocation(drawClosestLinesPrg, 'numPoints'),
};
const drawPointsPrgLocs = {
  point: gl.getAttribLocation(drawPointsPrg, 'point'),
  matrix: gl.getUniformLocation(drawPointsPrg, 'matrix'),
  numPoints: gl.getUniformLocation(drawPointsPrg, 'numPoints'),
};
const updatePositionPrgLocs = {
  oldPosition: gl.getAttribLocation(updatePositionPrg, 'oldPosition'),
  velocity: gl.getAttribLocation(updatePositionPrg, 'velocity'),
  canvasDimensions: gl.getUniformLocation(updatePositionPrg, 'canvasDimensions'),
  deltaTime: gl.getUniformLocation(updatePositionPrg, 'deltaTime'),
};
const updateLinesPrgLocs = {
  position: gl.getAttribLocation(updateLinesPrg, 'position'),
  linesTex: gl.getUniformLocation(updateLinesPrg, 'linesTex'),
  velocityTex: gl.getUniformLocation(updateLinesPrg, 'velocityTex'),
  canvasDimensions: gl.getUniformLocation(updateLinesPrg, 'canvasDimensions'),
  deltaTime: gl.getUniformLocation(updateLinesPrg, 'deltaTime'),
};
//set up correct canvas szie
webglUtils.resizeCanvasToDisplaySize(gl.canvas);

//set up data
  const points = createPoints(8, [[0, gl.canvas.width], [0, gl.canvas.height]]);
  const lines = createPoints(125 * 2, [[0, gl.canvas.width], [0, gl.canvas.height]]);
  const numPoints = points.length / 2;
  const numLineSegments = lines.length / 2 / 2;

  const pointVelocities = createPoints(numPoints, [[-20, 20], [-20, 20]]);
  const lineVelocities = createPoints(numLineSegments * 2, [[-20, 20], [-20, 20]]);

  //set up data buffer
//result index is int 32bit 4bytes ,so size= points.length * 4
  const closestNdxBuffer = makeBuffer(gl, points.length * 4, gl.STATIC_DRAW);
  //const pointsBuffer = makeBuffer(gl, new Float32Array(points), gl.STATIC_DRAW);

  //two buffer for swapbuffer
  const pointsBuffer1 = makeBuffer(gl, new Float32Array(points), gl.DYNAMIC_DRAW);
const pointsBuffer2 = makeBuffer(gl, new Float32Array(points), gl.DYNAMIC_DRAW);
const pointVelocitiesBuffer = makeBuffer(gl, new Float32Array(pointVelocities), gl.STATIC_DRAW);
const quadBuffer = makeBuffer(gl, new Float32Array([
  -1, -1,
   1, -1,
  -1,  1,
  -1,  1,
   1, -1,
   1,  1,
]), gl.STATIC_DRAW);
  

 
//also two linesTex for swap date buffer
      const {tex: linesTex1, dimensions: linesTexDimensions1} =
      createDataTexture(gl, lines, 2, gl.RG32F, gl.RG, gl.FLOAT);
  const {tex: linesTex2, dimensions: linesTexDimensions2} =
      createDataTexture(gl, lines, 2, gl.RG32F, gl.RG, gl.FLOAT);
  const {tex: lineVelocitiesTex, dimensions: lineVelocitiesTexDimensions} =
      createDataTexture(gl, lineVelocities, 2, gl.RG32F, gl.RG, gl.FLOAT);    
  

 
//set up va
const updatePositionVA1 = makeVertexArray(gl, [
  [pointsBuffer1, updatePositionPrgLocs.oldPosition],
  [pointVelocitiesBuffer, updatePositionPrgLocs.velocity],
]);
const updatePositionVA2 = makeVertexArray(gl, [
  [pointsBuffer2, updatePositionPrgLocs.oldPosition],
  [pointVelocitiesBuffer, updatePositionPrgLocs.velocity],
]);
 
const updateLinesVA = makeVertexArray(gl, [
  [quadBuffer, updateLinesPrgLocs.position],
]);

const closestLinesVA1 = makeVertexArray(gl, [
  [pointsBuffer1, closestLinePrgLocs.point],
]);
const closestLinesVA2 = makeVertexArray(gl, [
  [pointsBuffer2, closestLinePrgLocs.point],
]);
 
const drawClosestLinesVA = gl.createVertexArray();
gl.bindVertexArray(drawClosestLinesVA);
gl.bindBuffer(gl.ARRAY_BUFFER, closestNdxBuffer);
gl.enableVertexAttribArray(drawClosestLinesPrgLocs.closestNdx);
gl.vertexAttribIPointer(drawClosestLinesPrgLocs.closestNdx, 1, gl.INT, 0, 0);
gl.vertexAttribDivisor(drawClosestLinesPrgLocs.closestNdx, 1);

const drawPointsVA1 = makeVertexArray(gl, [
  [pointsBuffer1, drawPointsPrgLocs.point],
]);
const drawPointsVA2 = makeVertexArray(gl, [
  [pointsBuffer2, drawPointsPrgLocs.point],
]);

//set up transform feedback
const pointsTF1 = makeTransformFeedback(gl, pointsBuffer1);
const pointsTF2 = makeTransformFeedback(gl, pointsBuffer2);
 
const closestNdxTF = makeTransformFeedback(gl, closestNdxBuffer);

//set up framebuffer for line data 
const linesFB1 = createFramebuffer(gl, linesTex1);
const linesFB2 = createFramebuffer(gl, linesTex2);

//data set for swapping

let current = {
  updatePositionVA: updatePositionVA1, 
  pointsTF: pointsTF2,                
  linesTex: linesTex1,                  
  linesFB: linesFB2, 
  closestLinesVA: closestLinesVA2,  
  allLinesTex: linesTex2,    
  drawPointsVA: drawPointsVA2
};
 
let next = {
  updatePositionVA: updatePositionVA2, 
  pointsTF: pointsTF1,     
  linesTex: linesTex2,       
  linesFB: linesFB1,    
  closestLinesVA: closestLinesVA1,
  allLinesTex: linesTex1,
  drawPointsVA: drawPointsVA1
};



  //compute and rendering code
  function drawArraysWithTransformFeedback(gl, tf, primitiveType, count) {
    // turn of using the fragment shader
    gl.enable(gl.RASTERIZER_DISCARD);

    gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, tf);
    gl.beginTransformFeedback(gl.POINTS);
    gl.drawArrays(primitiveType, 0, count);
    gl.endTransformFeedback();
    gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, null);

    // turn on using fragment shaders again
    gl.disable(gl.RASTERIZER_DISCARD);
  }



  function computeClosestLines() {
    gl.bindVertexArray(current.closestLinesVA);
    gl.useProgram(closestLinePrg);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, current.linesTex);

    gl.uniform1i(closestLinePrgLocs.linesTex, 0);
    gl.uniform1i(closestLinePrgLocs.numLineSegments, numLineSegments);

    drawArraysWithTransformFeedback(gl, closestNdxTF, gl.POINTS, numPoints);
  }

  function drawAllLines(matrix) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    gl.bindVertexArray(null);
    gl.useProgram(drawLinesPrg);
 
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, current.allLinesTex);

 
    gl.uniform1i(drawLinesPrgLocs.linesTex, 0);
    gl.uniformMatrix4fv(drawLinesPrgLocs.matrix, false, matrix);

    gl.drawArrays(gl.LINES, 0, numLineSegments * 2);
  }

  function drawClosestLines(matrix) {
    gl.bindVertexArray(drawClosestLinesVA);
    gl.useProgram(drawClosestLinesPrg);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, current.allLinesTex);

    gl.uniform1i(drawClosestLinesPrgLocs.linesTex, 0);
    gl.uniform1f(drawClosestLinesPrgLocs.numPoints, numPoints);
    gl.uniformMatrix4fv(drawClosestLinesPrgLocs.matrix, false, matrix);
  //even not attribute input at all ,still can draw,there count=2 should be understand as number of loop
    gl.drawArraysInstanced(gl.LINES, 0, 2, numPoints);
  }

  function drawPoints(matrix) {
    gl.bindVertexArray(current.drawPointsVA);
    gl.useProgram(drawPointsPrg);

    gl.uniform1f(drawPointsPrgLocs.numPoints, numPoints);
    gl.uniformMatrix4fv(drawPointsPrgLocs.matrix, false, matrix);

    gl.drawArrays(gl.POINTS, 0, numPoints);
  }
//update data function

function updatePointPositions(deltaTime) {
  gl.bindVertexArray(current.updatePositionVA);
  gl.useProgram(updatePositionPrg);
  gl.uniform1f(updatePositionPrgLocs.deltaTime, deltaTime);
  gl.uniform2f(updatePositionPrgLocs.canvasDimensions, gl.canvas.width, gl.canvas.height);
  drawArraysWithTransformFeedback(gl, current.pointsTF, gl.POINTS, numPoints);
}
 
function updateLineEndPoints(deltaTime) {
 // just a quad
  gl.bindVertexArray(updateLinesVA); 
  gl.useProgram(updateLinesPrg);
 
  // bind data texture
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, current.linesTex);
  gl.activeTexture(gl.TEXTURE0 + 1);
  gl.bindTexture(gl.TEXTURE_2D, lineVelocitiesTex);
 
  // set up uniform
  gl.uniform1i(updateLinesPrgLocs.linesTex, 0);
  gl.uniform1i(updateLinesPrgLocs.velocityTex, 1);
  gl.uniform1f(updateLinesPrgLocs.deltaTime, deltaTime);
  gl.uniform2f(updateLinesPrgLocs.canvasDimensions, gl.canvas.width, gl.canvas.height);
 
  // write to the other lines texture
  gl.bindFramebuffer(gl.FRAMEBUFFER, current.linesFB);
  //set up viewport size for rendering as the same as the input data
  gl.viewport(0, 0, linesTexDimensions1[0],linesTexDimensions1[1]);
 
  // drawing a clip space -1 to +1 quad = map over entire destination array
  gl.drawArrays(gl.TRIANGLES, 0, 6);
}

//actual render function
let then = 0;
function render(time) {
  //time is input of requestAnimationFrame
  // convert to seconds
  time *= 0.001;
  // Subtract the previous time from the current time
  const deltaTime = time - then;
  // Remember the current time for the next frame.
  then = time;
 
  webglUtils.resizeCanvasToDisplaySize(gl.canvas);
 
  gl.clear(gl.COLOR_BUFFER_BIT);
 
  updatePointPositions(deltaTime);
  updateLineEndPoints(deltaTime);
  computeClosestLines();
 
  const matrix = m4.orthographic(0, gl.canvas.width, 0, gl.canvas.height, -1, 1);
 
  drawAllLines(matrix);
  drawClosestLines(matrix);
  drawPoints(matrix);
 
  // swap
  {
    const temp = current;
    current = next;
    next = temp;
  }
 
  requestAnimationFrame(render);
}
requestAnimationFrame(render);
 
}



window.addEventListener("load",()=>main());
