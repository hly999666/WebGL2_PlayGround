let envmapVertexShaderSource = /*glsl*/`#version 300 es

in vec4 a_position;
in vec3 a_normal;

uniform mat4 u_projection;
uniform mat4 u_view;
uniform mat4 u_world;

out vec3 v_worldPosition;
out vec3 v_worldNormal;

void main() { 
  gl_Position = u_projection * u_view * u_world * a_position;
 
  v_worldPosition = (u_world * a_position).xyz;
 
  v_worldNormal = mat3(u_world) * a_normal;
}
`;

let envmapFragmentShaderSource = /*glsl*/ `#version 300 es
precision highp float;
 
in vec3 v_worldPosition;
in vec3 v_worldNormal;
 
uniform samplerCube u_texture;
 
uniform vec3 u_worldCameraPosition;
 
out vec4 outColor;

void main() {
  vec3 worldNormal = normalize(v_worldNormal);
  vec3 eyeToSurfaceDir = normalize(v_worldPosition - u_worldCameraPosition);
  vec3 direction = reflect(eyeToSurfaceDir,worldNormal);

  outColor = texture(u_texture, direction);
}
`;

let skyboxVertexShaderSource =  /*glsl*/ `#version 300 es
in vec4 a_position;
out vec4 v_position;
void main() {
  v_position = a_position;
  gl_Position = vec4(a_position.xy, 1.0, 1.0);
}
`;

let skyboxFragmentShaderSource =  /*glsl*/ `#version 300 es
precision highp float;

uniform samplerCube u_skybox;
uniform mat4 u_viewDirectionProjectionInverse;
uniform mat4 u_viewProjectionInverse;
uniform vec3 u_pos_cam;
in vec4 v_position;
 
out vec4 outColor;

void main() {
  vec4 t = u_viewDirectionProjectionInverse * v_position;

  vec4 _pos=vec4(v_position.xyz/v_position.w,1.0);
  vec4 world_pos=u_viewProjectionInverse*_pos;
  vec4 world_dir=world_pos-vec4(u_pos_cam,1.0);
  //outColor = texture(u_skybox, normalize(t.xyz / t.w));
  outColor = texture(u_skybox, normalize(t.xyz));
   //outColor = texture(u_skybox, normalize(world_dir.xyz));
}
`;

function main() {
 
  let canvas = document.querySelector("#canvas");
  let gl = canvas.getContext("webgl2");
  if (!gl) {
    return;
  }
 
  twgl.setAttributePrefix("a_");
 
  const envmapProgramInfo = twgl.createProgramInfo(
      gl, [envmapVertexShaderSource, envmapFragmentShaderSource]);
  const skyboxProgramInfo = twgl.createProgramInfo(
      gl, [skyboxVertexShaderSource, skyboxFragmentShaderSource]);
 
  const cubeBufferInfo = twgl.primitives.createCubeBufferInfo(gl, 1);
  const quadBufferInfo = twgl.primitives.createXYQuadBufferInfo(gl);

  const cubeVAO = twgl.createVAOFromBufferInfo(gl, envmapProgramInfo, cubeBufferInfo);
  const quadVAO = twgl.createVAOFromBufferInfo(gl, skyboxProgramInfo, quadBufferInfo);
 
  const texture = twgl.createTexture(gl, {
    target: gl.TEXTURE_CUBE_MAP,
    src: [
      './texture/pos-x.jpg',  
      './texture/neg-x.jpg',  
      './texture/pos-y.jpg',  
      './texture/neg-y.jpg',  
      './texture/pos-z.jpg',  
      './texture/neg-z.jpg',  
    ],
    min: gl.LINEAR_MIPMAP_LINEAR,
  });

  function degToRad(d) {
    return d * Math.PI / 180;
  }

  var fieldOfViewRadians = degToRad(60);

  requestAnimationFrame(drawScene);

 
  function drawScene(time) {
 
    time *= 0.001;

    twgl.resizeCanvasToDisplaySize(gl.canvas);

    
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);
 
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
 
    let aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    let projectionMatrix =
        m4.perspective(fieldOfViewRadians, aspect, 1, 2000);
 
    let cameraPosition = [Math.cos(time * .1) * 2, 0, Math.sin(time * .1) * 2];
    let target = [0, 0, 0];
    let up = [0, 1, 0];
 
    let cameraMatrix = m4.lookAt(cameraPosition, target, up);

 
    let viewMatrix = m4.inverse(cameraMatrix);

 
    let worldMatrix = m4.xRotation(time * 0.11);

 
    let viewDirectionMatrix = m4.copy(viewMatrix);
    viewDirectionMatrix[12] = 0;
    viewDirectionMatrix[13] = 0;
    viewDirectionMatrix[14] = 0;

    let viewDirectionProjectionMatrix = m4.multiply(
        projectionMatrix, viewDirectionMatrix);
     let viewDirectionProjectionInverseMatrix =
        m4.inverse(viewDirectionProjectionMatrix);

     let viewProjectionMatrix = m4.multiply(
            projectionMatrix, viewMatrix);
     let viewProjectionInverseMatrix =
            m4.inverse(viewProjectionMatrix);
    gl.depthFunc(gl.LESS);   
    gl.useProgram(envmapProgramInfo.program);
    gl.bindVertexArray(cubeVAO);
    twgl.setUniforms(envmapProgramInfo, {
      u_world: worldMatrix,
      u_view: viewMatrix,
      u_projection: projectionMatrix,
      u_texture: texture,
      u_worldCameraPosition: cameraPosition,
    });
    twgl.drawBufferInfo(gl, cubeBufferInfo);

   
    gl.depthFunc(gl.LEQUAL);
    gl.useProgram(skyboxProgramInfo.program);
    gl.bindVertexArray(quadVAO);
    twgl.setUniforms(skyboxProgramInfo, {
      u_viewDirectionProjectionInverse: viewDirectionProjectionInverseMatrix,
      u_viewProjectionInverse:  viewProjectionInverseMatrix,
      u_pos_cam:new Float32Array(cameraPosition),
      u_skybox: texture,
    });
    twgl.drawBufferInfo(gl, quadBufferInfo);

    requestAnimationFrame(drawScene);
  }
}

window.addEventListener("load",()=>{main();});
