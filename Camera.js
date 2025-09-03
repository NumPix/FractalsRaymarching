export class Camera {
    constructor(x, y, z, yaw = 0, pitch = 0, sens = 0.002, fov = 45) {
        this.x = x;
        this.y = y;
        this.z = z;

        this.yaw = yaw;
        this.pitch = pitch;
        this.sens = sens;
        this.fov = fov;
    }

    handleMouseEvent(event) {
        this.yaw   -= event.movementX * this.sens;
        this.pitch += event.movementY * this.sens;

        const maxPitch = Math.PI / 2 - 0.01;
        if (this.pitch > maxPitch) this.pitch = maxPitch;
        if (this.pitch < -maxPitch) this.pitch = -maxPitch;
    }

    getPosition() {
        return [this.x, this.y, this.z];
    }

    getForwardVector() {
        return [
            Math.cos(this.pitch) * Math.sin(this.yaw),  // X
            Math.sin(this.pitch),                       // Y
            Math.cos(this.pitch) * Math.cos(this.yaw)   // Z
        ];
    }
    
    getRightVector() {
        const forward = this.getForwardVector();
        const worldUp = [0, 1, 0];
        return normalize(cross(worldUp, forward));
    }
    
    getUpVector() {
        const forward = this.getForwardVector();
        const right = this.getRightVector();
        return cross(forward, right);
    }

    getRotationMatrix() {
        const forward = normalize(this.getForwardVector());
        const right = normalize(this.getRightVector());
        const up = normalize(cross(forward, right));

        return [
            ...right, ...up, ...forward
        ];
    }

    moveForward(n) {
        const forward = this.getForwardVector();

        this.x += forward[0] * n;
        this.y += forward[1] * n;
        this.z += forward[2] * n;
    }

    moveRight(n) {
        const right = this.getRightVector();

        this.x += right[0] * n;
        this.y += right[1] * n;
        this.z += right[2] * n;
    }

    moveUp(n) {
        this.y += n;
    }
}

function normalize(v) {
    const len = Math.hypot(...v);
    return v.map(c => c / len);
}

function cross(a, b) {
    return [
        a[1] * b[2] - a[2] * b[1],
        a[2] * b[0] - a[0] * b[2],
        a[0] * b[1] - a[1] * b[0]
    ];
}