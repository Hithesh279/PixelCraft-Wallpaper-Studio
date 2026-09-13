// animator.js — Animated wallpaper preview & WebM video export

let _animFrameId = null;
let _isAnimating = false;

/**
 * Start a live animation loop on a canvas.
 * @param {HTMLCanvasElement} canvas
 * @param {function} drawFn - called each frame with (timeOffset)
 * @param {function} onFrame - optional callback per frame
 */
export function startAnimation(canvas, drawFn, onFrame) {
  if (_isAnimating) stopAnimation();
  _isAnimating = true;
  const startTime = performance.now();

  function frame(now) {
    if (!_isAnimating) return;
    const timeOffset = (now - startTime) / 1000; // seconds
    drawFn(timeOffset);
    if (onFrame) onFrame(timeOffset);
    _animFrameId = requestAnimationFrame(frame);
  }

  _animFrameId = requestAnimationFrame(frame);
}

/**
 * Stop the animation loop.
 */
export function stopAnimation() {
  _isAnimating = false;
  if (_animFrameId !== null) {
    cancelAnimationFrame(_animFrameId);
    _animFrameId = null;
  }
}

export function isAnimating() {
  return _isAnimating;
}

/**
 * Record the canvas animation for durationMs milliseconds, then download as WebM.
 * @param {HTMLCanvasElement} canvas
 * @param {function} drawFn - called each frame with (timeOffset)
 * @param {number} durationMs - how long to record in ms (default 5000)
 * @param {function} onProgress - called with (0..1) progress
 * @returns {Promise<void>}
 */
export function recordAnimation(canvas, drawFn, durationMs = 5000, onProgress) {
  return new Promise((resolve, reject) => {
    const wasAnimating = _isAnimating;
    stopAnimation();

    const stream = canvas.captureStream(30);
    const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
      ? 'video/webm;codecs=vp9'
      : 'video/webm';

    const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 8_000_000 });
    const chunks = [];

    recorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };

    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'wllpr-animated.webm';
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
      if (wasAnimating) startAnimation(canvas, drawFn);
      resolve();
    };

    recorder.start();
    const startTime = performance.now();

    function recordFrame(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / durationMs, 1);
      if (onProgress) onProgress(progress);
      drawFn(elapsed / 1000);

      if (elapsed < durationMs) {
        requestAnimationFrame(recordFrame);
      } else {
        recorder.stop();
      }
    }

    requestAnimationFrame(recordFrame);
  });
}
