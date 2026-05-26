import type { Track, LyricLine } from './index';

export interface ElectronAPI {
  scanFolders(paths: string[]): Promise<Track[]>;
  readFile(path: string): Promise<ArrayBuffer>;
  parseMetadata(path: string): Promise<Partial<Track>>;
  parseLyric(track: Track): Promise<LyricLine[]>;
  selectFolder: () => Promise<string[]>;
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
  neteaseSearch: (query: string, page?: number) => Promise<any[]>;
  neteaseSongUrl: (id: number) => Promise<string | null>;
  neteaseLyric: (id: number) => Promise<string | null>;
  bilibiliSearch: (query: string, page?: number) => Promise<any[]>;
  bilibiliAudioUrl: (bvid: string, cid?: number) => Promise<{ url: string; cid: number } | null>;
  myfreemp3Search: (query: string, page?: number) => Promise<any[]>;
  myfreemp3SongUrl: (songId: string) => Promise<{ songUrl: string; coverUrl: string; title: string; artist: string } | null>;
  fetchBuffer: (url: string, referer?: string) => Promise<ArrayBuffer>;
  getPlayerState: () => Promise<any>;
  syncPlayerState: (state: any) => void;
  onPlayerStateUpdate: (callback: (state: any) => void) => void;
  sendPlayerAction: (action: string) => void;
  onPlayerAction: (callback: (action: string) => void) => void;
}

declare global {
  interface Window {
    api: ElectronAPI;
  }
}
