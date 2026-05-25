import { create } from 'zustand';
import type { Track, LyricLine } from '@/types';

interface LyricState {
  currentLyric: LyricLine[];
  currentLineIndex: number;
  showDesktopLyric: boolean;
  lyricSource: 'embedded' | 'lrc' | 'none';

  loadLyric: (track: Track) => Promise<void>;
  syncToTime: (currentTime: number) => void;
  toggleDesktopLyric: () => void;
  setShowDesktopLyric: (show: boolean) => void;
}

export const useLyricStore = create<LyricState>((set) => ({
  currentLyric: [],
  currentLineIndex: -1,
  showDesktopLyric: false,
  lyricSource: 'none',

  loadLyric: async (track) => {
    try {
      const lines = await window.api.parseLyric(track);
      if (lines.length > 0) {
        set({ currentLyric: lines, lyricSource: 'lrc', currentLineIndex: -1 });
      } else if (track.hasLyrics) {
        set({ currentLyric: [], lyricSource: 'embedded', currentLineIndex: -1 });
      } else {
        set({ currentLyric: [], lyricSource: 'none', currentLineIndex: -1 });
      }
    } catch {
      set({ currentLyric: [], lyricSource: 'none', currentLineIndex: -1 });
    }
  },

  syncToTime: (currentTime) => {
    set((s) => {
      let idx = -1;
      for (let i = 0; i < s.currentLyric.length; i++) {
        if (s.currentLyric[i].time <= currentTime) {
          idx = i;
        } else {
          break;
        }
      }
      return { currentLineIndex: idx };
    });
  },

  toggleDesktopLyric: () => {
    set((s) => {
      const next = !s.showDesktopLyric;
      if (next) {
        window.api.openDesktopLyrics();
      } else {
        window.api.closeDesktopLyrics();
      }
      return { showDesktopLyric: next };
    });
  },

  setShowDesktopLyric: (show) => set({ showDesktopLyric: show }),
}));
