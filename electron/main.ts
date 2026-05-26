import { app, BrowserWindow, ipcMain, globalShortcut, dialog } from 'electron';
import { createMainWindow, getMainWindow } from './windows/mainWindow';
import { createMiniPlayer, closeMiniPlayer, getMiniPlayerWindow } from './windows/miniPlayer';
import { createDesktopLyric, closeDesktopLyric, getLyricWindow } from './windows/desktopLyric';
import { createTray } from './windows/tray';
import { scanFolders } from './ipc/fileScanner';
import { parseMetadata } from './ipc/metadataParser';
import { parseLyric } from './ipc/lyricParser';
import { getStoreValue, setStoreValue, deleteStoreValue } from './ipc/store';
import { searchNeteaseMusic, getNeteaseSongUrl, getNeteaseLyric } from './ipc/neteaseApi';
import { searchBilibiliMusic, getBilibiliAudioUrl } from './ipc/bilibiliApi';
import { searchMyFreeMp3, getMyFreeMp3SongUrl } from './ipc/myfreeMp3Api';
import { APP_CONFIG } from '../src/config/appConfig';
import * as fs from 'fs';
import * as https from 'https';
import * as http from 'http';

// Player state cache for cross-window sync
let playerStateCache: any = { currentTrack: null, isPlaying: false, currentTime: 0, duration: 0 };

function broadcastPlayerState(state: any): void {
  playerStateCache = { ...playerStateCache, ...state };
  const mini = getMiniPlayerWindow();
  const lyric = getLyricWindow();
  if (mini && !mini.isDestroyed()) {
    mini.webContents.send('player-state-update', playerStateCache);
  }
  if (lyric && !lyric.isDestroyed()) {
    lyric.webContents.send('player-state-update', playerStateCache);
  }
}

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    const win = getMainWindow();
    if (win) {
      if (win.isMinimized()) win.restore();
      win.show();
      win.focus();
    }
  });

  app.whenReady().then(() => {
    app.setName(APP_CONFIG.name);
    registerIpcHandlers();
    createMainWindow();
    createTray();
    registerMediaKeys();
  });

  app.on('window-all-closed', () => {
    app.quit();
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });

  app.on('will-quit', () => {
    globalShortcut.unregisterAll();
  });
}

function registerIpcHandlers(): void {
  ipcMain.handle('select-folder', async () => {
    const win = getMainWindow();
    if (!win) return [];
    const result = await dialog.showOpenDialog(win, {
      properties: ['openDirectory'],
      title: '选择音乐文件夹',
    });
    return result.filePaths;
  });

  ipcMain.handle('scan-folders', async (_e, paths: string[]) => {
    return scanFolders(paths);
  });

  ipcMain.handle('read-file', async (_e, filePath: string) => {
    return fs.readFileSync(filePath).buffer;
  });

  ipcMain.handle('parse-metadata', async (_e, filePath: string) => {
    return parseMetadata(filePath);
  });

  ipcMain.handle('parse-lyric', async (_e, track: any) => {
    return parseLyric(track);
  });

  ipcMain.handle('store-get', async (_e, key: string) => {
    return getStoreValue(key);
  });

  ipcMain.handle('store-set', async (_e, key: string, value: any) => {
    setStoreValue(key, value);
  });

  ipcMain.handle('store-delete', async (_e, key: string) => {
    deleteStoreValue(key);
  });

  ipcMain.on('open-mini-player', () => {
    createMiniPlayer();
  });

  ipcMain.on('close-mini-player', () => {
    closeMiniPlayer();
  });

  ipcMain.on('open-desktop-lyrics', () => {
    createDesktopLyric();
  });

  ipcMain.on('close-desktop-lyrics', () => {
    closeDesktopLyric();
  });

  ipcMain.handle('netease-search', async (_e, query: string, page?: number) => {
    return searchNeteaseMusic(query, page || 1);
  });

  ipcMain.handle('netease-song-url', async (_e, id: number) => {
    return getNeteaseSongUrl(id);
  });

  ipcMain.handle('netease-lyric', async (_e, id: number) => {
    return getNeteaseLyric(id);
  });

  // Bilibili handlers
  ipcMain.handle('bilibili-search', async (_e, query: string, page?: number) => {
    return searchBilibiliMusic(query, page || 1);
  });

  ipcMain.handle('bilibili-audio-url', async (_e, bvid: string, cid?: number) => {
    return getBilibiliAudioUrl(bvid, cid);
  });

  // Generic URL fetch from main process (bypasses CORS)
  ipcMain.handle('fetch-buffer', async (_e, url: string, referer?: string) => {
    const doFetch = (targetUrl: string, maxRedirects = 5): Promise<Buffer> => {
      return new Promise((resolve, reject) => {
        if (maxRedirects <= 0) { reject(new Error('Too many redirects')); return; }
        const proto = targetUrl.startsWith('https') ? https : http;
        const parsed = new URL(targetUrl);
        proto.get(targetUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Referer': referer || `${parsed.protocol}//${parsed.host}`,
            'Accept': '*/*',
          }
        }, (res: any) => {
          if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
            const redirectUrl = res.headers.location.startsWith('http')
              ? res.headers.location
              : `${parsed.protocol}//${parsed.host}${res.headers.location}`;
            resolve(doFetch(redirectUrl, maxRedirects - 1));
            return;
          }
          if (res.statusCode && res.statusCode >= 400) {
            reject(new Error(`HTTP ${res.statusCode} for ${targetUrl}`));
            return;
          }
          const chunks: Buffer[] = [];
          res.on('data', (c: Buffer) => chunks.push(c));
          res.on('end', () => resolve(Buffer.concat(chunks)));
          res.on('error', reject);
        }).on('error', reject);
      });
    };
    const buf = await doFetch(url);
    return buf.buffer;
  });

  // MyFreeMp3 handlers
  ipcMain.handle('myfreemp3-search', async (_e, query: string, page?: number) => {
    return searchMyFreeMp3(query, page || 1);
  });

  ipcMain.handle('myfreemp3-song-url', async (_e, songId: string) => {
    return getMyFreeMp3SongUrl(songId);
  });

  // Player state sync for mini player and desktop lyric windows
  ipcMain.handle('get-player-state', () => {
    return playerStateCache;
  });

  ipcMain.on('sync-player-state', (_e, state: any) => {
    broadcastPlayerState(state);
  });

  // Forward player actions from child windows (mini player) to main window
  ipcMain.on('player-action', (_e, action: string) => {
    const win = getMainWindow();
    if (win && !win.isDestroyed()) {
      win.webContents.send('player-action', action);
    }
  });
}

function registerMediaKeys(): void {
  const win = getMainWindow();
  if (!win) return;

  globalShortcut.register('MediaPlayPause', () => {
    win.webContents.send('media-key', 'play');
  });
  globalShortcut.register('MediaNextTrack', () => {
    win.webContents.send('media-key', 'next');
  });
  globalShortcut.register('MediaPreviousTrack', () => {
    win.webContents.send('media-key', 'prev');
  });
}
