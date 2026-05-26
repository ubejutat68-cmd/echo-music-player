import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('api', {
  scanFolders: (paths: string[]) => ipcRenderer.invoke('scan-folders', paths),
  readFile: (path: string) => ipcRenderer.invoke('read-file', path),
  parseMetadata: (path: string) => ipcRenderer.invoke('parse-metadata', path),
  parseLyric: (track: any) => ipcRenderer.invoke('parse-lyric', track),
  selectFolder: () => ipcRenderer.invoke('select-folder'),
  store: {
    get: (key: string) => ipcRenderer.invoke('store-get', key),
    set: (key: string, value: any) => ipcRenderer.invoke('store-set', key, value),
    delete: (key: string) => ipcRenderer.invoke('store-delete', key),
  },
  openMiniPlayer: () => ipcRenderer.send('open-mini-player'),
  closeMiniPlayer: () => ipcRenderer.send('close-mini-player'),
  openDesktopLyrics: () => ipcRenderer.send('open-desktop-lyrics'),
  closeDesktopLyrics: () => ipcRenderer.send('close-desktop-lyrics'),
  onMediaKey: (callback: (action: string) => void) => {
    ipcRenderer.on('media-key', (_event, action) => callback(action));
  },
  neteaseSearch: (query: string, page?: number) => ipcRenderer.invoke('netease-search', query, page),
  neteaseSongUrl: (id: number) => ipcRenderer.invoke('netease-song-url', id),
  neteaseLyric: (id: number) => ipcRenderer.invoke('netease-lyric', id),
  bilibiliSearch: (query: string, page?: number) => ipcRenderer.invoke('bilibili-search', query, page),
  bilibiliAudioUrl: (bvid: string, cid?: number) => ipcRenderer.invoke('bilibili-audio-url', bvid, cid),
  myfreemp3Search: (query: string, page?: number) => ipcRenderer.invoke('myfreemp3-search', query, page),
  myfreemp3SongUrl: (songId: string) => ipcRenderer.invoke('myfreemp3-song-url', songId),
  fetchBuffer: (url: string, referer?: string) => ipcRenderer.invoke('fetch-buffer', url, referer),
  getPlayerState: () => ipcRenderer.invoke('get-player-state'),
  syncPlayerState: (state: any) => ipcRenderer.send('sync-player-state', state),
  onPlayerStateUpdate: (callback: (state: any) => void) => {
    ipcRenderer.on('player-state-update', (_e, state) => callback(state));
  },
  sendPlayerAction: (action: string) => ipcRenderer.send('player-action', action),
  onPlayerAction: (callback: (action: string) => void) => {
    ipcRenderer.on('player-action', (_e, action) => callback(action));
  },
});
