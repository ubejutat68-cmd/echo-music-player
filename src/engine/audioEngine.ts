import { equalizer } from './equalizer';

let onTrackEnded: (() => void) | null = null;

export function setOnTrackEnded(cb: (() => void) | null) {
  onTrackEnded = cb;
}

class AudioEngine {
  private ctx: AudioContext | null = null;
  private source: AudioBufferSourceNode | null = null;
  private gainNode: GainNode | null = null;
  private analyserNode: AnalyserNode | null = null;
  private audioBuffer: AudioBuffer | null = null;
  private startTime = 0;
  private pauseOffset = 0;
  private _isPlaying = false;
  private _duration = 0;

  private getCtx(): AudioContext {
    if (!this.ctx) {
      this.ctx = new AudioContext();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  async loadAndPlay(path: string): Promise<void> {
    this.stop();
    const ctx = this.getCtx();
    const arrayBuffer = await window.api.readFile(path);
    this.audioBuffer = await ctx.decodeAudioData(arrayBuffer);
    this._duration = this.audioBuffer.duration;
    this.pauseOffset = 0;
    this.startSource(ctx);
  }

  private startSource(ctx: AudioContext): void {
    if (!this.audioBuffer) return;

    this.source = ctx.createBufferSource();
    this.source.buffer = this.audioBuffer;

    this.analyserNode = ctx.createAnalyser();
    this.analyserNode.fftSize = 2048;

    this.gainNode = ctx.createGain();

    const eqInput = equalizer.connect(ctx);
    this.source.connect(eqInput);
    eqInput.connect(this.analyserNode);
    this.analyserNode.connect(this.gainNode);
    this.gainNode.connect(ctx.destination);

    this.source.start(0, this.pauseOffset);
    this.startTime = ctx.currentTime - this.pauseOffset;
    this._isPlaying = true;

    this.source.onended = () => {
      this._isPlaying = false;
      if (onTrackEnded) onTrackEnded();
    };
  }

  pause(): void {
    if (!this._isPlaying || !this.ctx) return;
    this.pauseOffset = this.ctx.currentTime - this.startTime;
    this.source?.stop();
    this._isPlaying = false;
  }

  resume(): void {
    if (this._isPlaying || !this.audioBuffer || !this.ctx) return;
    this.startSource(this.ctx);
  }

  stop(): void {
    this._isPlaying = false;
    try { this.source?.stop(); } catch { /* already stopped */ }
    this.source = null;
    this.audioBuffer = null;
    this.pauseOffset = 0;
    this._duration = 0;
  }

  seek(time: number): void {
    if (!this.audioBuffer || !this.ctx) return;
    this.pauseOffset = Math.max(0, Math.min(time, this._duration));
    if (this._isPlaying) {
      this.source?.stop();
      this.startSource(this.ctx);
    }
  }

  setVolume(v: number): void {
    if (this.gainNode) {
      this.gainNode.gain.setValueAtTime(v, this.getCtx().currentTime);
    }
  }

  getCurrentTime(): number {
    if (this._isPlaying && this.ctx) {
      return this.ctx.currentTime - this.startTime;
    }
    return this.pauseOffset;
  }

  getDuration(): number {
    return this._duration;
  }

  getIsPlaying(): boolean {
    return this._isPlaying;
  }

  getAnalyserData(): Uint8Array {
    if (!this.analyserNode) return new Uint8Array(0);
    const data = new Uint8Array(this.analyserNode.frequencyBinCount);
    this.analyserNode.getByteFrequencyData(data);
    return data;
  }

  async loadAndPlayUrl(url: string): Promise<void> {
    this.stop();
    const ctx = this.getCtx();

    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    this.audioBuffer = await ctx.decodeAudioData(arrayBuffer);
    this._duration = this.audioBuffer.duration;
    this.pauseOffset = 0;
    this.startSource(ctx);
  }
}

export const audioEngine = new AudioEngine();
