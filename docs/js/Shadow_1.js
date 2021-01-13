 
const vs = /*glsl*/`#version 300 es
in vec4 a_position;
in vec2 a_texcoord;

uniform mat4 u_projection;
uniform mat4 u_view;
uniform mat4 u_world;
uniform mat4 u_textureMatrix;

out vec2 v_texcoord;
out vec4 v_projectedTexcoord;

void main() { 
  vec4 worldPosition = u_world * a_position;

  v_texcoord = a_texcoord;

  v_projectedTexcoord = u_textureMatrix * worldPosition;
  gl_Position = u_projection * u_view * worldPosition;
 
}
`;

const fs = /*glsl*/ `#version 300 es
precision highp float;
in vec2 v_texcoord;
in vec4 v_projectedTexcoord;
uniform vec4 u_colorMult;
uniform sampler2D u_texture;
uniform sampler2D u_projectedTexture;
out vec4 outColor;
void main() {
  vec3 projectedTexcoord = v_projectedTexcoord.xyz / v_projectedTexcoord.w;
  bool inRange =
      projectedTexcoord.x >= 0.0 &&
      projectedTexcoord.x <= 1.0 &&
      projectedTexcoord.y >= 0.0 &&
      projectedTexcoord.y <= 1.0;

  vec3  p_texColor=texture(u_projectedTexture, projectedTexcoord.xy).rrr;
  vec4 projectedTexColor = vec4(p_texColor, 1);
  vec4 texColor = texture(u_texture, v_texcoord) * u_colorMult;
  float projectedAmount = inRange ? 1.0 : 0.0;
  outColor = mix(texColor, projectedTexColor, projectedAmount);
}
`;

const colorVS =  /*glsl*/`#version 300 es
in vec4 a_position;

uniform mat4 u_projection;
uniform mat4 u_view;
uniform mat4 u_world;
out vec4 vPos;
void main() { 
  gl_Position = u_projection * u_view * u_world * a_position;
  vPos=gl_Position;
}
`;

const colorFS =  /*glsl*/`#version 300 es
precision highp float;

uniform vec4 u_color;
in vec4 vPos;
out vec4 outColor;

void main() {
  float z= abs(vPos.z/vPos.w)/3.0;
  outColor =vec4(z,z,z,1.0);
}
`;
function degToRad(d) {
    return d * Math.PI / 180;
  }
