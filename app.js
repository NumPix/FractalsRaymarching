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

const keysPressed = {};

window.addEventListener("keydown", (event) => {
    keysPressed[event.key.toLowerCase()] = true;
});

window.addEventListener("keyup", (event) => {
    keysPressed[event.key.toLowerCase()] = false;
});

function updateCameraPosition() {
    let moveX = 0;
    let moveY = 0;
    let moveZ = 0;

    if (keysPressed['w']) moveZ -= 1;
    if (keysPressed['s']) moveZ += 1;
    if (keysPressed['a']) moveX -= 1;
    if (keysPressed['d']) moveX += 1;
    if (keysPressed['control']) moveY -= 1;
    if (keysPressed[' ']) moveY += 1;

    const len = Math.hypot(moveX, moveZ);

    if (len > 0) {
        moveX /= len;
        moveY /= len;
        moveZ /= len;
    }

    const speed = 0.01;

    renderer.camera.moveForward(moveZ * speed);
    renderer.camera.moveUp(moveY * speed);
    renderer.camera.moveRight(moveX * speed);
}

function renderLoop() {
    if (!renderer) return;

    updateCameraPosition();
    
    renderer.draw(shaderProgram);
    requestAnimationFrame(renderLoop);
}
