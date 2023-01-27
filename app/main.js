import { Pattern } from "./patterns.js";

const LINE_NUMBER = 12
const BEATS_NUMBER = 16

const canvasBoundingRect = canvas.getBoundingClientRect()
const w = canvas.width = canvasBoundingRect.width
const h = canvas.height = canvasBoundingRect.height

const beatWidth = w / BEATS_NUMBER
const lineHeight = h / LINE_NUMBER

function getLineY(lineNumber) {
    return lineNumber * lineHeight
}

function getBeatX(beatNumber) {
    return beatNumber * beatWidth
}

const ctx = canvas.getContext('2d')

ctx.fillStyle = 'rgb(229 229 229)'
for (let b = 1; b < BEATS_NUMBER; b+=2) {
    const x = getBeatX(b)
    ctx.fillRect(x, 0, beatWidth, h)
}

ctx.fillStyle = 'rgb(250 250 250 / 25%)'
for (let l = 1; l < LINE_NUMBER; l+=2) {
    const y = getLineY(l)
    ctx.fillRect(0, y, w, lineHeight)
}

function drawLine(x1, y1, x2, y2) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}

ctx.strokeStyle = 'rgb(200 200 200)'
for (let l = 0; l < LINE_NUMBER; l++) {
    const y = getLineY(l)
    drawLine(0, y, w, y)
}

for (let b = 0; b < BEATS_NUMBER; b++) {
    const x = getBeatX(b)
    drawLine(x, 0, x, h)
}

const background = ctx.getImageData(0, 0, w, h)

const grd = ctx.createLinearGradient(0, w, 0, 0);
grd.addColorStop(0.2, "#ff7900d9");
grd.addColorStop(1, "#106822d9");
ctx.fillStyle = grd;

const p = new Pattern()

function drawBeats() {
    console.log(background)
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
    'assets/Breaks & Beatz - Producersbuzz.com/breakz n beatz DnB Kit 3/kickldk16.wav',
    'assets/Breaks & Beatz - Producersbuzz.com/breakz n beatz DnB Kit 1/snareldk01.wav',
    'assets/Drum Shots/Cymbals/BVKER - Drillers Closed Hat - 01.wav',
    'assets/Drum Shots/Cymbals/BVKER - Drillers Open Hat - 03.wav',

    'assets/Drum Shots/Claps/BVKER - Drillers Clap 01.wav',
    'assets/Drum Shots/Claps/BVKER - Drillers Clap 02.wav',
    'assets/Drum Shots/Snares/BVKER - Drillers Snare - 05.wav',
    'assets/Drum Shots/Kicks/BVKER - Drillers Kick - 06.wav',

    'assets/Drum Shots/Cymbals/BVKER - Drillers Crash - 01.wav',
    'assets/Drum Shots/Cymbals/BVKER - Drillers Ride - 01.wav',
    'assets/Breaks & Beatz - Producersbuzz.com/breakz n beatz DnB Kit 3/hatldk11.wav',
    'assets/Breaks & Beatz - Producersbuzz.com/breakz n beatz DnB Klub Kit/chbb31.wav',
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
            }, 100)
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



