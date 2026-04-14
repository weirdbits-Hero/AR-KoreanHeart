const video = document.getElementById('video');
const bgCanvas = document.getElementById('bgCanvas');
const mainCanvas = document.getElementById('mainCanvas');

const bgCtx = bgCanvas.getContext('2d');
const ctx = mainCanvas.getContext('2d');

let W = 0, H = 0;
let currentHands = [];

function resize() {
  W = window.innerWidth;
  H = window.innerHeight;
  bgCanvas.width = mainCanvas.width = W;
  bgCanvas.height = mainCanvas.height = H;
}

function initMediaPipe() {
  const hands = new Hands({
    locateFile: f => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${f}`
  });

  hands.setOptions({
    maxNumHands: 2,
    modelComplexity: 1,
    minDetectionConfidence: 0.7,
    minTrackingConfidence: 0.6
  });

  hands.onResults(results => {
    currentHands = results.multiHandLandmarks || [];
  });

  const camera = new Camera(video, {
    onFrame: async () => {
      await hands.send({ image: video });
    },
    width: 1280,
    height: 720
  });

  camera.start();
}

function detectGesture(lm) {
  const thumb = lm[4];
  const index = lm[8];

  const dx = thumb.x - index.x;
  const dy = thumb.y - index.y;

  return Math.sqrt(dx*dx + dy*dy) < 0.05;
}

function render() {
  ctx.clearRect(0, 0, W, H);

  currentHands.forEach(lm => {
    if (detectGesture(lm)) {
      ctx.fillStyle = "pink";
      ctx.beginPath();
      ctx.arc(W/2, H/2, 40, 0, Math.PI*2);
      ctx.fill();
    }
  });

  requestAnimationFrame(render);
}

window.addEventListener('resize', resize);

resize();
initMediaPipe();
render();
