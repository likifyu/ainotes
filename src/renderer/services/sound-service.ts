// Sound Effects Service - 使用 Web Audio API 生成优美音效

class SoundService {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;

  constructor() {
    // 延迟初始化音频上下文（用户交互后）
  }

  private initAudio() {
    if (this.audioContext) return;

    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.audioContext.createGain();
      this.masterGain.gain.value = 0.5;
      this.masterGain.connect(this.audioContext.destination);
    } catch (e) {
      console.warn('Audio context not supported');
    }
  }

  // 播放完成提示音（清脆的叮声）
  playComplete() {
    this.initAudio();
    if (!this.audioContext || !this.masterGain) return;

    const now = this.audioContext.currentTime;

    // 主音 - C6
    const osc1 = this.audioContext.createOscillator();
    const gain1 = this.audioContext.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(1046.5, now);
    osc1.frequency.exponentialRampToValueAtTime(1046.5, now + 0.1);
    gain1.gain.setValueAtTime(0.4, now);
    gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
    osc1.connect(gain1);
    gain1.connect(this.masterGain);
    osc1.start(now);
    osc1.stop(now + 0.6);

    // 泛音 - E6
    const osc2 = this.audioContext.createOscillator();
    const gain2 = this.audioContext.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1318.5, now);
    gain2.gain.setValueAtTime(0.2, now);
    gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
    osc2.connect(gain2);
    gain2.connect(this.masterGain);
    osc2.start(now);
    osc2.stop(now + 0.4);

    // 泛音 - G6
    const osc3 = this.audioContext.createOscillator();
    const gain3 = this.audioContext.createGain();
    osc3.type = 'sine';
    osc3.frequency.setValueAtTime(1568, now);
    gain3.gain.setValueAtTime(0.15, now);
    gain3.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    osc3.connect(gain3);
    gain3.connect(this.masterGain);
    osc3.start(now + 0.05);
    osc3.stop(now + 0.35);
  }

  // 保存成功音效（柔和的确认音）
  playSave() {
    this.initAudio();
    if (!this.audioContext || !this.masterGain) return;

    const now = this.audioContext.currentTime;

    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.setValueAtTime(660, now + 0.1);
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.3);
  }

  // 错误音效（低沉的提示）
  playError() {
    this.initAudio();
    if (!this.audioContext || !this.masterGain) return;

    const now = this.audioContext.currentTime;

    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.setValueAtTime(150, now + 0.1);
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.4);
  }

  // 按钮点击音效（轻快的反馈）
  playClick() {
    this.initAudio();
    if (!this.audioContext || !this.masterGain) return;

    const now = this.audioContext.currentTime;

    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, now);
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.1);
  }

  // AI 生成完成音效（科技感）
  playAIGenerate() {
    this.initAudio();
    if (!this.audioContext || !this.masterGain) return;

    const now = this.audioContext.currentTime;

    // 科幻感的生成音效
    for (let i = 0; i < 3; i++) {
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400 + i * 200, now + i * 0.08);
      osc.frequency.exponentialRampToValueAtTime(800 + i * 200, now + i * 0.08 + 0.15);
      gain.gain.setValueAtTime(0.1, now + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.08 + 0.2);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now + i * 0.08);
      osc.stop(now + i * 0.08 + 0.2);
    }
  }
}

export const soundService = new SoundService();
export default soundService;
