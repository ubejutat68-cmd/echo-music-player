import { app, BrowserWindow, ipcMain, globalShortcut } from 'electron';
import { createMainWindow, getMainWindow } from './windows/mainWindow';
import { createMiniPlayer, closeMiniPlayer } from './windows/miniPlayer';
import { createDesktopLyric, closeDesktopLyric } from './windows/desktopLyric';
import { scanFolders } from './ipc/fileScanner';
import { parseMetadata } from './ipc/metadataParser';
import { parseLyric } from './ipc/lyricParser';
import { getStoreValue, setStoreValue, deleteStoreValue } from './ipc/store';
import * as fs from 'fs';

function registerIpcHandlers(): void {
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

app.whenReady().then(() => {
  registerIpcHandlers();
  createMainWindow();
  registerMediaKeys();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});
