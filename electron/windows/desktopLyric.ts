import { BrowserWindow } from 'electron';
import path from 'path';

let lyricWindow: BrowserWindow | null = null;

export function createDesktopLyric(): BrowserWindow {
  if (lyricWindow && !lyricWindow.isDestroyed()) {
    lyricWindow.focus();
    return lyricWindow;
  }

  lyricWindow = new BrowserWindow({
    width: 800,
    height: 120,
    resizable: false,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    webPreferences: {
      preload: path.join(__dirname, '../preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  const url = process.env.VITE_DEV_SERVER_URL
    ? `${process.env.VITE_DEV_SERVER_URL}#/desktop-lyric`
    : `file://${path.join(__dirname, '../../dist/index.html')}#/desktop-lyric`;

  lyricWindow.loadURL(url);

  lyricWindow.on('closed', () => {
    lyricWindow = null;
  });

  return lyricWindow;
}

export function closeDesktopLyric(): void {
  if (lyricWindow && !lyricWindow.isDestroyed()) {
    lyricWindow.close();
    lyricWindow = null;
  }
}

export function getLyricWindow(): BrowserWindow | null {
  return lyricWindow;
}
