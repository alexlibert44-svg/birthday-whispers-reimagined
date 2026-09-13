/**
 * Short, synthesised sound effects (no audio files, no looping).
 * Every call is wrapped so a blocked AudioContext can never crash the page.
 */

let ctx: AudioContext | null = null;

function audioCtx(): AudioContext | null {
  try {
    if (typeof window === "undefined") return null;
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx ??= new Ctor();
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function tone(freq: number, start: number, duration: number, gain: number, type: OscillatorType) {
  const ac = audioCtx();
  if (!ac) return;
  const osc = ac.createOscillator();
  const vol = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ac.currentTime + start);
  vol.gain.setValueAtTime(0.0001, ac.currentTime + start);
  vol.gain.exponentialRampToValueAtTime(gain, ac.currentTime + start + 0.02);
  vol.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + start + duration);
  osc.connect(vol).connect(ac.destination);
  osc.start(ac.currentTime + start);
  osc.stop(ac.currentTime + start + duration + 0.05);
}

/** Bright rising chime for the celebration reveal. */
export function playCelebrationChime() {
  try {
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(f, i * 0.11, 0.5, 0.14, "triangle"));
  } catch {
    /* ignore */
  }
}

/** Soft pop for opening the gift box. */
export function playPop() {
  try {
    tone(880, 0, 0.16, 0.12, "sine");
    tone(1320, 0.06, 0.22, 0.09, "sine");
  } catch {
    /* ignore */
  }
}

/** Very light tick for carousel navigation. */
export function playTick() {
  try {
    tone(660, 0, 0.08, 0.05, "sine");
  } catch {
    /* ignore */
  }
}
