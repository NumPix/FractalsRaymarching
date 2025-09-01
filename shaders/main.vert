// main.vert

#version 300 es
precision highp float;

in vec3 a_posisiton;

void main() {
    gl_Position = vec4(a_posisiton, 1.0);
}
