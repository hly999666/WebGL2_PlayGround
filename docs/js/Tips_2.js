let gl ;

function drawPointsOnCircle(n){
 const numVerts=n;

const vs = /*glsl*/`#version 300 es
uniform int numVerts;
uniform vec2 resolution;

#define PI radians(180.0)

void main() {
    //using  gl_VertexID as input ,note it is just the value in gl.draw
  float u = float(gl_VertexID) / float(numVerts);  
  float angle = u * PI * 2.0;                  
  float radius = 0.8;

  vec2 pos = vec2(cos(angle), sin(angle)) * radius;
  
  float aspect = resolution.y / resolution.x;
  vec2 scale = vec2(aspect, 1);
  
  gl_Position = vec4(pos * scale, 0, 1);
  gl_PointSize =30.0;
}
`;

const fs =  /*glsl*/`#version 300 es
precision highp float;

out vec4 outColor;

void main() {
  outColor = vec4(1, 0, 0, 1);
}
`;
 
const program = webglUtils.createProgramFromSources(gl, [vs, fs]);
const vertexIdLoc = gl.getAttribLocation(program, 'vertexId');
const numVertsLoc = gl.getUniformLocation(program, 'numVerts');
const resolutionLoc = gl.getUniformLocation(program, 'resolution');

 
webglUtils.resizeCanvasToDisplaySize(gl.canvas);
gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

gl.useProgram(program);

 
gl.uniform1i(numVertsLoc, numVerts);
 
gl.uniform2f(resolutionLoc, gl.canvas.width, gl.canvas.height);

const offset = 0;
gl.drawArrays(gl.POINTS, offset, numVerts);

}

function rain_1(n){
 
const vs =/*glsl*/ `#version 300 es
uniform int numVerts;
uniform float time;

void main() {
  float u = float(gl_VertexID) / float(numVerts);  
  float x = u * 2.0 - 1.0;                
  float y = fract(time + u) * -2.0 + 1.0; 

  gl_Position = vec4(x, y, 0, 1);
  gl_PointSize = 15.0;
}
`;

const fs =/*glsl*/ `#version 300 es
precision highp float;

out vec4 outColor;

void main() {
  outColor = vec4(0, 0, 1, 1);
}
`;

 
const program = webglUtils.createProgramFromSources(gl, [vs, fs]);
const vertexIdLoc = gl.getAttribLocation(program, 'vertexId');
const numVertsLoc = gl.getUniformLocation(program, 'numVerts');
const timeLoc = gl.getUniformLocation(program, 'time');

 

const numVerts = n;
 
function render(time) {
  time *= 0.001;  // convert to seconds

  webglUtils.resizeCanvasToDisplaySize(gl.canvas);
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  gl.useProgram(program);
 
  gl.uniform1i(numVertsLoc, numVerts);
 
  gl.uniform1f(timeLoc, time);

  const offset = 0;
  gl.drawArrays(gl.POINTS, offset, numVerts);

  requestAnimationFrame(render);
}
requestAnimationFrame(render);

}

function rain_2(n){
    
const vs = /*glsl*/`#version 300 es
uniform int numVerts;
uniform float time;

// hash function from https://www.shadertoy.com/view/4djSRW
// given a value between 0 and 1
// returns a value between 0 and 1 that *appears* kind of random
float hash(float p) {
  vec2 p2 = fract(vec2(p * 5.3983, p * 5.4427));
  p2 += dot(p2.yx, p2.xy + vec2(21.5351, 14.3137));
  return fract(p2.x * p2.y * 95.4337);
}

void main() {
  float u = float(gl_VertexID) / float(numVerts);  
  float off = floor(time + u) / 1000.0;  
  float x = hash(u + off) * 2.0 - 1.0;               
  float y = fract(time + u) * -2.0 + 1.0;      

  gl_Position = vec4(x, y, 0, 1);
  gl_PointSize = 10.0;
}
`;

const fs = /*glsl*/ `#version 300 es
precision highp float;

out vec4 outColor;

void main() {
  outColor = vec4(0, 0, 1, 1);
}
`;
 
const program = webglUtils.createProgramFromSources(gl, [vs, fs]);
const vertexIdLoc = gl.getAttribLocation(program, 'vertexId');
const numVertsLoc = gl.getUniformLocation(program, 'numVerts');
const timeLoc = gl.getUniformLocation(program, 'time');

const numVerts = n;
 
function render(time) {
  time *= 0.001;  

  webglUtils.resizeCanvasToDisplaySize(gl.canvas);
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  gl.useProgram(program);
 
  gl.uniform1i(numVertsLoc, numVerts);
 
  gl.uniform1f(timeLoc, time);

  const offset = 0;
  gl.drawArrays(gl.POINTS, offset, numVerts);

  requestAnimationFrame(render);
}
requestAnimationFrame(render);

}

