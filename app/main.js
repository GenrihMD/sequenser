const TONES_NUMBER = 12
const BEATS_NUMBER = 16

const canvasBoundingRect = canvas.getBoundingClientRect()
const w = canvas.width = canvasBoundingRect.width
const h = canvas.height = canvasBoundingRect.height

const beatWidth = w / BEATS_NUMBER
const lineHeight = h / TONES_NUMBER

const ctx = canvas.getContext('2d')
ctx.strokeStyle = 'black'

function drawLine(x1, y1, x2, y2) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}

for (let i = 0; i < TONES_NUMBER; i++) {
    drawLine(0, i * lineHeight, w, i * lineHeight)
}

for (let j = 0; j < BEATS_NUMBER; j++) {
    drawLine(j * beatWidth, 0, j * beatWidth, h)
}

const background = ctx.getImageData(0, 0, w, h)

const  grd = ctx.createLinearGradient(0, w, 0, 0);
grd.addColorStop(0.2, "red");
grd.addColorStop(1, "green");
ctx.fillStyle = grd;


class Pattern {
    constructor() {
        this.beats = [
            [1, 3], [], [1, 3, 4], [],
            [2, 3], [], [3], [],
            [3], [3], [1, 3], [],
            [2, 3], [], [3], [3 ],
        ]
    }
}

const p = new Pattern()

function drawBeats() {
    ctx.clearRect(0,0, w, h)
    ctx.putImageData(background, 0, 0)
    for (let i = 0; i < BEATS_NUMBER; i++) {
        const beat = p.beats[i]
        beat.forEach( b => ctx.fillRect(i * beatWidth, h - b * lineHeight, beatWidth, lineHeight) )
    }
}

//////////////////////////

canvas.addEventListener('click', function (e) {
    const x = e.offsetX
    const y = e.offsetY;

    const lineNumber = Math.floor((h - y) / lineHeight) + 1
    const beatNumber = Math.floor(x / beatWidth)

    const beat = p.beats[beatNumber]

    if (beat.includes(lineNumber)) {
        beat.splice(beat.indexOf(lineNumber), 1);
    } else {
        beat.push(lineNumber)
    }

    requestAnimationFrame(drawBeats);
})

drawBeats();


///////////////////////////
///////// AUDIO ///////////
///////////////////////////

const TONES = [
    55, 58.2706, 61.7354, 65.4064, 69.2958,
    73.4162, 77.7818, 82.4070, 87.3072, 92.4986,
    97.9990, 103.8260
]

const DRUM_FILES = [
    '/assets/Drum Shots/Kicks/BVKER - Drillers Kick - 01.wav',
    '/assets/Drum Shots/Snares/BVKER - Drillers Snare - 01.wav',
    '/assets/Drum Shots/Cymbals/BVKER - Drillers Closed Hat - 01.wav',
    '/assets/Drum Shots/Cymbals/BVKER - Drillers Open Hat - 03.wav',

    '/assets/Drum Shots/Percs/BVKER - Drillers Clap 01.wav',
    '/assets/Drum Shots/Percs/BVKER - Drillers Clap 02.wav',
    '/assets/Drum Shots/Percs/BVKER - Drillers Snare - 05.wav',
    '/assets/Drum Shots/Percs/BVKER - Drillers Kick - 06.wav',

    '/assets/Drum Shots/Percs/BVKER - Drillers Crash - 01.wav',
    '/assets/Drum Shots/Percs/BVKER - Drillers Ride - 01.wav',
    '/assets/Drum Shots/Percs/BVKER - Drillers 808 - 16 - (A).wav',
    '/assets/Drum Shots/Percs/BVKER - Drillers Perc 03.wav',
]

const DRUMS = []

async function getFile(audioContext, filepath) {
    const response = await fetch(filepath);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    return audioBuffer;
}

function playSample(audioContext, audioBuffer, time) {
    const sampleSource = new AudioBufferSourceNode(audioCtx, {
        buffer: audioBuffer,
        playbackRate: 1,
    });
    sampleSource.connect(audioContext.destination);
    sampleSource.start(time);
    return sampleSource;
}

const audioCtx = new AudioContext()

DRUM_FILES.forEach( (file, index) => {
    getFile(audioCtx, file).then( d => DRUMS[index] = d )
})

class Player {

    constructor(pattern) {
        this.pattern = pattern
        this.step = 0
        this.isStarted = false
    }

    playpause() {
        if (!this.isStarted) {
            this.interval = setInterval(() => {
                if (this.step >= 16) this.step = 0

                this.pattern.beats[this.step].forEach( toneNum => {
                    playSample(audioCtx, DRUMS[toneNum - 1], audioCtx.currentTime)
                })


                this.step++;
            }, 120)
        }
        else {
            clearInterval(this.interval)
        }
        this.isStarted = !this.isStarted;
    }
}

const player = new Player(p)

window.addEventListener('keydown', function () {
    audioCtx.resume().then(() => {
        player.playpause()
    });
})



