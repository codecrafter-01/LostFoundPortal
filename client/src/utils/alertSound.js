/**
 * alertSound.js
 * Generates real buzz/alert sounds using Web Audio API.
 * No audio files needed — works in all modern browsers.
 */

let audioCtx = null;

const getAudioContext = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  // Resume if suspended (browser autoplay policy)
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
};

/**
 * Play a single beep tone.
 * @param {number} frequency - Hz (e.g. 880 = sharp alert)
 * @param {number} duration  - seconds
 * @param {number} startTime - when to start (audioCtx.currentTime offset)
 * @param {number} volume    - 0 to 1
 * @param {string} type      - oscillator type: sine | square | sawtooth | triangle
 */
const playTone = (frequency, duration, startTime, volume = 0.5, type = "sine") => {
  const ctx = getAudioContext();

  const oscillator = ctx.createOscillator();
  const gainNode   = ctx.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator.type      = type;
  oscillator.frequency.setValueAtTime(frequency, ctx.currentTime + startTime);

  // Fade in + out to avoid clicks
  gainNode.gain.setValueAtTime(0, ctx.currentTime + startTime);
  gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + startTime + 0.01);
  gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + startTime + duration - 0.01);

  oscillator.start(ctx.currentTime + startTime);
  oscillator.stop(ctx.currentTime + startTime + duration);
};

/**
 * 🔔 Standard alert — plays when any new report is submitted.
 * Three quick ascending tones (like a doorbell buzz).
 */
export const playAlertSound = () => {
  try {
    playTone(660, 0.12, 0.00, 0.45, "sine");   // first buzz
    playTone(880, 0.12, 0.14, 0.45, "sine");   // second buzz (higher)
    playTone(990, 0.18, 0.28, 0.50, "sine");   // third buzz (hold)
  } catch (e) {
    // Silent fail — autoplay blocked or browser not supported
  }
};

/**
 * 🎯 Match alert — plays when a smart match is detected.
 * Double buzz with a higher pitch — more urgent.
 */
export const playMatchSound = () => {
  try {
    playTone(1100, 0.10, 0.00, 0.55, "sine");
    playTone(1100, 0.10, 0.12, 0.55, "sine");
    playTone(1320, 0.22, 0.26, 0.60, "sine");
  } catch (e) {
    // Silent fail
  }
};

/**
 * ✅ Success sound — plays when item is returned.
 */
export const playSuccessSound = () => {
  try {
    playTone(523, 0.10, 0.00, 0.40, "sine");  // C5
    playTone(659, 0.10, 0.12, 0.40, "sine");  // E5
    playTone(784, 0.20, 0.24, 0.45, "sine");  // G5
  } catch (e) {
    // Silent fail
  }
};
