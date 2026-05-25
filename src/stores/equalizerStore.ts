import { create } from 'zustand';
import type { EQPreset } from '@/types';
import { EQ_PRESETS } from '@/types';

interface EqualizerState {
  enabled: boolean;
  preset: EQPreset;
  bands: number[];

  toggle: () => void;
  setPreset: (preset: EQPreset) => void;
  setBand: (index: number, value: number) => void;
  reset: () => void;
}

export const useEqualizerStore = create<EqualizerState>((set) => ({
  enabled: false,
  preset: 'none',
  bands: [...EQ_PRESETS.none],

  toggle: () => set((s) => ({ enabled: !s.enabled })),

  setPreset: (preset) => {
    set({
      preset,
      bands: [...EQ_PRESETS[preset]],
      enabled: preset !== 'none',
    });
  },

  setBand: (index, value) => {
    set((s) => {
      const bands = [...s.bands];
      bands[index] = Math.max(-12, Math.min(12, value));
      return { bands, preset: 'custom' };
    });
  },

  reset: () => set({
    preset: 'none',
    bands: [...EQ_PRESETS.none],
    enabled: false,
  }),
}));
