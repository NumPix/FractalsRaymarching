#version 300 es
precision highp float;

out vec4 fragColor;

uniform vec3 u_cameraPosition;
uniform mat3 u_cameraRotation;
uniform vec2 u_resolution;
uniform float u_fov;

struct Ray {
    vec3 origin;
    vec3 direction;
};

float sphere(in vec3 p, in vec3 c, float r) {
    return length(p - c) - r;
}

vec3 march(Ray ray) {
    float total_distance = 0.0f;
    const int NUMBER_OF_STEPS = 32;
    const float MINIMUM_HIT_DISTANCE = 0.001f;
    const float MAXIMUM_TRACE_DISTANCE = 1000.0f;   

    for (int i = 0; i < NUMBER_OF_STEPS; ++i) {
        vec3 current_position = ray.origin + total_distance * ray.direction;
        float distance_to_closest = sphere(current_position, vec3(0.0f), 1.0f);

        if (distance_to_closest < MINIMUM_HIT_DISTANCE) {
            return vec3(i / NUMBER_OF_STEPS, 1.0f, 0.0f);
        }

        if (total_distance > MAXIMUM_TRACE_DISTANCE) {
            break;
        }

        total_distance += distance_to_closest;
    }
    
    return vec3(0.0f);
}

Ray generateRay(vec2 uv) {
    float z = -1.0 / tan(radians(u_fov) * 0.5f);
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