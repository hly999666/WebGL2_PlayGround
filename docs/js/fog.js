 
let vertexShaderSource =/*glsl*/ `#version 300 es
in vec4 a_position;
in vec2 a_texcoord;

uniform mat4 u_worldView;
uniform mat4 u_projection;

out vec2 v_texcoord;
out vec3 v_position;

void main() {
 
  gl_Position = u_projection * u_worldView * a_position;
 
  v_texcoord = a_texcoord;
 
  v_position = (u_worldView * a_position).xyz;
}
`;

let fragmentShaderSource =/*glsl*/  `#version 300 es
precision highp float;
 
in vec2 v_texcoord;
in vec3 v_position;
 
uniform sampler2D u_texture;
uniform vec4 u_fogColor;
uniform float u_fogDensity;

out vec4 outColor;
#define LOG2 1.442695

void main() {
  vec4 color = texture(u_texture, v_texcoord);



  float fogDistance = length(v_position);
  float fogAmount = 1. - exp2(-u_fogDensity * u_fogDensity * fogDistance * fogDistance * LOG2);
  fogAmount = clamp(fogAmount, 0., 1.);

  outColor = mix(color, u_fogColor, fogAmount);  
}
`;
function radToDeg(r) {
    return r * 180 / Math.PI;
  }

  function degToRad(d) {
    return d * Math.PI / 180;
  }

   
function setGeometry(gl) {
    let positions = new Float32Array([
    -0.5, -0.5,  -0.5,
    -0.5,  0.5,  -0.5,
     0.5, -0.5,  -0.5,
    -0.5,  0.5,  -0.5,
     0.5,  0.5,  -0.5,
     0.5, -0.5,  -0.5,

    -0.5, -0.5,   0.5,
     0.5, -0.5,   0.5,
    -0.5,  0.5,   0.5,
    -0.5,  0.5,   0.5,
     0.5, -0.5,   0.5,
     0.5,  0.5,   0.5,

    -0.5,   0.5, -0.5,
    -0.5,   0.5,  0.5,
     0.5,   0.5, -0.5,
    -0.5,   0.5,  0.5,
     0.5,   0.5,  0.5,
     0.5,   0.5, -0.5,

    -0.5,  -0.5, -0.5,
     0.5,  -0.5, -0.5,
    -0.5,  -0.5,  0.5,
    -0.5,  -0.5,  0.5,
     0.5,  -0.5, -0.5,
     0.5,  -0.5,  0.5,

    -0.5,  -0.5, -0.5,
    -0.5,  -0.5,  0.5,
    -0.5,   0.5, -0.5,
    -0.5,  -0.5,  0.5,
    -0.5,   0.5,  0.5,
    -0.5,   0.5, -0.5,

     0.5,  -0.5, -0.5,
     0.5,   0.5, -0.5,
     0.5,  -0.5,  0.5,
     0.5,  -0.5,  0.5,
     0.5,   0.5, -0.5,
     0.5,   0.5,  0.5,

    ]);
  gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
}

// Fill the buffer with texture coordinates the cube.
function setTexcoords(gl) {
  gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        0, 0,
        0, 1,
        1, 0,
        0, 1,
        1, 1,
        1, 0,

        0, 0,
        1, 0,
        0, 1,
        0, 1,
        1, 0,
        1, 1,

        0, 0,
        0, 1,
        1, 0,
        0, 1,
        1, 1,
        1, 0,

        0, 0,
        1, 0,
        0, 1,
        0, 1,
        1, 0,
        1, 1,

        0, 0,
        0, 1,
        1, 0,
        0, 1,
        1, 1,
        1, 0,

        0, 0,
        1, 0,
        0, 1,
        0, 1,
        1, 0,
        1, 1,
      ]),
      gl.STATIC_DRAW);
}

