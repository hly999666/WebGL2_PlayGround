let  vertexShaderSource =/*glsl*/ `#version 300 es

 
in vec2 a_position;

 
uniform mat3 u_matrix;

 
void main() {
  // Multiply the position by the matrix.
  gl_Position = vec4((u_matrix * vec3(a_position, 1)).xy, 0, 1);
}
`;

var fragmentShaderSource =/*glsl*/ `#version 300 es

precision highp float;
uniform vec4 u_color;

out vec4 outColor;

void main() {
  outColor = u_color;
}
`;

function setGeometry(gl) {
    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([
            // left column
            0, 0,
            30, 0,
            0, 150,
            0, 150,
            30, 0,
            30, 150,
  
            // top rung
            30, 0,
            100, 0,
            30, 30,
            30, 30,
            100, 0,
            100, 30,
  
            // middle rung
            30, 60,
            67, 60,
            30, 90,
            30, 90,
            67, 60,
            67, 90,
        ]),
        gl.STATIC_DRAW);
  }
  let m3 = {
    projection: function projection(width, height) {
      // webgl /opengl matrix is column first array
      return [
        2 / width, 0, 0,
        0, -2 / height, 0,
        -1, 1, 1,
      ];
    },
  
    translation: function translation(tx, ty) {
      return [
        1, 0, 0,
        0, 1, 0,
        tx, ty, 1,
      ];
    },
  
    rotation: function rotation(angleInRadians) {
        let c = Math.cos(angleInRadians);
        let s = Math.sin(angleInRadians);
      return [
        c, -s, 0,
        s, c, 0,
        0, 0, 1,
      ];
    },
  
    scaling: function scaling(sx, sy) {
      return [
        sx, 0, 0,
        0, sy, 0,
        0, 0, 1,
      ];
    },
  
    multiply: function multiply(a, b) {
        let a00 = a[0 * 3 + 0];
        let a01 = a[0 * 3 + 1];
        let a02 = a[0 * 3 + 2];
        let a10 = a[1 * 3 + 0];
      let a11 = a[1 * 3 + 1];
      let a12 = a[1 * 3 + 2];
      let a20 = a[2 * 3 + 0];
      let a21 = a[2 * 3 + 1];
      let a22 = a[2 * 3 + 2];
      let b00 = b[0 * 3 + 0];
      let b01 = b[0 * 3 + 1];
      let b02 = b[0 * 3 + 2];
      let b10 = b[1 * 3 + 0];
      let b11 = b[1 * 3 + 1];
      let b12 = b[1 * 3 + 2];
      let b20 = b[2 * 3 + 0];
      let b21 = b[2 * 3 + 1];
      let b22 = b[2 * 3 + 2];
      return [
        b00 * a00 + b01 * a10 + b02 * a20,
        b00 * a01 + b01 * a11 + b02 * a21,
        b00 * a02 + b01 * a12 + b02 * a22,
        b10 * a00 + b11 * a10 + b12 * a20,
        b10 * a01 + b11 * a11 + b12 * a21,
        b10 * a02 + b11 * a12 + b12 * a22,
        b20 * a00 + b21 * a10 + b22 * a20,
        b20 * a01 + b21 * a11 + b22 * a21,
        b20 * a02 + b21 * a12 + b22 * a22,
      ];
    },
  
    translate: function(m, tx, ty) {
      return m3.multiply(m, m3.translation(tx, ty));
    },
  
    rotate: function(m, angleInRadians) {
      return m3.multiply(m, m3.rotation(angleInRadians));
    },
  
    scale: function(m, sx, sy) {
      return m3.multiply(m, m3.scaling(sx, sy));
    },
  };
function main() {
 
  let canvas = document.querySelector("#canvas");
  let gl = canvas.getContext("webgl2");
  if (!gl) {
    return;
  }
 
  var program = webglUtils.createProgramFromSources(gl,
      [vertexShaderSource, fragmentShaderSource]);

 
 let positionAttributeLocation = gl.getAttribLocation(program, "a_position");

  let colorLocation = gl.getUniformLocation(program, "u_color");
  let matrixLocation = gl.getUniformLocation(program, "u_matrix");
 
  let positionBuffer = gl.createBuffer();

   
  let vao = gl.createVertexArray();
 
  gl.bindVertexArray(vao);

 
  gl.enableVertexAttribArray(positionAttributeLocation);

 
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
 
  setGeometry(gl);

 
  let size = 2;           
  let type = gl.FLOAT;   
  let normalize = false;  
  let stride = 0;    
  let offset = 0;       
  gl.vertexAttribPointer(
      positionAttributeLocation, size, type, normalize, stride, offset);

 
      let translation = [150, 100];
      let rotationInRadians = 0;
      let scale = [1, 1];
      let color = [Math.random(), Math.random(), Math.random(), 1];

      // set up finished

      function drawScene() {
        webglUtils.resizeCanvasToDisplaySize(gl.canvas);
    
      
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    
     
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
       
        gl.useProgram(program);
    
     
        gl.bindVertexArray(vao);
    
     
        gl.uniform4fv(colorLocation, color);
    
        // compute the matrix,note projection based on  clientWidth clientHeight ,so aspect ratio is based on size on actual screen ,not on underlaying canvas render size
        //note order mat is last multi, first apply
        let matrix = m3.projection(gl.canvas.clientWidth, gl.canvas.clientHeight);
        matrix = m3.translate(matrix, translation[0], translation[1]);
        matrix = m3.rotate(matrix, rotationInRadians);
        matrix = m3.scale(matrix, scale[0], scale[1]);
     
        gl.uniformMatrix3fv(matrixLocation, false, matrix);
    
        // draw
        let primitiveType = gl.TRIANGLES;
        let offset = 0;
        let count = 18;
        gl.drawArrays(primitiveType, offset, count);
      }
  drawScene();

 
  webglLessonsUI.setupSlider("#x",      {value: translation[0], slide: updatePosition(0), max: gl.canvas.width });
  webglLessonsUI.setupSlider("#y",      {value: translation[1], slide: updatePosition(1), max: gl.canvas.height});
  webglLessonsUI.setupSlider("#angle",  {value: rotationInRadians * 180 / Math.PI | 0, slide: updateAngle, max: 360});
  webglLessonsUI.setupSlider("#scaleX", {value: scale[0], slide: updateScale(0), min: -5, max: 5, step: 0.01, precision: 2});
  webglLessonsUI.setupSlider("#scaleY", {value: scale[1], slide: updateScale(1), min: -5, max: 5, step: 0.01, precision: 2});

  function updatePosition(index) {
    return function(event, ui) {
      translation[index] = ui.value;
      drawScene();
    };
  }

  function updateAngle(event, ui) {
    var angleInDegrees = 360 - ui.value;
    rotationInRadians = angleInDegrees * Math.PI / 180;
    drawScene();
  }

  function updateScale(index) {
    return function(event, ui) {
      scale[index] = ui.value;
      drawScene();
    };
  }

  
 
} 




window.addEventListener("load",()=>{main();});
