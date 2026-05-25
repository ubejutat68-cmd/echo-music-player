import type { Track, LyricLine } from './index';

export interface ElectronAPI {
  scanFolders(paths: string[]): Promise<Track[]>;
  readFile(path: string): Promise<ArrayBuffer>;
  parseMetadata(path: string): Promise<Partial<Track>>;
  parseLyric(track: Track): Promise<LyricLine[]>;
  store: {
    get(key: string): Promise<any>;
    set(key: string, value: any): Promise<void>;
    delete(key: string): Promise<void>;
  };
  openMiniPlayer(): void;
  closeMiniPlayer(): void;
  openDesktopLyrics(): void;
  closeDesktopLyrics(): void;
  onMediaKey(callback: (action: 'play' | 'pause' | 'next' | 'prev') => void): void;
}

declare global {
  interface Window {
    api: ElectronAPI;
  }
}
