// main.frag

#version 300 es
precision highp float;

out vec4 fragColor;

uniform vec3 u_cameraPosition;
uniform mat3 u_cameraRotation;
uniform vec2 u_resolution;
uniform float fov;

struct Ray {
    vec3 origin;
    vec3 direction;
};

Ray generateRay(vec2 uv) {
    float z = -1.0 / tan(radians(fov) * 0.5f);
    vec3 rayCamera = normalize(vec3(uv.xy, z));

    vec3 rayWorld = u_cameraRotation * rayCamera;

    return Ray(u_cameraPosition, normalize(rayWorld));
}

void main() {
    vec2 fragCoord = gl_FragCoord.xy;
    vec2 uv = fragCoord / u_resolution * 2.0f - 1.0f;
    uv.x *= u_resolution.x / u_resolution.y;

    Ray ray = generateRay(uv);
    fragColor = vec4(march(ray), 1.0f);
}