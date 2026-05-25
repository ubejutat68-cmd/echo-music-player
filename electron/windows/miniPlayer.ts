import { BrowserWindow } from 'electron';
import path from 'path';

let miniPlayerWindow: BrowserWindow | null = null;

export function createMiniPlayer(): BrowserWindow {
  if (miniPlayerWindow && !miniPlayerWindow.isDestroyed()) {
    miniPlayerWindow.focus();
    return miniPlayerWindow;
  }

  miniPlayerWindow = new BrowserWindow({
    width: 360,
    height: 120,
    resizable: false,
    frame: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    webPreferences: {
      preload: path.join(__dirname, '../preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  const url = process.env.VITE_DEV_SERVER_URL
    ? `${process.env.VITE_DEV_SERVER_URL}#/mini-player`
    : `file://${path.join(__dirname, '../../dist/index.html')}#/mini-player`;

  miniPlayerWindow.loadURL(url);

  miniPlayerWindow.on('closed', () => {
    miniPlayerWindow = null;
  });

  return miniPlayerWindow;
}

export function closeMiniPlayer(): void {
  if (miniPlayerWindow && !miniPlayerWindow.isDestroyed()) {
    miniPlayerWindow.close();
    miniPlayerWindow = null;
  }
}

export function getMiniPlayerWindow(): BrowserWindow | null {
  return miniPlayerWindow;
}
