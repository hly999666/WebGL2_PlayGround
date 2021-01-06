
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

const fs =  /*glsl*/`#version 300 es
precision highp float;

in vec2 v_texcoord;
in vec4 v_projectedTexcoord;

uniform vec4 u_colorMult;
uniform sampler2D u_texture;
uniform sampler2D u_projectedTexture;

out vec4 outColor;

void main() {
   //projection matrix will keep w,for gl_Position will be auto division,for self-definition must self-divided
  vec3 projectedTexcoord = v_projectedTexcoord.xyz / v_projectedTexcoord.w;
  bool inRange = 
      projectedTexcoord.x >= 0.0 &&
      projectedTexcoord.x <= 1.0 &&
      projectedTexcoord.y >= 0.0 &&
      projectedTexcoord.y <= 1.0;

  vec4 projectedTexColor = texture(u_projectedTexture, projectedTexcoord.xy);

  vec4 texColor = texture(u_texture, v_texcoord) * u_colorMult;
  float projectedAmount = inRange ? 1.0 : 0.0;
  outColor = mix(texColor, projectedTexColor, projectedAmount);

}
`;

const colorVS = /*glsl*/`#version 300 es
in vec4 a_position;

uniform mat4 u_projection;
uniform mat4 u_view;
uniform mat4 u_world;

void main() {
 
  gl_Position = u_projection * u_view * u_world * a_position;
}
`;

const colorFS = /*glsl*/ `#version 300 es
precision highp float;

uniform vec4 u_color;

out vec4 outColor;

void main() {
  outColor = u_color;
}
`;
function degToRad(d) {
    return d * Math.PI / 180;
  }
function main() {
 
 
  const canvas = document.querySelector('#canvas');
  const gl = canvas.getContext('webgl2');
  if (!gl) {
      alert("No WebGL2");
    return;
  }
 
  const textureProgramInfo = twgl.createProgramInfo(gl, [vs, fs]);
  const colorProgramInfo = twgl.createProgramInfo(gl, [colorVS, colorFS]);
 
  twgl.setAttributePrefix("a_");

  const sphereBufferInfo = twgl.primitives.createSphereBufferInfo(
      gl,
      1,  
      12,  
      6,  
  );
  const sphereVAO = twgl.createVAOFromBufferInfo(
      gl, textureProgramInfo, sphereBufferInfo);

  const planeBufferInfo = twgl.primitives.createPlaneBufferInfo(
      gl,
      20,  
      20,  
      1,  
      1,  
  );
  const planeVAO = twgl.createVAOFromBufferInfo(
      gl, textureProgramInfo, planeBufferInfo);

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

  //a 8x8 checkerboard texture
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

  function loadImageTexture(url) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
                  new Uint8Array([0, 0, 255, 255]));
  
    const image = new Image();
    image.src = url;
    image.addEventListener('load', function() {
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
      gl.generateMipmap(gl.TEXTURE_2D);
      render();
    });
    return texture;
  }

  const imageTexture = loadImageTexture('./texture/cat_2.jpg');  



  const settings = {
    cameraX: 2.75,
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
    fieldOfView: 45,
  };


  const fieldOfViewRadians = degToRad(60);
 
  const planeUniforms = {
    u_colorMult: [0.5, 0.5, 1, 1],  
    u_texture: checkerboardTexture,
    u_world: m4.translation(0, 0, 0),
  };
  const sphereUniforms = {
    u_colorMult: [1, 0.5, 0.5, 1],   
    u_texture: checkerboardTexture,
    u_world: m4.translation(2, 3, 4),
  };

  function drawScene(projectionMatrix, cameraMatrix) {
 
    const viewMatrix = m4.inverse(cameraMatrix);

    const textureWorldMatrix = m4.lookAt(
        [settings.posX, settings.posY, settings.posZ],        
        [settings.targetX, settings.targetY, settings.targetZ],  
        [0, 1, 0],                                           
    );
    const textureProjectionMatrix = settings.perspective
        ? m4.perspective(
            degToRad(settings.fieldOfView),
            settings.projWidth / settings.projHeight,
            0.1,  
            200)   
        : m4.orthographic(
            -settings.projWidth / 2,   
             settings.projWidth / 2,  
            -settings.projHeight / 2,  
             settings.projHeight / 2,  
             0.1,                       
             200);                  

    let textureMatrix = m4.identity();
    textureMatrix = m4.translate(textureMatrix, 0.5, 0.5, 0.5);
    textureMatrix = m4.scale(textureMatrix, 0.5, 0.5, 0.5);
    textureMatrix = m4.multiply(textureMatrix, textureProjectionMatrix);
  
    textureMatrix = m4.multiply(
        textureMatrix,
        m4.inverse(textureWorldMatrix));

    gl.useProgram(textureProgramInfo.program);

    twgl.setUniforms(textureProgramInfo, {
      u_view: viewMatrix,
      u_projection: projectionMatrix,
      u_textureMatrix: textureMatrix,
      u_projectedTexture: imageTexture,
    });
  
    //draw sphere
    gl.bindVertexArray(sphereVAO);

    twgl.setUniforms(textureProgramInfo, sphereUniforms);

    twgl.drawBufferInfo(gl, sphereBufferInfo);

     //draw plane
    gl.bindVertexArray(planeVAO);
 
    twgl.setUniforms(textureProgramInfo, planeUniforms);
 
    twgl.drawBufferInfo(gl, planeBufferInfo);

    //draw line cube
    gl.useProgram(colorProgramInfo.program);
 
    gl.bindVertexArray(cubeLinesVAO);
 
    const mat = m4.multiply(
        textureWorldMatrix, m4.inverse(textureProjectionMatrix));

    twgl.setUniforms(colorProgramInfo, {
      u_color: [0, 0, 0, 1],
      u_view: viewMatrix,
      u_projection: projectionMatrix,
      u_world: mat,
    });

    twgl.drawBufferInfo(gl, cubeLinesBufferInfo, gl.LINES);
  }


  function render() {
    twgl.resizeCanvasToDisplaySize(gl.canvas);

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const projectionMatrix =
        m4.perspective(fieldOfViewRadians, aspect, 1, 2000);

    const cameraPosition = [settings.cameraX, settings.cameraY, 7];
    const target = [0, 0, 0];
    const up = [0, 1, 0];
    const cameraMatrix = m4.lookAt(cameraPosition, target, up);

    drawScene(projectionMatrix, cameraMatrix);
  }
  render();

//binding UI
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
}

window.addEventListener("load",()=>{main();});