function main() {
 
  const canvas = document.querySelector('#canvas');
  const gl = canvas.getContext('webgl2');
  if (!gl) {
      alert("No Webgl2");
    return;
  }

  const programOptions = {
    attribLocations: {
      'a_position': 0,
      'a_normal':   1,
      'a_texcoord': 2,
      'a_color':    3,
    },
  };
  const textureProgramInfo = twgl.createProgramInfo(gl, [vs, fs], programOptions);
  const colorProgramInfo = twgl.createProgramInfo(gl, [colorVS, colorFS], programOptions);
 
  twgl.setAttributePrefix("a_");

  const sphereBufferInfo = twgl.primitives.createSphereBufferInfo(
      gl,
      1,  
      32,  
      24, 
  );
  const sphereVAO = twgl.createVAOFromBufferInfo(
      gl, textureProgramInfo, sphereBufferInfo);
  const planeBufferInfo = twgl.primitives.createPlaneBufferInfo(
      gl,
      20,  
      20,  
      1,   
  );
  const planeVAO = twgl.createVAOFromBufferInfo(
      gl, textureProgramInfo, planeBufferInfo);
  const cubeBufferInfo = twgl.primitives.createCubeBufferInfo(
      gl,
      2, 
  );
  const cubeVAO = twgl.createVAOFromBufferInfo(
      gl, textureProgramInfo, cubeBufferInfo);
  const cubeLinesBufferInfo = twgl.createBufferInfoFromArrays(gl, {
    position: [
      -1, -1, -1,
       1, -1, -1,
      -1,  1, -1,
       1,  1, -1,
      -1, -1,  1,
       1, -1,  1,
      -1,  1,  1,
       1,  1,  1,
    ],
    indices: [
      0, 1,
      1, 3,
      3, 2,
      2, 0,

      4, 5,
      5, 7,
      7, 6,
      6, 4,

      0, 4,
      1, 5,
      3, 7,
      2, 6,
    ],
  });
  const cubeLinesVAO = twgl.createVAOFromBufferInfo(
      gl, colorProgramInfo, cubeLinesBufferInfo);
 
  const checkerboardTexture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, checkerboardTexture);
  gl.texImage2D(
      gl.TEXTURE_2D,
      0,           
      gl.LUMINANCE,      
      8,               
      8,                 
      0,                
      gl.LUMINANCE,    
      gl.UNSIGNED_BYTE,  
      new Uint8Array([  
        0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC,
        0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF,
        0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC,
        0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF,
        0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC,
        0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF,
        0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC,
        0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF,
      ]));
  gl.generateMipmap(gl.TEXTURE_2D);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

  const depthTexture = gl.createTexture();
  const depthTextureSize = 512;
  gl.bindTexture(gl.TEXTURE_2D, depthTexture);
  gl.texImage2D(
      gl.TEXTURE_2D,      // target
      0,                  // mip level
      gl.DEPTH_COMPONENT32F, // internal format
      depthTextureSize,   // width
      depthTextureSize,   // height
      0,                  // border
      gl.DEPTH_COMPONENT, // format
      gl.FLOAT,           // type
      null);              // data
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  const depthFramebuffer = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, depthFramebuffer);
  gl.framebufferTexture2D(
      gl.FRAMEBUFFER,       // target
      gl.DEPTH_ATTACHMENT,  // attachment point
      gl.TEXTURE_2D,        // texture target
      depthTexture,         // texture
      0);                   // mip level


