 

let vertexShaderSource = /*glsl*/`#version 300 es
 
in vec4 a_position;
in vec4 a_color;
 
uniform mat4 u_matrix;
 
out vec4 v_color;
 
void main() {
  // Multiply the position by the matrix.
  gl_Position = u_matrix * a_position;

  // Pass the color to the fragment shader.
  v_color = a_color;
}
`;

let fragmentShaderSource = /*glsl*/`#version 300 es

precision highp float;
 
in vec4 v_color;
 
out vec4 outColor;

void main() {
  outColor = v_color;
}
`;
let m4 = {

    perspective: function(fieldOfViewInRadians, aspect, near, far) {
      let f = Math.tan(Math.PI * 0.5 - 0.5 * fieldOfViewInRadians);
      let rangeInv = 1.0 / (near - far);
  
      return [
        f / aspect, 0, 0, 0,
        0, f, 0, 0,
        0, 0, (near + far) * rangeInv, -1,
        0, 0, near * far * rangeInv * 2, 0,
      ];
    },
  
    projection: function(width, height, depth) {
      
      return [
         2 / width, 0, 0, 0,
         0, -2 / height, 0, 0,
         0, 0, 2 / depth, 0,
        -1, 1, 0, 1,
      ];
    },
  
    multiply: function(a, b) {
      let a00 = a[0 * 4 + 0];
      let a01 = a[0 * 4 + 1];
      let a02 = a[0 * 4 + 2];
      let a03 = a[0 * 4 + 3];
      let a10 = a[1 * 4 + 0];
      let a11 = a[1 * 4 + 1];
      let a12 = a[1 * 4 + 2];
      let a13 = a[1 * 4 + 3];
      let a20 = a[2 * 4 + 0];
      let a21 = a[2 * 4 + 1];
      let a22 = a[2 * 4 + 2];
      let a23 = a[2 * 4 + 3];
      let a30 = a[3 * 4 + 0];
      let a31 = a[3 * 4 + 1];
      let a32 = a[3 * 4 + 2];
      let a33 = a[3 * 4 + 3];
      let b00 = b[0 * 4 + 0];
      let b01 = b[0 * 4 + 1];
      let b02 = b[0 * 4 + 2];
      let b03 = b[0 * 4 + 3];
      let b10 = b[1 * 4 + 0];
      let b11 = b[1 * 4 + 1];
      let b12 = b[1 * 4 + 2];
      let b13 = b[1 * 4 + 3];
      let b20 = b[2 * 4 + 0];
      let b21 = b[2 * 4 + 1];
      let b22 = b[2 * 4 + 2];
      let b23 = b[2 * 4 + 3];
      let b30 = b[3 * 4 + 0];
      let b31 = b[3 * 4 + 1];
      let b32 = b[3 * 4 + 2];
      let b33 = b[3 * 4 + 3];
      return [
        b00 * a00 + b01 * a10 + b02 * a20 + b03 * a30,
        b00 * a01 + b01 * a11 + b02 * a21 + b03 * a31,
        b00 * a02 + b01 * a12 + b02 * a22 + b03 * a32,
        b00 * a03 + b01 * a13 + b02 * a23 + b03 * a33,
        b10 * a00 + b11 * a10 + b12 * a20 + b13 * a30,
        b10 * a01 + b11 * a11 + b12 * a21 + b13 * a31,
        b10 * a02 + b11 * a12 + b12 * a22 + b13 * a32,
        b10 * a03 + b11 * a13 + b12 * a23 + b13 * a33,
        b20 * a00 + b21 * a10 + b22 * a20 + b23 * a30,
        b20 * a01 + b21 * a11 + b22 * a21 + b23 * a31,
        b20 * a02 + b21 * a12 + b22 * a22 + b23 * a32,
        b20 * a03 + b21 * a13 + b22 * a23 + b23 * a33,
        b30 * a00 + b31 * a10 + b32 * a20 + b33 * a30,
        b30 * a01 + b31 * a11 + b32 * a21 + b33 * a31,
        b30 * a02 + b31 * a12 + b32 * a22 + b33 * a32,
        b30 * a03 + b31 * a13 + b32 * a23 + b33 * a33,
      ];
    },
  
    translation: function(tx, ty, tz) {
      return [
         1,  0,  0,  0,
         0,  1,  0,  0,
         0,  0,  1,  0,
         tx, ty, tz, 1,
      ];
    },
  
    xRotation: function(angleInRadians) {
      let c = Math.cos(angleInRadians);
      let s = Math.sin(angleInRadians);
  
      return [
        1, 0, 0, 0,
        0, c, s, 0,
        0, -s, c, 0,
        0, 0, 0, 1,
      ];
    },
  
    yRotation: function(angleInRadians) {
      let c = Math.cos(angleInRadians);
      let s = Math.sin(angleInRadians);
  
      return [
        c, 0, -s, 0,
        0, 1, 0, 0,
        s, 0, c, 0,
        0, 0, 0, 1,
      ];
    },
  
    zRotation: function(angleInRadians) {
      let c = Math.cos(angleInRadians);
      let s = Math.sin(angleInRadians);
  
      return [
         c, s, 0, 0,
        -s, c, 0, 0,
         0, 0, 1, 0,
         0, 0, 0, 1,
      ];
    },
  
    scaling: function(sx, sy, sz) {
      return [
        sx, 0,  0,  0,
        0, sy,  0,  0,
        0,  0, sz,  0,
        0,  0,  0,  1,
      ];
    },
  
    translate: function(m, tx, ty, tz) {
      return m4.multiply(m, m4.translation(tx, ty, tz));
    },
  
    xRotate: function(m, angleInRadians) {
      return m4.multiply(m, m4.xRotation(angleInRadians));
    },
  
    yRotate: function(m, angleInRadians) {
      return m4.multiply(m, m4.yRotation(angleInRadians));
    },
  
    zRotate: function(m, angleInRadians) {
      return m4.multiply(m, m4.zRotation(angleInRadians));
    },
  
    scale: function(m, sx, sy, sz) {
      return m4.multiply(m, m4.scaling(sx, sy, sz));
    },
  
    inverse: function(m) {
      let m00 = m[0 * 4 + 0];
      let m01 = m[0 * 4 + 1];
      let m02 = m[0 * 4 + 2];
      let m03 = m[0 * 4 + 3];
      let m10 = m[1 * 4 + 0];
      let m11 = m[1 * 4 + 1];
      let m12 = m[1 * 4 + 2];
      let m13 = m[1 * 4 + 3];
      let m20 = m[2 * 4 + 0];
      let m21 = m[2 * 4 + 1];
      let m22 = m[2 * 4 + 2];
      let m23 = m[2 * 4 + 3];
      let m30 = m[3 * 4 + 0];
      let m31 = m[3 * 4 + 1];
      let m32 = m[3 * 4 + 2];
      let m33 = m[3 * 4 + 3];
      let tmp_0  = m22 * m33;
      let tmp_1  = m32 * m23;
      let tmp_2  = m12 * m33;
      let tmp_3  = m32 * m13;
      let tmp_4  = m12 * m23;
      let tmp_5  = m22 * m13;
      let tmp_6  = m02 * m33;
      let tmp_7  = m32 * m03;
      let tmp_8  = m02 * m23;
      let tmp_9  = m22 * m03;
      let tmp_10 = m02 * m13;
      let tmp_11 = m12 * m03;
      let tmp_12 = m20 * m31;
      let tmp_13 = m30 * m21;
      let tmp_14 = m10 * m31;
      let tmp_15 = m30 * m11;
      let tmp_16 = m10 * m21;
      let tmp_17 = m20 * m11;
      let tmp_18 = m00 * m31;
      let tmp_19 = m30 * m01;
      let tmp_20 = m00 * m21;
      let tmp_21 = m20 * m01;
      let tmp_22 = m00 * m11;
      let tmp_23 = m10 * m01;
  
      let t0 = (tmp_0 * m11 + tmp_3 * m21 + tmp_4 * m31) -
               (tmp_1 * m11 + tmp_2 * m21 + tmp_5 * m31);
      let t1 = (tmp_1 * m01 + tmp_6 * m21 + tmp_9 * m31) -
               (tmp_0 * m01 + tmp_7 * m21 + tmp_8 * m31);
      let t2 = (tmp_2 * m01 + tmp_7 * m11 + tmp_10 * m31) -
               (tmp_3 * m01 + tmp_6 * m11 + tmp_11 * m31);
      let t3 = (tmp_5 * m01 + tmp_8 * m11 + tmp_11 * m21) -
               (tmp_4 * m01 + tmp_9 * m11 + tmp_10 * m21);
  
      let d = 1.0 / (m00 * t0 + m10 * t1 + m20 * t2 + m30 * t3);
  
      return [
        d * t0,
        d * t1,
        d * t2,
        d * t3,
        d * ((tmp_1 * m10 + tmp_2 * m20 + tmp_5 * m30) -
             (tmp_0 * m10 + tmp_3 * m20 + tmp_4 * m30)),
        d * ((tmp_0 * m00 + tmp_7 * m20 + tmp_8 * m30) -
             (tmp_1 * m00 + tmp_6 * m20 + tmp_9 * m30)),
        d * ((tmp_3 * m00 + tmp_6 * m10 + tmp_11 * m30) -
             (tmp_2 * m00 + tmp_7 * m10 + tmp_10 * m30)),
        d * ((tmp_4 * m00 + tmp_9 * m10 + tmp_10 * m20) -
             (tmp_5 * m00 + tmp_8 * m10 + tmp_11 * m20)),
        d * ((tmp_12 * m13 + tmp_15 * m23 + tmp_16 * m33) -
             (tmp_13 * m13 + tmp_14 * m23 + tmp_17 * m33)),
        d * ((tmp_13 * m03 + tmp_18 * m23 + tmp_21 * m33) -
             (tmp_12 * m03 + tmp_19 * m23 + tmp_20 * m33)),
        d * ((tmp_14 * m03 + tmp_19 * m13 + tmp_22 * m33) -
             (tmp_15 * m03 + tmp_18 * m13 + tmp_23 * m33)),
        d * ((tmp_17 * m03 + tmp_20 * m13 + tmp_23 * m23) -
             (tmp_16 * m03 + tmp_21 * m13 + tmp_22 * m23)),
        d * ((tmp_14 * m22 + tmp_17 * m32 + tmp_13 * m12) -
             (tmp_16 * m32 + tmp_12 * m12 + tmp_15 * m22)),
        d * ((tmp_20 * m32 + tmp_12 * m02 + tmp_19 * m22) -
             (tmp_18 * m22 + tmp_21 * m32 + tmp_13 * m02)),
        d * ((tmp_18 * m12 + tmp_23 * m32 + tmp_15 * m02) -
             (tmp_22 * m32 + tmp_14 * m02 + tmp_19 * m12)),
        d * ((tmp_22 * m22 + tmp_16 * m02 + tmp_21 * m12) -
             (tmp_20 * m12 + tmp_23 * m22 + tmp_17 * m02)),
      ];
    },
  
    cross: function(a, b) {
      return [
         a[1] * b[2] - a[2] * b[1],
         a[2] * b[0] - a[0] * b[2],
         a[0] * b[1] - a[1] * b[0],
      ];
    },
  
    subtractVectors: function(a, b) {
      return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
    },
  
    normalize: function(v) {
      let length = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
 
      if (length > 0.00001) {
        return [v[0] / length, v[1] / length, v[2] / length];
      } else {
        return [0, 0, 0];
      }
    },
  
    lookAt: function(cameraPosition, target, up) {
      let zAxis = m4.normalize(
          m4.subtractVectors(cameraPosition, target));
      let xAxis = m4.normalize(m4.cross(up, zAxis));
      let yAxis = m4.normalize(m4.cross(zAxis, xAxis));
  
      return [
        xAxis[0], xAxis[1], xAxis[2], 0,
        yAxis[0], yAxis[1], yAxis[2], 0,
        zAxis[0], zAxis[1], zAxis[2], 0,
        cameraPosition[0],
        cameraPosition[1],
        cameraPosition[2],
        1,
      ];
    },
 
    transformVector: function(m, v) {
        let dst = [];
        for (var i = 0; i < 4; ++i) {
          dst[i] = 0.0;
          for (var j = 0; j < 4; ++j) {
            dst[i] += v[j] * m[j * 4 + i];
          }
        }
        return dst;
    }
     };


     function setColors(gl) {
        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Uint8Array([
                // left column front
              200,  70, 120,
              200,  70, 120,
              200,  70, 120,
              200,  70, 120,
              200,  70, 120,
              200,  70, 120,
      
                // top rung front
              200,  70, 120,
              200,  70, 120,
              200,  70, 120,
              200,  70, 120,
              200,  70, 120,
              200,  70, 120,
      
                // middle rung front
              200,  70, 120,
              200,  70, 120,
              200,  70, 120,
              200,  70, 120,
              200,  70, 120,
              200,  70, 120,
      
                // left column back
              80, 70, 200,
              80, 70, 200,
              80, 70, 200,
              80, 70, 200,
              80, 70, 200,
              80, 70, 200,
      
                // top rung back
              80, 70, 200,
              80, 70, 200,
              80, 70, 200,
              80, 70, 200,
              80, 70, 200,
              80, 70, 200,
      
                // middle rung back
              80, 70, 200,
              80, 70, 200,
              80, 70, 200,
              80, 70, 200,
              80, 70, 200,
              80, 70, 200,
      
                // top
              70, 200, 210,
              70, 200, 210,
              70, 200, 210,
              70, 200, 210,
              70, 200, 210,
              70, 200, 210,
      
                // top rung right
              200, 200, 70,
              200, 200, 70,
              200, 200, 70,
              200, 200, 70,
              200, 200, 70,
              200, 200, 70,
      
                // under top rung
              210, 100, 70,
              210, 100, 70,
              210, 100, 70,
              210, 100, 70,
              210, 100, 70,
              210, 100, 70,
      
                // between top rung and middle
              210, 160, 70,
              210, 160, 70,
              210, 160, 70,
              210, 160, 70,
              210, 160, 70,
              210, 160, 70,
      
                // top of middle rung
              70, 180, 210,
              70, 180, 210,
              70, 180, 210,
              70, 180, 210,
              70, 180, 210,
              70, 180, 210,
      
                // right of middle rung
              100, 70, 210,
              100, 70, 210,
              100, 70, 210,
              100, 70, 210,
              100, 70, 210,
              100, 70, 210,
      
                // bottom of middle rung.
              76, 210, 100,
              76, 210, 100,
              76, 210, 100,
              76, 210, 100,
              76, 210, 100,
              76, 210, 100,
      
                // right of bottom
              140, 210, 80,
              140, 210, 80,
              140, 210, 80,
              140, 210, 80,
              140, 210, 80,
              140, 210, 80,
      
                // bottom
              90, 130, 110,
              90, 130, 110,
              90, 130, 110,
              90, 130, 110,
              90, 130, 110,
              90, 130, 110,
      
                // left side
              160, 160, 220,
              160, 160, 220,
              160, 160, 220,
              160, 160, 220,
              160, 160, 220,
              160, 160, 220,
            ]),
            gl.STATIC_DRAW);
      }

      function setGeometry(gl) {
        let positions = new Float32Array([
                // left column front
                0,   0,  0,
                0, 150,  0,
                30,   0,  0,
                0, 150,  0,
                30, 150,  0,
                30,   0,  0,
      
                // top rung front
                30,   0,  0,
                30,  30,  0,
                100,   0,  0,
                30,  30,  0,
                100,  30,  0,
                100,   0,  0,
      
                // middle rung front
                30,  60,  0,
                30,  90,  0,
                67,  60,  0,
                30,  90,  0,
                67,  90,  0,
                67,  60,  0,
      
                // left column back
                  0,   0,  30,
                 30,   0,  30,
                  0, 150,  30,
                  0, 150,  30,
                 30,   0,  30,
                 30, 150,  30,
      
                // top rung back
                 30,   0,  30,
                100,   0,  30,
                 30,  30,  30,
                 30,  30,  30,
                100,   0,  30,
                100,  30,  30,
      
                // middle rung back
                 30,  60,  30,
                 67,  60,  30,
                 30,  90,  30,
                 30,  90,  30,
                 67,  60,  30,
                 67,  90,  30,
      
                // top
                  0,   0,   0,
                100,   0,   0,
                100,   0,  30,
                  0,   0,   0,
                100,   0,  30,
                  0,   0,  30,
      
                // top rung right
                100,   0,   0,
                100,  30,   0,
                100,  30,  30,
                100,   0,   0,
                100,  30,  30,
                100,   0,  30,
      
                // under top rung
                30,   30,   0,
                30,   30,  30,
                100,  30,  30,
                30,   30,   0,
                100,  30,  30,
                100,  30,   0,
      
                // between top rung and middle
                30,   30,   0,
                30,   60,  30,
                30,   30,  30,
                30,   30,   0,
                30,   60,   0,
                30,   60,  30,
      
                // top of middle rung
                30,   60,   0,
                67,   60,  30,
                30,   60,  30,
                30,   60,   0,
                67,   60,   0,
                67,   60,  30,
      
                // right of middle rung
                67,   60,   0,
                67,   90,  30,
                67,   60,  30,
                67,   60,   0,
                67,   90,   0,
                67,   90,  30,
      
                // bottom of middle rung.
                30,   90,   0,
                30,   90,  30,
                67,   90,  30,
                30,   90,   0,
                67,   90,  30,
                67,   90,   0,
      
                // right of bottom
                30,   90,   0,
                30,  150,  30,
                30,   90,  30,
                30,   90,   0,
                30,  150,   0,
                30,  150,  30,
      
                // bottom
                0,   150,   0,
                0,   150,  30,
                30,  150,  30,
                0,   150,   0,
                30,  150,  30,
                30,  150,   0,
      
                // left side
                0,   0,   0,
                0,   0,  30,
                0, 150,  30,
                0,   0,   0,
                0, 150,  30,
                0, 150,   0,
        ]);
       
        let matrix = m4.xRotation(Math.PI);
        matrix = m4.translate(matrix, -50, -75, -15);
      
        for (var ii = 0; ii < positions.length; ii += 3) {
            let vector = m4.transformVector(matrix, [positions[ii + 0], positions[ii + 1], positions[ii + 2], 1]);
          positions[ii + 0] = vector[0];
          positions[ii + 1] = vector[1];
          positions[ii + 2] = vector[2];
        }
      
        gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
      }

