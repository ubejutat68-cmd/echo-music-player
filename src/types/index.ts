export interface Track {
  id: string;
  path: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  coverArt: string | null;
  format: string;
  fileSize: number;
  dateAdded: number;
  hasLyrics: boolean;
}

export interface Playlist {
  id: string;
  name: string;
  trackIds: string[];
  coverArt: string | null;
  createdAt: number;
  updatedAt: number;
}

export interface LyricLine {
  time: number;
  text: string;
}

export interface SearchResult {
  tracks: Track[];
  artists: { name: string; trackCount: number }[];
  albums: { name: string; artist: string; trackCount: number; coverArt: string | null }[];
}

export type PlayMode = 'sequential' | 'loop' | 'single' | 'shuffle';
export type EQPreset = 'none' | 'pop' | 'rock' | 'classical' | 'jazz' | 'electronic' | 'custom';
export type ThemeMode = 'light' | 'dark' | 'system';
export type ScanStatus = 'idle' | 'scanning' | 'done' | 'error';
export type SortField = 'title' | 'artist' | 'album' | 'duration' | 'dateAdded';

export const EQ_FREQUENCIES = [32, 64, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];

export const EQ_PRESETS: Record<EQPreset, number[]> = {
  none:     [ 0,  0,  0,  0,  0,  0,  0,  0,  0,  0],
  pop:      [ 0,  0,  3,  3,  0,  2,  2,  0,  0,  0],
  rock:     [ 0,  4,  4,  0,  0,  0,  3,  3,  0,  0],
  classical:[ 2,  2,  0,  0,  0,  0,  0,  1,  1,  1],
  jazz:     [ 0,  2,  2,  0,  1,  1,  0,  0,  0,  0],
  electronic:[4,  4,  0, -2,  0,  0,  0,  3,  3,  0],
  custom:   [ 0,  0,  0,  0,  0,  0,  0,  0,  0,  0],
};
