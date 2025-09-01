class Renderer {
    constructor(canvas_id) {
        this.gl = getWebglContext(getCanvas(canvas_id));
    }

    draw(program) {
        this.gl.useProgram(program);
        
    }
}

function getCanvas(canvas_id) {
    var canvas = document.getElementById(canvas_id);

    if (!canvas || canvas.nodeName !== "CANVAS") {
        console.log('Fatal error: Canvas "' + canvas_id + '" could not be found');
    }

    return canvas;
}

function getWebglContext(canvas) {
    var context;

    context = canvas.getContext('webgl');
    
    if (!context) {
        console.log("No WebGL context could be found");
    }

    return context;
}