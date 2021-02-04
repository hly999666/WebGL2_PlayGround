const updatePositionVS =/*glsl*/ `#version 300 es
in vec2 oldPosition;
in vec2 velocity;

uniform float deltaTime;
uniform vec2 canvasDimensions;

out vec2 newPosition;

vec2 euclideanModulo(vec2 n, vec2 m) {
    //should be the same as mod(n, m)
   return mod(mod(n, m) + m, m);
   //return mod(n, m);
}

void main() {
  newPosition = euclideanModulo(
      oldPosition + velocity * deltaTime,
      canvasDimensions);
}
`;

const updatePositionFS = /*glsl*/`#version 300 es
precision highp float;
void main() {
}
`;

const drawParticlesVS = /*glsl*/`#version 300 es
in vec4 position;
uniform mat4 matrix;

void main() {  
  gl_PointSize = 10.0;
  gl_Position = matrix * position;

}
`;

const drawParticlesFS = /*glsl*/ `#version 300 es
precision highp float;
out vec4 outColor;
void main() {
  outColor = vec4(1, 0, 0, 1);
}
`;
function main() {

 
  const canvas = document.querySelector("#canvas");
  const gl = canvas.getContext("webgl2");
  if (!gl) {
    alert("No Webgl2!!");
    return;
  }

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

  const updatePositionProgram = createProgram(
      gl, [updatePositionVS, updatePositionFS], ['newPosition']);
  const drawParticlesProgram = createProgram(
      gl, [drawParticlesVS, drawParticlesFS]);

  const updatePositionPrgLocs = {
    oldPosition: gl.getAttribLocation(updatePositionProgram, 'oldPosition'),
    velocity: gl.getAttribLocation(updatePositionProgram, 'velocity'),
    canvasDimensions: gl.getUniformLocation(updatePositionProgram, 'canvasDimensions'),
    deltaTime: gl.getUniformLocation(updatePositionProgram, 'deltaTime'),
  };

  const drawParticlesProgLocs = {
    position: gl.getAttribLocation(drawParticlesProgram, 'position'),
    matrix: gl.getUniformLocation(drawParticlesProgram, 'matrix'),
  };

 
  webglUtils.resizeCanvasToDisplaySize(gl.canvas);

  // create random positions and velocities.
  const rand = (min, max) => {
    if (max === undefined) {
      max = min;
      min = 0;
    }
    return Math.random() * (max - min) + min;
  };
  const numParticles =200;
  const createPoints =function(num,ranges){
   let array=Array(num);
   array.fill(0);
   array=array.map((_) =>{
       //... is spread syntax https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax
       //not https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/rest_parameters
        return  ranges.map(range => rand(...range))
    })
    array=array.flat();
    return array;
  }
  //more FP style not {} omit return 
  //const createPoints = (num, ranges) =>new Array(num).fill(0).map(_ => ranges.map(range => rand(...range))).flat();
  const positions = new Float32Array(createPoints(numParticles, [[canvas.width], [canvas.height]]));
  const velocities = new Float32Array(createPoints(numParticles, [[-300, 300], [-300, 300]]));

  function makeBuffer(gl, sizeOrData, usage) {
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, sizeOrData, usage);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    return buf;
  }

  const position1Buffer = makeBuffer(gl, positions, gl.DYNAMIC_DRAW);
  const position2Buffer = makeBuffer(gl, positions, gl.DYNAMIC_DRAW);
  const velocityBuffer = makeBuffer(gl, velocities, gl.STATIC_DRAW);

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
    return va;
  }

  const updatePositionVA1 = makeVertexArray(gl, [
    [position1Buffer, updatePositionPrgLocs.oldPosition],
    [velocityBuffer, updatePositionPrgLocs.velocity],
  ]);
  const updatePositionVA2 = makeVertexArray(gl, [
    [position2Buffer, updatePositionPrgLocs.oldPosition],
    [velocityBuffer, updatePositionPrgLocs.velocity],
  ]);

  const drawVA1 = makeVertexArray(
      gl, [[position1Buffer, drawParticlesProgLocs.position]]);
  const drawVA2 = makeVertexArray(
      gl, [[position2Buffer, drawParticlesProgLocs.position]]);

  function makeTransformFeedback(gl, buffer) {
    const tf = gl.createTransformFeedback();
    gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, tf);
    gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, buffer);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindBuffer(gl.TRANSFORM_FEEDBACK_BUFFER, null);
    return tf;
  }

  const tf1 = makeTransformFeedback(gl, position1Buffer);
  const tf2 = makeTransformFeedback(gl, position2Buffer);

 

  let current = {
    updateVA: updatePositionVA1,  // read 
    tf: tf2,                      // write  
    drawVA: drawVA2, // draw  
  };
  let next = {
    updateVA: updatePositionVA2,  // read  
    tf: tf1,                      // write  
    drawVA: drawVA1,              // draw  
  };

  let then = 0;
  function render(time) {
    // convert to seconds
    time *= 0.001;
    // Subtract the previous time from the current time
    const deltaTime = time - then;
    // Remember the current time for the next frame.
    then = time;

    webglUtils.resizeCanvasToDisplaySize(gl.canvas);

    gl.clear(gl.COLOR_BUFFER_BIT);

    // compute the new positions
    gl.useProgram(updatePositionProgram);
    gl.bindVertexArray(current.updateVA);
    gl.uniform2f(updatePositionPrgLocs.canvasDimensions, gl.canvas.width, gl.canvas.height);
    gl.uniform1f(updatePositionPrgLocs.deltaTime, deltaTime);

    gl.enable(gl.RASTERIZER_DISCARD);

    gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, current.tf);
    gl.beginTransformFeedback(gl.POINTS);
    gl.drawArrays(gl.POINTS, 0, numParticles);
    gl.endTransformFeedback();
    gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, null);

    //draw point
    gl.disable(gl.RASTERIZER_DISCARD);

    // now draw the particles.
    gl.useProgram(drawParticlesProgram);
    gl.bindVertexArray(current.drawVA);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.uniformMatrix4fv(
        drawParticlesProgLocs.matrix,
        false,
        m4.orthographic(0, gl.canvas.width, 0, gl.canvas.height, -1, 1));
    gl.drawArrays(gl.POINTS, 0, numParticles);

    // swap buffer unit
    {
      const temp = current;
      current = next;
      next = temp;
    }

    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
}

window.addEventListener("load",()=>{main();});