function main() {
 
  let canvas = document.querySelector("#canvas");
  let gl = canvas.getContext("webgl2");
  if (!gl) {
      alert("No WebGL2!!!");
    return;
  }
 
  let program = webglUtils.createProgramFromSources(gl,
      [vertexShaderSource, fragmentShaderSource]);
 
  let positionAttributeLocation = gl.getAttribLocation(program, "a_position");
  let texcoordAttributeLocation = gl.getAttribLocation(program, "a_texcoord");
 
  let projectionLocation = gl.getUniformLocation(program, "u_projection");
  let worldViewLocation = gl.getUniformLocation(program, "u_worldView");
  let textureLocation = gl.getUniformLocation(program, "u_texture");
  let fogColorLocation = gl.getUniformLocation(program, "u_fogColor");
  let fogDensityLocation = gl.getUniformLocation(program, "u_fogDensity");

 
  let vao = gl.createVertexArray(); 
  gl.bindVertexArray(vao);

 
  let positionBuffer = gl.createBuffer(); 
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  
  setGeometry(gl);
 
  gl.enableVertexAttribArray(positionAttributeLocation);

 
  let size = 3;           
  let type = gl.FLOAT;    
  let normalize = false; 
  let stride = 0;       
  let offset = 0;     
  gl.vertexAttribPointer(
      positionAttributeLocation, size, type, normalize, stride, offset);
 
  let texcoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
 
  setTexcoords(gl);

  
  gl.enableVertexAttribArray(texcoordAttributeLocation);
 
    size = 2;          
    type = gl.FLOAT;  
    normalize = true;  
    stride = 0;      
    offset = 0;         
  gl.vertexAttribPointer(
      texcoordAttributeLocation, size, type, normalize, stride, offset);
 
  let texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
 
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
                new Uint8Array([0, 0, 255, 255]));
 
  let image = new Image();
  image.src = "./texture/cat_3.jpg";
  image.addEventListener('load', function() {
    // Now that the image has loaded make copy it to the texture.
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.generateMipmap(gl.TEXTURE_2D);
  });



  let fieldOfViewRadians = degToRad(60);
  let modelXRotationRadians = degToRad(0);
  let modelYRotationRadians = degToRad(0);
  let fogColor = [0.8, 0.9, 1, 1];
  let settings = {
    fogDensity: 0.092,
    xOff: 1.1,
    zOff: 1.4,
  };

  webglLessonsUI.setupUI(document.querySelector("#ui"), settings, [
    { type: "slider",   key: "fogDensity",  min: 0, max: 1, precision: 3, step: 0.001, },
  ]);
 
  let then = 0;

  requestAnimationFrame(drawScene);
 
  function drawScene(time) {
    
    time *= 0.001; 
    let deltaTime = time - then; 
    then = time;

    webglUtils.resizeCanvasToDisplaySize(gl.canvas);
 
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);
 
    modelYRotationRadians += -0.7 * deltaTime;
    modelXRotationRadians += -0.4 * deltaTime;
 
    gl.clearColor(...fogColor);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
 
    gl.useProgram(program);
 
    gl.bindVertexArray(vao);
 
    let aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    let projectionMatrix =
        m4.perspective(fieldOfViewRadians, aspect, 1, 2000);

    let cameraPosition = [0, 0, 2];
    let up = [0, 1, 0];
    let target = [0, 0, 0];
 
    let cameraMatrix = m4.lookAt(cameraPosition, target, up);
 
    let viewMatrix = m4.inverse(cameraMatrix);
 
    gl.uniformMatrix4fv(projectionLocation, false, projectionMatrix);
 
    gl.uniform1i(textureLocation, 0);
 
    gl.uniform4fv(fogColorLocation, fogColor);
    gl.uniform1f(fogDensityLocation, settings.fogDensity);

    const numCubes = 40;
    for (let i = 0; i <= numCubes; ++i) {
        let worldViewMatrix = m4.translate(viewMatrix, -2 + i * settings.xOff, 0, -i * settings.zOff);
      worldViewMatrix = m4.xRotate(worldViewMatrix, modelXRotationRadians + i * 0.1);
      worldViewMatrix = m4.yRotate(worldViewMatrix, modelYRotationRadians + i * 0.1);

      gl.uniformMatrix4fv(worldViewLocation, false, worldViewMatrix);
 
      gl.drawArrays(gl.TRIANGLES, 0, 6 * 6);
    }

    requestAnimationFrame(drawScene);
  }
}

window.addEventListener("load",()=>{main();});