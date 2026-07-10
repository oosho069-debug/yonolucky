class SoundManagerClass {
  private audioCtx: AudioContext | null = null;
  private isEnabled: boolean = true;

  init() {
    if (typeof window === "undefined") return;
    if (!this.audioCtx) {
      this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  // General UI Click
  playClick() {
    if (!this.isEnabled) return;
    this.init();
    if (!this.audioCtx) return;
    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(800, this.audioCtx.currentTime); 
      osc.frequency.exponentialRampToValueAtTime(300, this.audioCtx.currentTime + 0.05);
      gain.gain.setValueAtTime(0.5, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.05);
    } catch(e) {}
  }

  // Wingo Tick
  playTick() {
    if (!this.isEnabled) return;
    this.init();
    if (!this.audioCtx) return;
    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(1200, this.audioCtx.currentTime);
      gain.gain.setValueAtTime(0.2, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.03);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.03);
    } catch(e) {}
  }

  // Slot Spin (Synthesized fast blips)
  playSlotSpin() {
    if (!this.isEnabled) return;
    this.init();
    if (!this.audioCtx) return;
    try {
      for (let i = 0; i < 10; i++) {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.type = "square";
        osc.frequency.setValueAtTime(300 + i * 50, this.audioCtx.currentTime + (i * 0.1));
        gain.gain.setValueAtTime(0.1, this.audioCtx.currentTime + (i * 0.1));
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + (i * 0.1) + 0.05);
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.start(this.audioCtx.currentTime + (i * 0.1));
        osc.stop(this.audioCtx.currentTime + (i * 0.1) + 0.05);
      }
    } catch(e) {}
  }

  // Win Sound
  playWin() {
    if (!this.isEnabled) return;
    this.init();
    if (!this.audioCtx) return;
    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = "triangle";
      // Arpeggio
      osc.frequency.setValueAtTime(440, this.audioCtx.currentTime);
      osc.frequency.setValueAtTime(554, this.audioCtx.currentTime + 0.1);
      osc.frequency.setValueAtTime(659, this.audioCtx.currentTime + 0.2);
      osc.frequency.setValueAtTime(880, this.audioCtx.currentTime + 0.3);
      
      gain.gain.setValueAtTime(0.3, this.audioCtx.currentTime);
      gain.gain.linearRampToValueAtTime(0, this.audioCtx.currentTime + 0.6);
      
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.6);
    } catch(e) {}
  }
}

export const SoundManager = new SoundManagerClass();
