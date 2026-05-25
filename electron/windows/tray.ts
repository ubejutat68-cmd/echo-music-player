import { Tray, Menu, nativeImage } from 'electron';
import { getMainWindow } from './mainWindow';

let tray: Tray | null = null;

export function createTray(): void {
  const icon = nativeImage.createEmpty();
  tray = new Tray(icon);

  const contextMenu = Menu.buildFromTemplate([
    {
      label: '显示主窗口',
      click: () => {
        const win = getMainWindow();
        if (win) {
          win.show();
          win.focus();
        }
      },
    },
    { type: 'separator' },
    {
      label: '退出',
      click: () => {
        require('electron').app.quit();
      },
    },
  ]);

  tray.setToolTip('Music Player');
  tray.setContextMenu(contextMenu);

  tray.on('double-click', () => {
    const win = getMainWindow();
    if (win) {
      win.show();
      win.focus();
    }
  });
}
