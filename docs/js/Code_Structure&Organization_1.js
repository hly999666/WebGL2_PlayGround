
let vs =/*glsl*/ `#version 300 es
uniform mat4 u_worldViewProjection;
uniform vec3 u_lightWorldPos;
uniform mat4 u_world;
uniform mat4 u_viewInverse;
uniform mat4 u_worldInverseTranspose;

in vec4 a_position;
in vec3 a_normal;
in vec2 a_texcoord;

out vec4 v_position;
out vec2 v_texCoord;
out vec3 v_normal;
out vec3 v_surfaceToLight;
out vec3 v_surfaceToView;

void main() {
  v_texCoord = a_texcoord;
  v_position = (u_worldViewProjection * a_position);
  v_normal = (u_worldInverseTranspose * vec4(a_normal, 0)).xyz;
  v_surfaceToLight = u_lightWorldPos - (u_world * a_position).xyz;
  v_surfaceToView = (u_viewInverse[3] - (u_world * a_position)).xyz;
  gl_Position = v_position;
}
`;

var fs = /*glsl*/ `#version 300 es
precision highp float;

in vec4 v_position;
in vec2 v_texCoord;
in vec3 v_normal;
in vec3 v_surfaceToLight;
in vec3 v_surfaceToView;

uniform vec4 u_lightColor;
uniform vec4 u_colorMult;
uniform sampler2D u_diffuse;
uniform vec4 u_specular;
uniform float u_shininess;
uniform float u_specularFactor;

out vec4 outColor;

vec4 lit(float l ,float h, float m) {
  return vec4(1.0,
              abs(l),
              (l > 0.0) ? pow(max(0.0, h), m) : 0.0,
              1.0);
}

void main() {
  vec4 diffuseColor = texture(u_diffuse, v_texCoord);
  vec3 a_normal = normalize(v_normal);
  vec3 surfaceToLight = normalize(v_surfaceToLight);
  vec3 surfaceToView = normalize(v_surfaceToView);
  vec3 halfVector = normalize(surfaceToLight + surfaceToView);
  vec4 litR = lit(dot(a_normal, surfaceToLight),
                    dot(a_normal, halfVector), u_shininess);
  outColor = vec4((
    u_lightColor * (diffuseColor * litR.y * u_colorMult +
                u_specular * litR.z * u_specularFactor)).rgb,
      diffuseColor.a);
}
`;

function degToRad(d) {
    return d * Math.PI / 180;
  }
