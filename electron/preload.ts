import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('api', {
  scanFolders: (paths: string[]) => ipcRenderer.invoke('scan-folders', paths),
  readFile: (path: string) => ipcRenderer.invoke('read-file', path),
  parseMetadata: (path: string) => ipcRenderer.invoke('parse-metadata', path),
  parseLyric: (track: any) => ipcRenderer.invoke('parse-lyric', track),
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
});