function single_circle(n){
    const vs =/*glsl*/ `#version 300 es
uniform int numVerts;
uniform vec2 resolution;

#define PI radians(180.0)

void main() {
  int numSlices = numVerts/3;
  int sliceId = gl_VertexID / 3;
  int triVertexId = gl_VertexID % 3;
  int edge = triVertexId + sliceId;
  float angleU = float(edge) / float(numSlices);   
  float angle = angleU * PI * 2.0;
  float radius = step(float(triVertexId), 1.5);
  vec2 pos = vec2(cos(angle), sin(angle)) * radius;

  float aspect = resolution.y / resolution.x;
  vec2 scale = vec2(aspect, 1);
  
  gl_Position = vec4(pos * scale, 0, 1);
}
`;

const fs =/*glsl*/ `#version 300 es
precision highp float;

out vec4 outColor;

void main() {
  outColor = vec4(1, 0, 0, 1);
}
`;
 
const program = webglUtils.createProgramFromSources(gl, [vs, fs]);
const vertexIdLoc = gl.getAttribLocation(program, 'vertexId');
const numVertsLoc = gl.getUniformLocation(program, 'numVerts');
const resolutionLoc = gl.getUniformLocation(program, 'resolution');
 

const numVerts = n * 3;

 
function render(time) {
  time *= 0.001;  
  webglUtils.resizeCanvasToDisplaySize(gl.canvas);
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  gl.useProgram(program);
 
  gl.uniform1i(numVertsLoc, numVerts);
 
  gl.uniform2f(resolutionLoc, gl.canvas.width, gl.canvas.height);

  const offset = 0;
  gl.drawArrays(gl.TRIANGLES, offset, numVerts);
}
render();

}
function multi_circles(m,n){
     

const vs =/*glsl*/ `#version 300 es
uniform int numVerts;
uniform vec2 resolution;
 
#define PI radians(180.0)

uniform int numSlices;
  

vec2 computeCircleTriangleVertex(int vertexId) {
  int sliceId = vertexId / 3;
  int triVertexId = vertexId % 3;
  int edge = triVertexId + sliceId;
  float angleU = float(edge) / float(numSlices);  // 0.0 to 1.0
  float angle = angleU * PI * 2.0;
  float radius = step(float(triVertexId), 1.5);
  return vec2(cos(angle), sin(angle)) * radius;
}

void main() {
    int numVertsPerCircle = numSlices * 3;
  int circleId = gl_VertexID / numVertsPerCircle;
  int numCircles = numVerts / numVertsPerCircle;

  float u = float(circleId) / float(numCircles);  // goes from 0 to 1
  float angle = u * PI * 2.0;                     // goes from 0 to 2PI
  float radius = 0.8;

  vec2 center_pos = vec2(cos(angle), sin(angle)) * radius;

  vec2 triPos = computeCircleTriangleVertex(gl_VertexID%numVertsPerCircle) * 0.1;
  
  float aspect = resolution.y / resolution.x;
  vec2 scale = vec2(aspect, 1);
  
  gl_Position = vec4((center_pos + triPos) * scale, 0, 1);
}
`;

const fs =/*glsl*/ `#version 300 es
precision highp float;

out vec4 outColor;

void main() {
  outColor = vec4(1, 0, 0, 1);
}
`;

// setup GLSL program
const program = webglUtils.createProgramFromSources(gl, [vs, fs]);
const vertexIdLoc = gl.getAttribLocation(program, 'vertexId');
const numVertsLoc = gl.getUniformLocation(program, 'numVerts');
const resolutionLoc = gl.getUniformLocation(program, 'resolution');

const circle_resLoc = gl.getUniformLocation(program, 'numSlices');
// Make a buffer with just a count in it.

const numVerts = n * 3 * m;

// draw
function render(time) {
  time *= 0.001;  // convert to seconds

  webglUtils.resizeCanvasToDisplaySize(gl.canvas);
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  gl.useProgram(program);

  // tell the shader the number of verts
  gl.uniform1i(numVertsLoc, numVerts);
  gl.uniform1i(circle_resLoc, n);
  // tell the shader the resolution
  gl.uniform2f(resolutionLoc, gl.canvas.width, gl.canvas.height);

  const offset = 0;
  gl.drawArrays(gl.TRIANGLES, offset, numVerts);
}
render();
}
window.addEventListener("load",()=>{
    gl = document.querySelector('canvas').getContext('webgl2');

    multi_circles(12,8);
    
});