const canvasBoundingRect = canvas.getBoundingClientRect()
canvas.width = canvasBoundingRect.width
canvas.height = canvasBoundingRect.height

const offscreen = canvas.transferControlToOffscreen();

const worker = new Worker("/app/canvas-worker.js");
worker.postMessage({ canvas: offscreen }, [offscreen]);


