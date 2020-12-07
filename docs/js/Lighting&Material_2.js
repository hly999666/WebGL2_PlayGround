 

let vertexShaderSource = /*glsl*/`#version 300 es
 
in vec4 a_position;
in vec3 a_normal;

uniform vec3 u_lightWorldPosition;
uniform vec3 u_viewWorldPosition;

uniform mat4 u_world;
uniform mat4 u_worldViewProjection;
uniform mat4 u_worldInverseTranspose;
 
out vec3 v_normal;
out vec3 v_surfaceToLight;
out vec3 v_surfaceToView;

 
void main() {
 


 
  v_normal = mat3(u_worldInverseTranspose) * a_normal;

 
  vec3 surfaceWorldPosition = (u_world * a_position).xyz;
 
  v_surfaceToLight = u_lightWorldPosition - surfaceWorldPosition;
 
  v_surfaceToView = u_viewWorldPosition - surfaceWorldPosition;

  gl_Position = u_worldViewProjection * a_position;
}
`;

let fragmentShaderSource =  /*glsl*/`#version 300 es

precision highp float;
 
in vec3 v_normal;
in vec3 v_surfaceToLight;
in vec3 v_surfaceToView;

uniform vec4 u_color;
uniform float u_shininess;
uniform vec3 u_lightColor;
uniform vec3 u_specularColor;
 
out vec4 outColor;

void main() {
 
  vec3 normal = normalize(v_normal);

  vec3 surfaceToLightDirection = normalize(v_surfaceToLight);
  vec3 surfaceToViewDirection = normalize(v_surfaceToView);
  vec3 halfVector = normalize(surfaceToLightDirection + surfaceToViewDirection);
 
  float light = dot(normal, surfaceToLightDirection);
  float specular = 0.0;
  if (light > 0.0) {
    specular = pow(dot(normal, halfVector), u_shininess);
  }

  outColor = u_color;
 
  outColor.rgb *= light * u_lightColor;
 
  outColor.rgb += specular * u_specularColor;
}
`;
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
  
  function setNormals(gl) {
    let normals = new Float32Array([
            // left column front
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
  
            // top rung front
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
  
            // middle rung front
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
  
            // left column back
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
  
            // top rung back
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
  
            // middle rung back
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
  
            // top
            0, 1, 0,
            0, 1, 0,
            0, 1, 0,
            0, 1, 0,
            0, 1, 0,
            0, 1, 0,
  
            // top rung right
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
  
            // under top rung
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,
  
            // between top rung and middle
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
  
            // top of middle rung
            0, 1, 0,
            0, 1, 0,
            0, 1, 0,
            0, 1, 0,
            0, 1, 0,
            0, 1, 0,
  
            // right of middle rung
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
  
            // bottom of middle rung.
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,
  
            // right of bottom
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
  
            // bottom
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,
  
            // left side
            -1, 0, 0,
            -1, 0, 0,
            -1, 0, 0,
            -1, 0, 0,
            -1, 0, 0,
            -1, 0, 0,
    ]);
    gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW);
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
      let normalAttributeLocation = gl.getAttribLocation(program, "a_normal");
 
      let worldViewProjectionLocation =
      gl.getUniformLocation(program, "u_worldViewProjection");
      let worldInverseTransposeLocation =
      gl.getUniformLocation(program, "u_worldInverseTranspose");
      let colorLocation = gl.getUniformLocation(program, "u_color");
      let shininessLocation = gl.getUniformLocation(program, "u_shininess");
      let lightWorldPositionLocation =
      gl.getUniformLocation(program, "u_lightWorldPosition");
      let viewWorldPositionLocation =
      gl.getUniformLocation(program, "u_viewWorldPosition");
      let worldLocation =
      gl.getUniformLocation(program, "u_world");
      let lightColorLocation =
      gl.getUniformLocation(program, "u_lightColor");
      let specularColorLocation =
      gl.getUniformLocation(program, "u_specularColor");
 
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

 
 let normalBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
  setNormals(gl);

  // Turn on the attribute
  gl.enableVertexAttribArray(normalAttributeLocation);
 
    size = 3;        
    type = gl.FLOAT;    
    normalize = false; 
    stride = 0;    
    offset = 0;  
  gl.vertexAttribPointer(
      normalAttributeLocation, size, type, normalize, stride, offset);



 
  let fieldOfViewRadians = degToRad(60);
  let fRotationRadians = 0;
  let shininess = 150;
//set up finished

function drawScene() {
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
 
    let camera = [100, 150, 200];
    let target = [0, 35, 0];
    let up = [0, 1, 0];
    let cameraMatrix = m4.lookAt(camera, target, up);
 
    let viewMatrix = m4.inverse(cameraMatrix);
 
    let viewProjectionMatrix = m4.multiply(projectionMatrix, viewMatrix);

    let worldMatrix = m4.yRotation(fRotationRadians);
    let worldViewProjectionMatrix = m4.multiply(viewProjectionMatrix, worldMatrix);
    let worldInverseMatrix = m4.inverse(worldMatrix);
    let worldInverseTransposeMatrix = m4.transpose(worldInverseMatrix);
 
    gl.uniformMatrix4fv(
        worldLocation, false,
        worldMatrix);
    gl.uniformMatrix4fv(
        worldViewProjectionLocation, false,
        worldViewProjectionMatrix);
    gl.uniformMatrix4fv(
        worldInverseTransposeLocation, false,
        worldInverseTransposeMatrix);
 
    gl.uniform4fv(colorLocation, [0.2, 1, 0.2, 1]); // green
 
    gl.uniform3fv(lightWorldPositionLocation, [20, 30, 60]);

    gl.uniform3fv(viewWorldPositionLocation, camera);
 
    gl.uniform1f(shininessLocation, shininess);
 
    gl.uniform3fv(lightColorLocation, m4.normalize([1, 0.6, 0.6]));  // red light

 
    gl.uniform3fv(specularColorLocation, m4.normalize([1, 0.2, 0.2]));  // red light
 
    let primitiveType = gl.TRIANGLES;
    let offset = 0;
    let count = 16 * 6;
    gl.drawArrays(primitiveType, offset, count);
  }

  drawScene();
 
  webglLessonsUI.setupSlider("#fRotation", {value: radToDeg(fRotationRadians), slide: updateRotation, min: -360, max: 360});
  webglLessonsUI.setupSlider("#shininess", {value: shininess, slide: updateShininess, min: 1, max: 300});

  function updateRotation(event, ui) {
    fRotationRadians = degToRad(ui.value);
    drawScene();
  }

  function updateShininess(event, ui) {
    shininess = ui.value;
    drawScene();
  }

 
}
 
window.addEventListener("load",()=>{main();});