function main() {
 
  let canvas = document.querySelector("#canvas");
  let gl = canvas.getContext("webgl2");
  if (!gl) {
    return;
  }

  twgl.setAttributePrefix("a_");  

 
  let quadArrays = {
     position: [0, 0, 0, 10, 0, 0, 0, 10, 0, 10, 10, 0],
     texcoord: [0, 0, 0, 1, 1, 0, 1, 1],
     normal:   [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1],
     indices:  [0, 1, 2, 1, 2, 3],
  };
  let quadBufferInfo = twgl.createBufferInfoFromArrays(gl, quadArrays);
  let triangleArrays = {
     position: { numComponents: 3, data: [0, -10, 0, 10, 10, 0, -10, 10, 0], },
     texcoord: { numComponents: 2, data: [0.5, 0, 1, 1, 0, 1],               },
     normal:   { numComponents: 3, data: [0, 0, 1, 0, 0, 1, 0, 0, 1],        },
  };
  let triangleBufferInfo = twgl.createBufferInfoFromArrays(gl, triangleArrays);

   
  let programInfo = twgl.createProgramInfo(gl, [vs, fs]);

  let quadVAO = twgl.createVAOFromBufferInfo(gl, programInfo, quadBufferInfo);
  let triangleVAO = twgl.createVAOFromBufferInfo(gl, programInfo, triangleBufferInfo);


  let fieldOfViewRadians = degToRad(60);

  let uniformsThatAreTheSameForAllObjects = {
    u_lightWorldPos:         [-50, 30, 100],
    u_viewInverse:           m4.identity(),
    u_lightColor:            [1, 1, 1, 1],
  };

  let uniformsThatAreComputedForEachObject = {
    u_worldViewProjection:   m4.identity(),
    u_world:                 m4.identity(),
    u_worldInverseTranspose: m4.identity(),
  };

  let rand = function(min, max) {
    if (max === undefined) {
      max = min;
      min = 0;
    }
    return min + Math.random() * (max - min);
  };

  let randInt = function(range) {
    return Math.floor(Math.random() * range);
  };

  let textures = [
    textureUtils.makeStripeTexture(gl, { color1: "#FFF", color2: "#CCC", }),
    textureUtils.makeCheckerTexture(gl, { color1: "#FFF", color2: "#CCC", }),
    textureUtils.makeCircleTexture(gl, { color1: "#FFF", color2: "#CCC", }),
  ];

  let objects = [];
  let numObjects = 300;
  let baseColor = rand(240);
  for (let ii = 0; ii < numObjects; ++ii) {
    objects.push({
      radius: rand(150),
      xRotation: rand(Math.PI * 2),
      yRotation: rand(Math.PI),
      materialUniforms: {
        u_colorMult:             chroma.hsv(rand(baseColor, baseColor + 120), 0.5, 1).gl(),
        u_diffuse:               textures[randInt(textures.length)],
        u_specular:              [1, 1, 1, 1],
        u_shininess:             rand(500),
        u_specularFactor:        rand(1),
      },
    });
  }

  let bufferInfo;
  let vao;
  //ui
  let toggle = document.querySelector("#toggle");
  toggle.addEventListener('click', toggleShape);

  function toggleShape() {
    if (bufferInfo === quadBufferInfo) {
      bufferInfo = triangleBufferInfo;
      vao        = triangleVAO;
      toggle.textContent = "switch to quads(▢)";
    } else {
      bufferInfo = quadBufferInfo;
      vao        = quadVAO;
      toggle.textContent = "switch to triangles(△)";
    }
  }
  toggleShape();

  //finished setup

  function drawScene(time) {
    time = 5 + time * 0.0001;

    twgl.resizeCanvasToDisplaySize(gl.canvas);
 
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    gl.enable(gl.DEPTH_TEST);
 
    let aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    let projectionMatrix =
        m4.perspective(fieldOfViewRadians, aspect, 1, 2000);
 
    let cameraPosition = [0, 0, 100];
    let target = [0, 0, 0];
    let up = [0, 1, 0];
    let cameraMatrix = m4.lookAt(cameraPosition, target, up, uniformsThatAreTheSameForAllObjects.u_viewInverse);

    let viewMatrix = m4.inverse(cameraMatrix);

    let viewProjectionMatrix = m4.multiply(projectionMatrix, viewMatrix);

    gl.useProgram(programInfo.program);

    
    gl.bindVertexArray(vao);
 
    twgl.setUniforms(programInfo, uniformsThatAreTheSameForAllObjects);
 
    objects.forEach(function(object) {
 
      let worldMatrix = m4.identity();
      worldMatrix = m4.yRotate(worldMatrix, object.yRotation * time);
      worldMatrix = m4.xRotate(worldMatrix, object.xRotation * time);
      worldMatrix = m4.translate(worldMatrix, 0, 0, object.radius,
         uniformsThatAreComputedForEachObject.u_world);
 
      m4.multiply(viewProjectionMatrix, worldMatrix, uniformsThatAreComputedForEachObject.u_worldViewProjection);
      m4.transpose(m4.inverse(worldMatrix), uniformsThatAreComputedForEachObject.u_worldInverseTranspose);
 
      twgl.setUniforms(programInfo, uniformsThatAreComputedForEachObject);
 
      twgl.setUniforms(programInfo, object.materialUniforms);
 
      twgl.drawBufferInfo(gl, bufferInfo);
    });

    requestAnimationFrame(drawScene);
  }
  requestAnimationFrame(drawScene);

 
}

window.addEventListener("load",()=>{main();});
