import { Camera } from "./Camera.js";

export class Renderer {
    constructor(canvas_id) {
        this.canvas = getCanvas(canvas_id);

        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        this.canvas.requestPointerLock = this.canvas.requestPointerLock ||
                            this.canvas.mozRequestPointerLock ||
                            this.canvas.webkitRequestPointerLock;

        this.canvas.onclick = () => {
            this.canvas.requestPointerLock();
        };

        this.gl = this.canvas.getContext("webgl2");
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);

        this.camera = new Camera(5, 0, 0, -4.5, -0.1);

        window.addEventListener("mousemove", (e) => {
            if (document.pointerLockElement !== this.canvas) return;
            this.camera.handleMouseEvent(e);
        });

        window.addEventListener("resize", () => {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
            this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        });

        const vertices = new Float32Array([
            -1, -1,
             1, -1,
             1,  1,
            -1,  1
        ]);

        const indices = new Uint16Array([
            0, 1, 2,
            2, 3, 0
        ]);

        this.vbo = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vbo);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, vertices, this.gl.STATIC_DRAW);

        this.ebo = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.ebo);
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, indices, this.gl.STATIC_DRAW);
    }

    setFloat(program, name, value) {
        const loc = this.gl.getUniformLocation(program, name);
        this.gl.uniform1f(loc, value);
    }

    setVec2(program, name, value) {
        const loc = this.gl.getUniformLocation(program, name);
        this.gl.uniform2f(loc, value[0], value[1]);
    }

    setVec3(program, name, value) {
        const loc = this.gl.getUniformLocation(program, name);
        this.gl.uniform3f(loc, value[0], value[1], value[2]);
    }

    setMat3(program, name, value) {
        const loc = this.gl.getUniformLocation(program, name);
        this.gl.uniformMatrix3fv(loc, false, value);
    }

    draw(program) {
        this.gl.useProgram(program);

        const aPosition = this.gl.getAttribLocation(program, "a_position");
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vbo);
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.ebo);
        this.gl.enableVertexAttribArray(aPosition);
        this.gl.vertexAttribPointer(aPosition, 2, this.gl.FLOAT, false, 0, 0);

        this.setVec3(program, "u_cameraPosition", this.camera.getPosition());
        this.setMat3(program, "u_cameraRotation", this.camera.getRotationMatrix());
        this.setVec2(program, "u_resolution", [this.canvas.width, this.canvas.height]);
        this.setFloat(program, "u_fov", 45);

        this.gl.clearColor(0, 0, 0, 1);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        this.gl.drawElements(this.gl.TRIANGLES, 6, this.gl.UNSIGNED_SHORT, 0);
    }
}

function getCanvas(canvas_id) {
    const canvas = document.getElementById(canvas_id);
    if (!canvas || canvas.nodeName !== "CANVAS") {
        console.error('Fatal error: Canvas "' + canvas_id + '" could not be found');
    }
    return canvas;
}
