import { create } from 'zustand';
import type { Track, ScanStatus, SortField } from '@/types';

interface LibraryState {
  tracks: Track[];
  scanProgress: number;
  scanStatus: ScanStatus;
  lastScanPath: string;
  sortBy: SortField;
  sortOrder: 'asc' | 'desc';
  filterText: string;

  scanFolders: (paths: string[]) => Promise<void>;
  importFiles: (paths: string[]) => Promise<void>;
  removeTracks: (ids: string[]) => void;
  setSortBy: (field: SortField) => void;
  setSortOrder: (order: 'asc' | 'desc') => void;
  setFilterText: (text: string) => void;
  getByArtist: (artist: string) => Track[];
  getByAlbum: (album: string) => Track[];
  getFilteredTracks: () => Track[];
}

export const useLibraryStore = create<LibraryState>((set, get) => ({
  tracks: [],
  scanProgress: 0,
  scanStatus: 'idle',
  lastScanPath: '',
  sortBy: 'dateAdded',
  sortOrder: 'desc',
  filterText: '',

  scanFolders: async (paths) => {
    set({ scanStatus: 'scanning', scanProgress: 0, lastScanPath: paths[0] });
    try {
      const tracks = await window.api.scanFolders(paths);
      set((s) => {
        const existing = new Set(s.tracks.map((t) => t.path));
        const newTracks = tracks.filter((t) => !existing.has(t.path));
        return { tracks: [...s.tracks, ...newTracks], scanStatus: 'done', scanProgress: 100 };
      });
    } catch {
      set({ scanStatus: 'error' });
    }
  },

  importFiles: async (paths) => {
    set({ scanStatus: 'scanning' });
    try {
      const results: Track[] = [];
      for (const p of paths) {
        const meta = await window.api.parseMetadata(p);
        results.push(meta as Track);
      }
      set((s) => {
        const existing = new Set(s.tracks.map((t) => t.path));
        const newTracks = results.filter((t) => !existing.has(t.path));
        return { tracks: [...s.tracks, ...newTracks], scanStatus: 'done' };
      });
    } catch {
      set({ scanStatus: 'error' });
    }
  },

  removeTracks: (ids) => set((s) => ({
    tracks: s.tracks.filter((t) => !ids.includes(t.id)),
  })),

  setSortBy: (sortBy) => set({ sortBy }),
  setSortOrder: (order) => set({ sortOrder: order }),
  setFilterText: (filterText) => set({ filterText }),

  getByArtist: (artist) => get().tracks.filter((t) => t.artist === artist),
  getByAlbum: (album) => get().tracks.filter((t) => t.album === album),

  getFilteredTracks: () => {
    const { tracks, sortBy, sortOrder, filterText } = get();
    let result = tracks;
    if (filterText) {
      const lower = filterText.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(lower) ||
          t.artist.toLowerCase().includes(lower) ||
          t.album.toLowerCase().includes(lower),
      );
    }
    result = [...result].sort((a, b) => {
      const aVal = a[sortBy] ?? '';
      const bVal = b[sortBy] ?? '';
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortOrder === 'asc' ? Number(aVal) - Number(bVal) : Number(bVal) - Number(aVal);
    });
    return result;
  },
}));
