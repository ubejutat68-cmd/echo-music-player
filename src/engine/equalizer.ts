import { EQ_FREQUENCIES } from '@/types';

class Equalizer {
  private filters: BiquadFilterNode[] = [];
  private inputNode: GainNode | null = null;

  connect(ctx: AudioContext): AudioNode {
    this.inputNode = ctx.createGain();
    let prev: AudioNode = this.inputNode;

    for (let i = 0; i < EQ_FREQUENCIES.length; i++) {
      const filter = ctx.createBiquadFilter();
      filter.type = 'peaking';
      filter.frequency.value = EQ_FREQUENCIES[i];
      filter.Q.value = 1.0;
      filter.gain.value = 0;
      prev.connect(filter);
      prev = filter;
      this.filters.push(filter);
    }

    return this.inputNode;
  }

  setBands(bands: number[]): void {
    for (let i = 0; i < this.filters.length && i < bands.length; i++) {
      this.filters[i].gain.setValueAtTime(bands[i], this.filters[i].context.currentTime);
    }
  }

  disconnect(): void {
    this.filters = [];
    this.inputNode = null;
  }
}

export const equalizer = new Equalizer();
