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

float map(in vec3 p, out vec4 resColor) {

    vec3 w = p;
    float m = dot(w,w);

    vec4 trap = vec4(abs(w), m);
    float dz = 1.0;

    for (int i = 0; i < 8; ++i){
        dz = 8.0*pow(m, 3.5)*dz + 1.0;

        float r = length(w);
        float b = 8.0 * acos(w.y / r);
        float a = 8.0 * atan(w.x, w.z);

        w = p + pow(r, 8.0) * vec3(sin(b)*sin(a) , cos(b), sin(b)*cos(a));

        trap = min(trap, vec4(abs(w), m));
        m = dot(    w,w);
        if (m > 256.0) {
            break;
        }
    }

    resColor = vec4(m, trap.yzw);

    return 0.25*log(m)*sqrt(m)/dz;
}

vec2 isphere(in vec4 sph, in Ray ray) {
    vec3 oc = ray.origin - sph.xyz;
    float b = dot(oc, ray.direction);
	float c = dot(oc,oc) - sph.w*sph.w;
    float h = b*b - c;
    if( h<0.0 ) return vec2(-1.0);
    h = sqrt( h );
    return -b + vec2(-h,h);
}

float shadow(in Ray lightRay)
{   
    float tmax = isphere( vec4(0.0, 0.0, 0.0, 1.25), lightRay).y;

    float t = 0.0;
    for( int i=0; i<256 && t<tmax; i++ )
    {   
        vec4 kk;
        float h = map(lightRay.origin + lightRay.direction*t, kk);
        if( h<0.001 )
            return 0.0;
        t += h;
    }
    return 1.0;
}

vec3 calcNormal( in vec3 pos, in float px )
{
    vec4 tmp;
    vec2 e = vec2(1.0,-1.0)*0.5773*0.25*px;
    return normalize( e.xyy*map( pos + e.xyy,tmp ) + 
					  e.yyx*map( pos + e.yyx,tmp ) + 
					  e.yxy*map( pos + e.yxy,tmp ) + 
					  e.xxx*map( pos + e.xxx,tmp ) );
}

float raycast(Ray ray, out vec3 color) {
    float res = -1.0;

    float total_distance = 0.0f;
    const int NUMBER_OF_STEPS = 32;
    const float MINIMUM_HIT_DISTANCE = 0.001f;
    const float MAXIMUM_TRACE_DISTANCE = 1000.0f;   

    vec4 tra;

    for (int i = 0; i < NUMBER_OF_STEPS; ++i) {
        vec3 current_position = ray.origin + total_distance * ray.direction;
        float distance_to_closest = map(current_position, tra);

        if (distance_to_closest < MINIMUM_HIT_DISTANCE || total_distance > MAXIMUM_TRACE_DISTANCE) {
            break;
        }

        total_distance += distance_to_closest;
    }

    if (total_distance < MAXIMUM_TRACE_DISTANCE) {
        vec3 col;

        col = vec3(0.01);
        col = mix( col, vec3(0.10,0.20,0.30), clamp(tra.y,0.0,1.0) );
        col = mix( col, vec3(0.02,0.10,0.30), clamp(tra.z*tra.z,0.0,1.0) );
        col = mix( col, vec3(0.30,0.10,0.02), clamp(pow(tra.w,6.0),0.0,1.0) );
        col *= 0.5;

        color = col;
        res = total_distance;
    }
    
    return res;
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

    float px = 1.0 / u_resolution.y;

    Ray ray = generateRay(uv);

    vec3 color;
    float t = raycast(ray, color);

    vec3 pos = ray.origin + t * ray.direction;
    vec3 nor = calcNormal(pos, px);

    Ray lightRay = Ray(pos + 0.001*nor, vec3(-1, 1, -0.25));

    float sha = shadow(lightRay);

    fragColor = vec4(mix(color, vec3(0.2f), sha), 1.0);
}