onmessage = (evt) => {
    const canvas = evt.data.canvas;
    const ctx = canvas.getContext("2d")

    let plx = 0
    let sign = 1

    function draw() {
        for (let i = 0; i < 60; i++) {
            for (let j = 0; j < 60; j++) {
                ctx.fillStyle = `rgb(
                    ${Math.floor(255 - (plx * i / 10))}, 
                    ${Math.floor(255 - (plx * j / 10))}, 
                    0)`;
                const mulX = canvas.width / 60;
                const  mulY = canvas.height / 60;
                ctx.fillRect(
                    j * mulX,
                    i * mulY,
                    mulX,
                    mulY
                )
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
        setTimeout(march, 0);
    }

    march();
};