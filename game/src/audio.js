// Sizzle & Serve — all sound is synthesized live with WebAudio oscillators:
// short effects for every kitchen action and a quiet original tune underneath.
export class Sfx {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.musicTimer = null;
    this.musicStep = 0;
  }

  ensure() {
    if (!this.ctx) {
      try {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      } catch (e) {
        this.ctx = null;
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
  }

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }

  tone(freq, dur, type = 'sine', vol = 0.12, slideTo = null) {
    if (this.muted || !this.ctx) return;
    const t0 = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
    gain.gain.setValueAtTime(vol, t0);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    osc.connect(gain).connect(this.ctx.destination);
    osc.start(t0);
    osc.stop(t0 + dur);
  }

  pickup() { this.tone(520, 0.08, 'triangle', 0.1, 780); }
  putDown() { this.tone(300, 0.07, 'triangle', 0.09, 210); }
  chop() { this.tone(180, 0.05, 'square', 0.08, 90); }
  chopDone() { this.tone(660, 0.1, 'triangle', 0.1, 990); }
  sizzle() { this.tone(1200, 0.4, 'sawtooth', 0.03, 900); }
  ding() { this.tone(880, 0.25, 'sine', 0.12); this.tone(1320, 0.35, 'sine', 0.08); }
  serve() { this.tone(523, 0.1, 'triangle', 0.12); setTimeout(() => this.tone(784, 0.18, 'triangle', 0.12), 90); }
  wrong() { this.tone(220, 0.25, 'sawtooth', 0.1, 140); }
  trash() { this.tone(400, 0.15, 'square', 0.06, 120); }
  tick() { this.tone(980, 0.05, 'sine', 0.07); }
  gameOver() {
    [392, 330, 262, 196].forEach((f, i) => setTimeout(() => this.tone(f, 0.3, 'triangle', 0.11), i * 160));
  }

  startMusic() {
    if (this.musicTimer) return;
    // A short original loop: a bouncy bass line with a bright top line.
    const bass = [131, 0, 165, 0, 196, 0, 165, 0, 131, 0, 165, 0, 220, 196, 165, 0];
    const top = [523, 659, 784, 659, 587, 784, 880, 784, 659, 587, 523, 0, 587, 659, 587, 0];
    this.musicStep = 0;
    this.musicTimer = setInterval(() => {
      if (this.muted || !this.ctx) return;
      const i = this.musicStep % 16;
      if (bass[i]) this.tone(bass[i], 0.22, 'triangle', 0.05);
      if (top[i]) this.tone(top[i], 0.2, 'sine', 0.04);
      this.musicStep++;
    }, 190);
  }

  stopMusic() {
    if (this.musicTimer) {
      clearInterval(this.musicTimer);
      this.musicTimer = null;
    }
  }
}
