import { create } from 'zustand';
import type { ThemeMode } from '@/types';

interface ThemeState {
  mode: ThemeMode;
  primaryColor: string;
  surfaceBlur: boolean;
  miniPlayerOnTop: boolean;

  setMode: (mode: ThemeMode) => void;
  setPrimaryColor: (color: string) => void;
  setSurfaceBlur: (enabled: boolean) => void;
  setMiniPlayerOnTop: (onTop: boolean) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  mode: 'dark',
  primaryColor: '#1976d2',
  surfaceBlur: true,
  miniPlayerOnTop: true,

  setMode: (mode) => set({ mode }),
  setPrimaryColor: (color) => set({ primaryColor: color }),
  setSurfaceBlur: (enabled) => set({ surfaceBlur: enabled }),
  setMiniPlayerOnTop: (onTop) => set({ miniPlayerOnTop: onTop }),
}));