//UI set up
  const settings = {
    cameraX: 6,
    cameraY: 5,
    posX: 2.5,
    posY: 4.8,
    posZ: 4.3,
    targetX: 2.5,
    targetY: 0,
    targetZ: 3.5,
    projWidth: 1,
    projHeight: 1,
    perspective: true,
    fieldOfView: 120,
  };
  webglLessonsUI.setupUI(document.querySelector('#ui'), settings, [
    { type: 'slider',   key: 'cameraX',    min: -10, max: 10, change: render, precision: 2, step: 0.001, },
    { type: 'slider',   key: 'cameraY',    min:   1, max: 20, change: render, precision: 2, step: 0.001, },
    { type: 'slider',   key: 'posX',       min: -10, max: 10, change: render, precision: 2, step: 0.001, },
    { type: 'slider',   key: 'posY',       min:   1, max: 20, change: render, precision: 2, step: 0.001, },
    { type: 'slider',   key: 'posZ',       min:   1, max: 20, change: render, precision: 2, step: 0.001, },
    { type: 'slider',   key: 'targetX',    min: -10, max: 10, change: render, precision: 2, step: 0.001, },
    { type: 'slider',   key: 'targetY',    min:   0, max: 20, change: render, precision: 2, step: 0.001, },
    { type: 'slider',   key: 'targetZ',    min: -10, max: 20, change: render, precision: 2, step: 0.001, },
    { type: 'slider',   key: 'projWidth',  min:   0, max:  2, change: render, precision: 2, step: 0.001, },
    { type: 'slider',   key: 'projHeight', min:   0, max:  2, change: render, precision: 2, step: 0.001, },
    { type: 'checkbox', key: 'perspective', change: render, },
    { type: 'slider',   key: 'fieldOfView', min:  1, max: 179, change: render, },
  ]);

  const fieldOfViewRadians = degToRad(60);
 
  const planeUniforms = {
    u_colorMult: [0.5, 0.5, 1, 1],   
    u_color: [1, 0, 0, 1],
    u_texture: checkerboardTexture,
    u_world: m4.translation(0, 0, 0),
  };
  const sphereUniforms = {
    u_colorMult: [1, 0.5, 0.5, 1], 
    u_color: [0, 0, 1, 1],
    u_texture: checkerboardTexture,
    u_world: m4.translation(2, 3, 4),
  };
  const cubeUniforms = {
    u_colorMult: [0.5, 1, 0.5, 1], 
    u_color: [0, 0, 1, 1],
    u_texture: checkerboardTexture,
    u_world: m4.translation(3, 1, 0),
  };

  function drawScene(projectionMatrix, cameraMatrix, textureMatrix, programInfo) {
 
    const viewMatrix = m4.inverse(cameraMatrix);

    gl.useProgram(programInfo.program);

    twgl.setUniforms(programInfo, {
      u_view: viewMatrix,
      u_projection: projectionMatrix,
      u_textureMatrix: textureMatrix,
      u_projectedTexture: depthTexture,
    });
 
    gl.bindVertexArray(sphereVAO);
 
    twgl.setUniforms(programInfo, sphereUniforms);
 
    twgl.drawBufferInfo(gl, sphereBufferInfo);
 
    gl.bindVertexArray(cubeVAO);
 
    twgl.setUniforms(programInfo, cubeUniforms);
 
    twgl.drawBufferInfo(gl, cubeBufferInfo);
  
    gl.bindVertexArray(planeVAO);
 
    twgl.setUniforms(programInfo, planeUniforms);
 
    twgl.drawBufferInfo(gl, planeBufferInfo);
  }
 
  function render() {
   
    twgl.resizeCanvasToDisplaySize(gl.canvas);
  
    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);

    const lightWorldMatrix = m4.lookAt(
        [settings.posX, settings.posY, settings.posZ],        
        [settings.targetX, settings.targetY, settings.targetZ],  
        [0, 1, 0],                                             
    );
    const lightProjectionMatrix = settings.perspective
        ? m4.perspective(
            degToRad(settings.fieldOfView),
            settings.projWidth / settings.projHeight,
            0.5, 
            10)    
        : m4.orthographic(
            -settings.projWidth / 2,   
             settings.projWidth / 2,   
            -settings.projHeight / 2,  
             settings.projHeight / 2,  
             0.5,                      
             10);                    
     
   //gl.bindFramebuffer(gl.FRAMEBUFFER, depthFramebuffer);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, depthTextureSize, depthTextureSize);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    drawScene(lightProjectionMatrix, lightWorldMatrix, m4.identity(), colorProgramInfo);
   //renderTexturePlane(gl,depthTexture);
 
   /*  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    let textureMatrix = m4.identity();
    textureMatrix = m4.translate(textureMatrix, 0.5, 0.5, 0.5);
    textureMatrix = m4.scale(textureMatrix, 0.5, 0.5, 0.5);
    textureMatrix = m4.multiply(textureMatrix, lightProjectionMatrix);
    textureMatrix = m4.multiply(
        textureMatrix,
        m4.inverse(lightWorldMatrix));

    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const projectionMatrix =
        m4.perspective(fieldOfViewRadians, aspect, 1, 2000);

    const cameraPosition = [settings.cameraX, settings.cameraY, 7];
    const target = [0, 0, 0];
    const up = [0, 1, 0];
    const cameraMatrix = m4.lookAt(cameraPosition, target, up);

    drawScene(projectionMatrix, cameraMatrix, textureMatrix, textureProgramInfo);


    {
      const viewMatrix = m4.inverse(cameraMatrix);

      gl.useProgram(colorProgramInfo.program);

    
      gl.bindVertexArray(cubeLinesVAO);

    
      const mat = m4.multiply(
          lightWorldMatrix, m4.inverse(lightProjectionMatrix));

      twgl.setUniforms(colorProgramInfo, {
        u_color: [0, 0, 0, 1],
        u_view: viewMatrix,
        u_projection: projectionMatrix,
        u_world: mat,
      });

      twgl.drawBufferInfo(gl, cubeLinesBufferInfo, gl.LINES);
    }  */
  }
  render();

}

window.addEventListener("load",()=>{main();});
