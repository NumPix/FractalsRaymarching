import { Storage } from './Storage.js'
import { Renderer } from './Renderer.js'

const shader_list = ["./shaders/main.vert", "./shaders/main.frag"];
const storage = new Storage(shader_list); 

let renderer;
let shaderProgram;

function createProgram(gl, vertexSources, fragmentSources) {
    const vertexSource = vertexSources.join('\n');
    const fragmentSource = fragmentSources.join('\n');

    const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexSource);
    const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource);

    const program = gl.createProgram();

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.log('Program link error: ' + gl.getProgramInfoLog(program));
    }

    return program;
}

function compileShader(gl, type, source) {
    const shader = gl.createShader(type);

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.log('Shader compile error: ' + gl.getShaderInfoLog(shader));
    }

    return shader;
}

storage.addEventListener("onFilesLoaded", () => {
    renderer = new Renderer("WebGLCanvas");

    const vertexSources = [
        storage.get("./shaders/main.vert")
    ];

    const fragmentSources = [
        storage.get("./shaders/main.frag")
    ]

    shaderProgram = createProgram(renderer.gl, vertexSources, fragmentSources);

    renderLoop();
});

function renderLoop() {
    if (!renderer) return;
    
    renderer.draw(shaderProgram);
    requestAnimationFrame(renderLoop);
}
