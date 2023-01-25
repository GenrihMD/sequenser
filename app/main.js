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
            [1], [], [2], [],
            [3], [], [2], [],
            [1], [], [2], [],
            [3], [], [2], [10],
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

const audioCtx = new AudioContext()
const oscillator = audioCtx.createOscillator();
oscillator.type = 'square';

class Player {

    constructor(pattern) {
        this.pattern = pattern
        this.step = 0
        oscillator.connect(audioCtx.destination)
    }

    setTone(tone) {
        oscillator.detune.value = tone
    }

    play() {
        oscillator.start()

        setInterval(() => {
            const toneNum = this.pattern.beats[this.step][0] - 1
            const tone = TONES[toneNum]
            this.setTone(tone)
            oscillator.start()
        }, 1000)
    }
}

const player = new Player(p)

window.addEventListener('keydown', function () {
    audioCtx.resume().then(() => {
        player.play()
    });
})



