# Echo Music Player

A cross-platform desktop music player built with Electron + React + TypeScript + MUI.

## Features

- **Local Music Library** — Scan folders, auto-parse metadata (MP3/FLAC/AAC/WAV/OGG), sort & filter
- **Online Music Search** — 3 sources: Netease Cloud Music, Bilibili, MyFreeMp3
- **10-Band Equalizer** — 32Hz-16kHz, 5 presets (Pop/Rock/Classical/Jazz/Electronic)
- **Desktop Lyrics Overlay** — Transparent always-on-top window with green glow text
- **Mini Player** — Compact floating player with playback controls
- **Audio Visualizer** — Real-time frequency spectrum via Web Audio API
- **Playlists & Favorites** — Create, rename, reorder, persistent storage
- **System Tray** — Minimize to tray, quick actions
- **Dark/Light Theme** — Toggle with customizable primary color
- **Global Media Keys** — Play/Pause, Next, Previous

## Tech Stack

| Layer | Technology |
|---|---|
| Desktop Framework | Electron 30 |
| UI Framework | React 18 + TypeScript 5 |
| Build Tool | Vite 5 |
| UI Components | Material UI (MUI) 5 |
| State Management | Zustand 4 |
| Audio Engine | Web Audio API (custom) |
| Metadata Parser | music-metadata |
| Packaging | electron-builder (NSIS/DMG/AppImage) |

## Quick Start

```bash
# Install dependencies
npm install

# Start dev server (Vite dev server + Electron)
npm run dev

# Build for production
npm run build
```

## Project Structure

```
├── electron/            # Electron main process
│   ├── main.ts          # App entry, IPC handlers
│   ├── preload.ts       # contextBridge API
│   ├── ipc/             # IPC modules (file scanner, APIs)
│   └── windows/         # BrowserWindow factories
├── src/                 # React renderer
│   ├── main.tsx         # Entry point
│   ├── App.tsx          # Routes
│   ├── components/      # UI components
│   ├── stores/          # Zustand stores
│   ├── hooks/           # Custom hooks
│   ├── engine/          # Audio engine + EQ + visualizer
│   └── config/          # App configuration
└── resources/           # App icon
```

## License

MIT
