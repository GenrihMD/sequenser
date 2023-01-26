const TONES_NUMBER = 12
const BEATS_NUMBER = 16

const canvasBoundingRect = canvas.getBoundingClientRect()
const w = canvas.width = canvasBoundingRect.width
const h = canvas.height = canvasBoundingRect.height

const ctx = canvas.getContext('2d')

const  grd = ctx.createLinearGradient(0, w, 0, 0);
grd.addColorStop(0.2, "red");
grd.addColorStop(1, "green");
ctx.fillStyle = grd;

const beatWidth = w / BEATS_NUMBER
const lineHeight = h / TONES_NUMBER

class Pattern {
    constructor() {
        this.beats = [
            [1], [], [], [2],
            [], [], [3], [],
            [], [], [1], [],
            [2], [], [], [3 ],
        ]
    }
}

const p = new Pattern()

function drawBeats() {
    ctx.clearRect(0,0, w, h)
    for (let i = 0; i < BEATS_NUMBER; i++) {
        const beat = p.beats[i]
        beat.forEach( b => ctx.fillRect(i * beatWidth, h - b * lineHeight, beatWidth, lineHeight) )
    }
}

canvas.addEventListener('click', function (e) {
    const x = e.offsetX
    const y = e.offsetY;

    const lineNumber = Math.floor((h - y) / lineHeight) + 1
    const beatNumber = Math.floor(x / beatWidth)

    const beat = p.beats[beatNumber]
    console.log(beat)

    if (beat.includes(lineNumber)) {
        beat.splice(beat.indexOf(lineNumber), 1);
    } else {
        beat.push(lineNumber)
    }

    drawBeats();
})

drawBeats();

////////////////
//// AUDIO  ////
////////////////

const TONES = [
    55, 58.2706, 61.7354, 65.4064, 69.2958,
    73.4162, 77.7818, 82.4070, 87.3072, 92.4986,
    97.9990, 103.8260
]

const DRUM_FILES = [
    '/assets/Drum Shots/Kicks/BVKER - Drillers Kick - 01.wav',
    '/assets/Drum Shots/Snares/BVKER - Drillers Snare - 01.wav',
    'assets/Drum Shots/Cymbals/BVKER - Drillers Closed Hat - 01.wav',
    '/assets/Drum Shots/Percs/BVKER - Drillers Perc 03.wav'
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
    getFile(audioCtx, file).then( b => DRUMS[index] = b )
})

let connected = false;

class Player {

    constructor(pattern) {
        this.pattern = pattern
        this.step = 0
        this.isStarted = false
        this.isConnected = false
    }

    setTone(tone) {
        oscillator.frequency.value = tone
    }

    playpause() {
        if (!this.isConnected) {
            this.interval = setInterval(() => {
                if (this.step >= 16) this.step = 0
                let toneNum = this.pattern.beats[this.step][0] - 1
                if (toneNum == undefined) return;

                playSample(audioCtx, DRUMS[toneNum], audioCtx.currentTime)

                this.step++;
            }, 120)
        }
        else {
            clearInterval(this.interval)
        }
        this.isConnected = !this.isConnected;
    }
}

const player = new Player(p)

window.addEventListener('keydown', function () {
    audioCtx.resume().then(() => {
        player.playpause()
    });
})