function radToDeg(r) {
        return r * 180 / Math.PI;
      }
    
function degToRad(d) {
        return d * Math.PI / 180;
      }
function main() {
 
  let canvas = document.querySelector("#canvas");
  let gl = canvas.getContext("webgl2");
  if (!gl) {
    return;
  }
 
  let program = webglUtils.createProgramFromSources(gl,
      [vertexShaderSource, fragmentShaderSource]);

 
  let positionAttributeLocation = gl.getAttribLocation(program, "a_position");
  let colorAttributeLocation = gl.getAttribLocation(program, "a_color");
 
  let matrixLocation = gl.getUniformLocation(program, "u_matrix");

 
  let positionBuffer = gl.createBuffer();
 
  let vao = gl.createVertexArray();
 
  gl.bindVertexArray(vao);

 
  gl.enableVertexAttribArray(positionAttributeLocation);
 
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
 
  setGeometry(gl);

 
  let size = 3;        
  let type = gl.FLOAT;  
  let normalize = false;  
  let stride = 0;         
  let offset = 0;         
  gl.vertexAttribPointer(
      positionAttributeLocation, size, type, normalize, stride, offset);

 
  let colorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  setColors(gl);

 
  gl.enableVertexAttribArray(colorAttributeLocation);
 
    size = 3;        
    type = gl.UNSIGNED_BYTE;  
    normalize = true; 
    stride = 0;        
    offset = 0;        
  gl.vertexAttribPointer(
      colorAttributeLocation, size, type, normalize, stride, offset);



 
  let fieldOfViewRadians = degToRad(60);
  let cameraAngleRadians = degToRad(0);
 
  function drawScene() {
    let numFs = 5;
    let radius = 200;

    webglUtils.resizeCanvasToDisplaySize(gl.canvas);
 
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
 
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
 
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);


    gl.useProgram(program);

    gl.bindVertexArray(vao);

    let aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    let zNear = 1;
    let zFar = 2000;
    let projectionMatrix = m4.perspective(fieldOfViewRadians, aspect, zNear, zFar);

    let fPosition = [radius, 0, 0];

    let cameraMatrix = m4.yRotation(cameraAngleRadians);
    cameraMatrix = m4.translate(cameraMatrix, 0, 50, radius * 1.5);

    let cameraPosition = [
      cameraMatrix[12],
      cameraMatrix[13],
      cameraMatrix[14],
    ];

    let up = [0, 1, 0];

    
      cameraMatrix = m4.lookAt(cameraPosition, fPosition, up);

   
    let viewMatrix = m4.inverse(cameraMatrix);
 
 
 
    let viewProjectionMatrix = m4.multiply(projectionMatrix, viewMatrix);

   
    for (let ii = 0; ii < numFs; ++ii) {
        let angle = ii * Math.PI * 2 / numFs;

        let x = Math.cos(angle) * radius;
        let z = Math.sin(angle) * radius;
        let matrix = m4.translate(viewProjectionMatrix, x, 0, z);
 
      gl.uniformMatrix4fv(matrixLocation, false, matrix);
 
      let primitiveType = gl.TRIANGLES;
      let offset = 0;
      let count = 16 * 6;
      gl.drawArrays(primitiveType, offset, count);
    }
  }

  drawScene();

 
  webglLessonsUI.setupSlider("#cameraAngle", {value: radToDeg(cameraAngleRadians), slide: updateCameraAngle, min: -360, max: 360});

  function updateCameraAngle(event, ui) {
    cameraAngleRadians = degToRad(ui.value);
    drawScene();
  }


}
 


window.addEventListener("load",()=>{main();});







