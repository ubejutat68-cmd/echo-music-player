import { audioEngine } from './audioEngine';

export class Visualizer {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private animId = 0;
  private running = false;

  mount(canvas: HTMLCanvasElement): void {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.start();
  }

  unmount(): void {
    this.running = false;
    cancelAnimationFrame(this.animId);
  }

  private start(): void {
    this.running = true;
    const draw = () => {
      if (!this.running || !this.canvas || !this.ctx) return;
      const { width, height } = this.canvas;
      const ctx = this.ctx;
      const data = audioEngine.getAnalyserData();

      ctx.clearRect(0, 0, width, height);

      const barWidth = width / data.length;
      for (let i = 0; i < data.length; i++) {
        const barHeight = (data[i] / 255) * height;
        const hue = (i / data.length) * 120 + 200;
        ctx.fillStyle = `hsl(${hue}, 80%, 50%)`;
        ctx.fillRect(i * barWidth, height - barHeight, barWidth - 1, barHeight);
      }

      this.animId = requestAnimationFrame(draw);
    };
    this.animId = requestAnimationFrame(draw);
  }
}

export const visualizer = new Visualizer();
