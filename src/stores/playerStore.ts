import { create } from 'zustand';
import type { Track, PlayMode } from '@/types';
import { shuffle } from '@/utils/shuffle';

interface PlayerState {
  currentTrack: Track | null;
  queue: Track[];
  queueIndex: number;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  playMode: PlayMode;
  isMuted: boolean;

  play: (track: Track) => void;
  pause: () => void;
  resume: () => void;
  next: () => void;
  prev: () => void;
  seek: (time: number) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setIsPlaying: (playing: boolean) => void;
  setVolume: (v: number) => void;
  toggleMute: () => void;
  togglePlayMode: () => void;
  addToQueue: (tracks: Track[]) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
  playAtIndex: (index: number) => void;
}

const order: PlayMode[] = ['sequential', 'loop', 'single', 'shuffle'];

export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentTrack: null,
  queue: [],
  queueIndex: -1,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 0.8,
  playMode: 'sequential',
  isMuted: false,

  play: (track) => {
    const { queue, queueIndex } = get();
    const newQueue = [...queue];
    newQueue.splice(queueIndex + 1, 0, track);
    set({ currentTrack: track, queue: newQueue, queueIndex: queueIndex + 1, isPlaying: true, currentTime: 0 });
  },

  pause: () => set({ isPlaying: false }),
  resume: () => set({ isPlaying: true }),

  next: () => {
    const { queue, queueIndex, playMode } = get();
    if (!queue.length) return;
    let nextIdx: number;
    if (playMode === 'single') {
      nextIdx = queueIndex;
    } else if (playMode === 'shuffle') {
      nextIdx = Math.floor(Math.random() * queue.length);
    } else if (playMode === 'loop' && queueIndex >= queue.length - 1) {
      nextIdx = 0;
    } else {
      nextIdx = Math.min(queueIndex + 1, queue.length - 1);
    }
    set({ currentTrack: queue[nextIdx], queueIndex: nextIdx, isPlaying: true, currentTime: 0 });
  },

  prev: () => {
    const { queue, queueIndex, currentTime } = get();
    if (!queue.length) return;
    if (currentTime > 3) {
      set({ currentTime: 0 });
      return;
    }
    const prevIdx = Math.max(queueIndex - 1, 0);
    set({ currentTrack: queue[prevIdx], queueIndex: prevIdx, isPlaying: true, currentTime: 0 });
  },

  seek: (time) => set({ currentTime: time }),
  setCurrentTime: (time) => set({ currentTime: time }),
  setDuration: (duration) => set({ duration }),
  setIsPlaying: (playing) => set({ isPlaying: playing }),

  setVolume: (v) => set({ volume: Math.max(0, Math.min(1, v)), isMuted: false }),
  toggleMute: () => set((s) => ({ isMuted: !s.isMuted })),

  togglePlayMode: () => {
    const { playMode } = get();
    const idx = order.indexOf(playMode);
    set({ playMode: order[(idx + 1) % order.length] });
  },

  addToQueue: (tracks) => set((s) => ({ queue: [...s.queue, ...tracks] })),
  removeFromQueue: (index) => set((s) => ({
    queue: s.queue.filter((_, i) => i !== index),
    queueIndex: index < s.queueIndex ? s.queueIndex - 1 : s.queueIndex,
  })),
  clearQueue: () => set({ queue: [], queueIndex: -1, currentTrack: null }),

  playAtIndex: (index) => {
    const { queue } = get();
    if (index >= 0 && index < queue.length) {
      set({ currentTrack: queue[index], queueIndex: index, isPlaying: true, currentTime: 0 });
    }
  },
}));
