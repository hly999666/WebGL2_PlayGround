window.vertexShaderSource=
/*glsl*/`#version 300 es
in vec2 a_position;
uniform vec2 u_resolution;
void main() {
vec2 zeroToOne = a_position / u_resolution;
 
 vec2 zeroToTwo = zeroToOne * 2.0;

 vec2 clipSpace = zeroToTwo - 1.0;

 gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);

}
`;
window.fragmentShaderSource=
/*glsl*/`#version 300 es
precision highp float;
out vec4 outColor;
uniform vec4 u_color;
void main() {
 outColor =u_color;
}
`;