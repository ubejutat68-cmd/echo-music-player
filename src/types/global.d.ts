declare module '@/*' {
  const content: any;
  export default content;
}

// Placeholder declarations for modules not yet created
declare module '@/stores/playerStore' {
  import type { Track, PlayMode } from '@/types';

  interface PlayerState {
    currentTrack: Track | null;
    tracks: Track[];
    isPlaying: boolean;
    volume: number;
    currentTime: number;
    duration: number;
    playMode: PlayMode;
    setCurrentTrack: (track: Track | null) => void;
    setTracks: (tracks: Track[]) => void;
    setIsPlaying: (playing: boolean) => void;
    setVolume: (volume: number) => void;
    setCurrentTime: (time: number) => void;
    setDuration: (duration: number) => void;
    setPlayMode: (mode: PlayMode) => void;
    next: () => void;
    prev: () => void;
    pause: () => void;
    resume: () => void;
  }

  export const usePlayerStore: {
    (selector: (state: PlayerState) => any): any;
    getState: () => PlayerState;
  };
}

declare module '@/stores/lyricStore' {
  import type { LyricLine } from '@/types';

  interface LyricState {
    currentLyric: LyricLine[];
    setCurrentLyric: (lines: LyricLine[]) => void;
  }

  export const useLyricStore: {
    (selector: (state: LyricState) => any): any;
    getState: () => LyricState;
  };
}

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
