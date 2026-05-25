declare module '@/engine/audioEngine' {
  import type { Track } from '@/types';

  export const audioEngine: {
    loadAndPlay: (path: string) => Promise<void>;
    play: (track: Track) => Promise<void>;
    pause: () => void;
    resume: () => void;
    stop: () => void;
    seek: (time: number) => void;
    setVolume: (volume: number) => void;
    getCurrentTime: () => number;
    getDuration: () => number;
    getIsPlaying: () => boolean;
  };
}
