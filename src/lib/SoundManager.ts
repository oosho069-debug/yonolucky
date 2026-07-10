class SoundManagerClass {
  private ctx: AudioContext | null = null;
  private isEnabled = true;

  init() {
    if (!this.ctx && typeof window !== "undefined") {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
  }

  toggle(enabled: boolean) {
    this.isEnabled = enabled;
  }

  private playTone(freq: number, type: OscillatorType, duration: number, vol = 0.1) {
    if (!this.isEnabled || !this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    
    gain.gain.setValueAtTime(vol, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  click() {
    this.init();
    this.playTone(600, 'sine', 0.1, 0.05);
  }

  coin() {
    this.init();
    this.playTone(987.77, 'sine', 0.1, 0.1); // B5
    setTimeout(() => this.playTone(1318.51, 'sine', 0.3, 0.1), 100); // E6
  }

  spin() {
    this.init();
    let tick = 0;
    const inter = setInterval(() => {
      this.playTone(300, 'square', 0.05, 0.02);
      tick++;
      if (tick > 20) clearInterval(inter);
    }, 100);
  }

  win() {
    this.init();
    const notes = [440, 554, 659, 880]; // A major chord
    notes.forEach((f, i) => {
      setTimeout(() => this.playTone(f, 'sine', 0.5, 0.1), i * 150);
    });
  }

  megaWin() {
    this.init();
    // Siren-like celebration
    for (let i = 0; i < 10; i++) {
      setTimeout(() => {
        this.playTone(400 + (i % 2) * 200, 'square', 0.2, 0.1);
        this.playTone(600 + (i % 2) * 200, 'sawtooth', 0.2, 0.1);
      }, i * 200);
    }
  }

  crash() {
    this.init();
    if (!this.isEnabled || !this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    
    osc.frequency.setValueAtTime(400, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(50, this.ctx.currentTime + 1.0);
    
    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 1.0);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 1.0);
  }
}

export const SoundManager = new SoundManagerClass();
