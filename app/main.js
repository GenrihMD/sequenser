const canvasBoundingRect = canvas.getBoundingClientRect()
canvas.width = canvasBoundingRect.width
canvas.height = canvasBoundingRect.height
const ctx = canvas.getContext("2d");

let plx = 0
let sign = 1

function draw() {
    const ctx = document.getElementById("canvas").getContext("2d");
    for (let i = 0; i < 6; i++) {
        for (let j = 0; j < 6; j++) {
            ctx.fillStyle = `rgb(${Math.floor(255 - plx * i)}, ${Math.floor(
                255 - plx * j
            )}, 0)`;
            ctx.fillRect(j * 100, i * 100, 100, 100)
        }
    }
}

function march() {
    plx += 0.1 * sign
    if (plx > 42.5) {
        sign = -1
    }
    if (plx < 0) {
        sign = 1
    }
    draw();
    setTimeout(march, 1);
}

march();
