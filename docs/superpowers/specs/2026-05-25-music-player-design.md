# Music Player — Design Specification

**Date:** 2026-05-25  
**Status:** Draft  
**Goal:** 构建一款对标 QQ 音乐的全平台本地音乐播放器

---

## 1. Overview

全平台（Windows / macOS / Linux / Web / iOS / Android）本地音乐播放器。MVP 覆盖 8 大核心模块：播放控制、本地音乐管理、歌单系统、歌词展示、均衡器、搜索过滤、迷你播放器、主题皮肤。

**技术栈：** Electron + React 18 + TypeScript + MUI (Material Design 3) + Zustand + Web Audio API  
**打包：** Vite + electron-builder  
**数据持久化：** electron-store（JSON 文件）

---

## 2. Architecture

### 2.1 Process Model

```
Electron Main Process
├── IPC Bridge (contextBridge + ipcMain/ipcRenderer)
├── File Scanner (递归扫描, 支持 MP3/FLAC/AAC/WAV/OGG/WMA)
├── Metadata Parser (ID3v1/v2, Vorbis Comment, FLAC tags)
├── Lyric Parser (.lrc 文件读取 + 时间轴解析)
├── Window Manager (主窗口 / 迷你播放器 / 桌面歌词 / 托盘)
└── electron-store (歌单 / 设置 / 收藏 / 播放历史)

Renderer Process (React)
├── React Router (5 个视图)
├── Zustand (6 个 store)
└── Audio Engine (Web Audio API: 解码 → 均衡器 → AnalyserNode → 输出)
```

### 2.2 Design Decisions

| 决策 | 选择 | 理由 |
|---|---|---|
| 音频在哪播放 | 渲染进程 (Web Audio API) | 低延迟, audio-worklet 支持自定义处理 |
| 文件 I/O | 主进程, 通过 IPC 传输 ArrayBuffer | Electron 安全模型要求 |
| 持久化 | electron-store | JSON 数据量小, 不需要 SQL |
| 大列表渲染 | @tanstack/react-virtual | 虚拟滚动处理万级歌曲 |
| IPC 协议 | invoke/handle (异步) + on/send (事件推送) | 扫描进度等事件用推送, 查询用请求-响应 |

### 2.3 Data Flow

```
User clicks "Play"
  → playerStore.play(track)
    → audioEngine.loadAndPlay(track.path)
      → IPC: invoke('read-file', path)
        → main: fs.readFile → ArrayBuffer
      ← ArrayBuffer
    → audioContext.decodeAudioData(buffer)
    → sourceNode.start()
    → playerStore: { isPlaying: true, currentTrack: track }

CurrentTime updates via requestAnimationFrame loop
  → playerStore.currentTime = audioContext.currentTime
  → lyricStore.syncToTime(currentTime) → currentLineIndex updates
  → ProgressBar re-renders
```

---

## 3. Routes & Views

| Path | View | Description |
|---|---|---|
| `/` | HomePage | 最近播放、快速入口、本地库概览 |
| `/library` | LibraryPage | 全部歌曲, 按歌手/专辑/文件夹浏览 |
| `/playlist/:id` | PlaylistPage | 歌单详情, 歌曲可拖拽排序 |
| `/search` | SearchPage | 搜索 + 历史 + 分组结果 |
| `/nowplaying` | NowPlayingPage | 全屏模式: 大封面 + 歌词 + EQ 可视化 |

Desktop: 左侧可折叠 Sidebar + 底部播放条  
Mobile: 底部 Tab 导航 + 底部播放条

**Navigation tabs:** Home / Library / Search / Playlists / Now Playing

---

## 4. Component Tree

```
App
├── Layout
│   ├── Sidebar
│   ├── MainContent (Routes)
│   └── BottomPlayerBar (global, persistent)
├── HomePage
│   ├── RecentlyPlayed
│   ├── QuickActions (scan, new playlist)
│   └── LocalLibrarySummary
├── LibraryPage
│   ├── Toolbar (sort, filter, view toggle)
│   ├── SongList (virtualized)
│   └── FolderBrowser
├── PlaylistPage
│   ├── PlaylistHeader (cover, name, track count)
│   ├── SongList (draggable)
│   └── PlaylistSidebar (all playlists)
├── SearchPage
│   ├── SearchInput
│   ├── SearchHistory
│   └── SearchResults (grouped by song/artist/album)
├── NowPlayingPage
│   ├── AlbumArtLarge
│   ├── LyricsOverlay
│   └── EqualizerVisualizer
├── MiniPlayer (separate Electron window)
└── DesktopLyrics (separate Electron window)
```

---

## 5. State Management (Zustand)

### 5.1 playerStore

```ts
{
  currentTrack: Track | null
  queue: Track[]
  queueIndex: number
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number          // 0–1
  playMode: 'sequential' | 'loop' | 'single' | 'shuffle'
  isMuted: boolean

  play(track: Track): void
  pause(): void
  resume(): void
  next(): void
  prev(): void
  seek(time: number): void
  setVolume(v: number): void
  toggleMute(): void
  togglePlayMode(): void
  addToQueue(tracks: Track[]): void
  removeFromQueue(index: number): void
  clearQueue(): void
  playAtIndex(index: number): void
}
```

### 5.2 libraryStore

```ts
{
  tracks: Track[]
  scanProgress: number
  scanStatus: 'idle' | 'scanning' | 'done' | 'error'
  lastScanPath: string
  sortBy: 'title' | 'artist' | 'album' | 'duration' | 'dateAdded'
  sortOrder: 'asc' | 'desc'
  filterText: string

  scanFolders(paths: string[]): Promise<void>
  importFiles(paths: string[]): Promise<void>
  removeTracks(ids: string[]): void
  getByArtist(artist: string): Track[]
  getByAlbum(album: string): Track[]
}
```

### 5.3 playlistStore

```ts
{
  playlists: Playlist[]
  favorites: Playlist    // built-in "Favorites"

  create(name: string): string
  delete(id: string): void
  rename(id: string, name: string): void
  addTracks(playlistId: string, trackIds: string[]): void
  removeTracks(playlistId: string, trackIds: string[]): void
  reorder(playlistId: string, fromIndex: number, toIndex: number): void
  toggleFavorite(trackId: string): void
  isFavorite(trackId: string): boolean
}
```

### 5.4 lyricStore

```ts
{
  currentLyric: LyricLine[]
  currentLineIndex: number
  showDesktopLyric: boolean
  lyricSource: 'embedded' | 'lrc' | 'none'

  loadLyric(track: Track): Promise<void>  // embedded → .lrc file → none
  syncToTime(currentTime: number): void
  toggleDesktopLyric(): void
}
```

### 5.5 equalizerStore

```ts
{
  enabled: boolean
  preset: EQPreset   // 'none' | 'pop' | 'rock' | 'classical' | 'jazz' | 'electronic' | 'custom'
  bands: number[]     // 10 bands: [32, 64, 125, 250, 500, 1k, 2k, 4k, 8k, 16k] Hz
                      // each band: -12 .. +12 dB

  setPreset(preset: EQPreset): void
  setBand(index: number, value: number): void
  reset(): void
}
```

### 5.6 themeStore

```ts
{
  mode: 'light' | 'dark' | 'system'
  primaryColor: string      // hex
  surfaceBlur: boolean      // frosted glass effect
  miniPlayerOnTop: boolean  // mini player always on top

  setMode(mode: string): void
  setPrimaryColor(color: string): void
  setSurfaceBlur(enabled: boolean): void
}
```

---

## 6. Audio Engine

### 6.1 Pipeline

```
Source File (.mp3/.flac/.aac/.wav/.ogg/.wma)
  → IPC read-file → ArrayBuffer
    → AudioContext.decodeAudioData → AudioBuffer
      → AudioBufferSourceNode
        → BiquadFilterNode × 10 (EQ)
          → AnalyserNode (visualizer + progress)
            → GainNode (volume)
              → AudioContext.destination
```

### 6.2 Key Interfaces

```ts
interface IAudioEngine {
  loadAndPlay(path: string): Promise<void>
  pause(): void
  resume(): void
  stop(): void
  seek(time: number): void
  setVolume(v: number): void
  getCurrentTime(): number
  getDuration(): number
  getAnalyserData(): Uint8Array       // for visualizer
  connectEqualizer(bands: number[]): void
  disconnectEqualizer(): void
}
```

### 6.3 Supported Formats

| Format | Decoder | Notes |
|---|---|---|
| MP3 | Browser built-in | |
| AAC | Browser built-in | M4A container |
| WAV | Browser built-in | |
| OGG | Browser built-in | Vorbis codec |
| FLAC | Custom WASM decoder | Browser doesn't support FLAC natively |
| WMA | Not supported in v1 | Rare format, deferred |

FLAC 采用 Electron 主进程调用 ffmpeg/ffprobe 转码为 PCM 后传回渲染进程播放，或使用社区 WASM 解码器（如 `@wasm-audio-decoders/flac`）。

### 6.4 Equalizer

10-band peaking filter chain:

| Band | Freq (Hz) | Q factor |
|---|---|---|
| 1 | 32 | 1.0 |
| 2 | 64 | 1.0 |
| 3 | 125 | 1.0 |
| 4 | 250 | 1.0 |
| 5 | 500 | 1.0 |
| 6 | 1000 | 1.0 |
| 7 | 2000 | 1.0 |
| 8 | 4000 | 1.0 |
| 9 | 8000 | 1.0 |
| 10 | 16000 | 1.0 |

### 6.5 Presets

| Preset | Description |
|---|---|
| None | Flat (all 0 dB) |
| Pop | +3 at 125, 250; +2 at 1k, 2k |
| Rock | +4 at 64, 125; +3 at 2k, 4k |
| Classical | +2 at 32, 64; flat mids; +1 at 8k, 16k |
| Jazz | +2 at 64, 125; +1 at 500, 1k |
| Electronic | +4 at 32, 64; +3 at 4k, 8k; -2 at 250 |
| Custom | User defined |

---

## 7. Data Types

```ts
interface Track {
  id: string               // uuid
  path: string             // absolute file path
  title: string
  artist: string
  album: string
  duration: number         // seconds
  coverArt: string | null  // base64 / data URL
  format: string           // 'mp3' | 'flac' | 'aac' | etc.
  fileSize: number
  dateAdded: number        // timestamp
  hasLyrics: boolean
}

interface Playlist {
  id: string
  name: string
  trackIds: string[]
  coverArt: string | null  // first track cover or custom
  createdAt: number
  updatedAt: number
}

interface LyricLine {
  time: number             // seconds
  text: string
}

interface SearchResult {
  tracks: Track[]
  artists: { name: string; trackCount: number }[]
  albums: { name: string; artist: string; trackCount: number; coverArt: string | null }[]
}
```

---

## 8. IPC API (preload.ts → contextBridge)

```ts
// File operations
api.scanFolders(paths: string[]): Promise<Track[]>
api.readFile(path: string): Promise<ArrayBuffer>
api.parseMetadata(path: string): Promise<Partial<Track>>
api.parseLyric(track: Track): Promise<LyricLine[]>

// Store (persistence)
api.store.get(key: string): Promise<any>
api.store.set(key: string, value: any): Promise<void>
api.store.delete(key: string): Promise<void>

// Window management
api.openMiniPlayer(): void
api.closeMiniPlayer(): void
api.openDesktopLyrics(): void
api.closeDesktopLyrics(): void

// System
api.getMediaKeys(): void  // registers global media key shortcuts
api.onMediaKey(callback: (action: 'play'|'pause'|'next'|'prev') => void): void
```

---

## 9. Project File Structure

```
music-player/
├── electron/
│   ├── main.ts
│   ├── preload.ts
│   ├── ipc/
│   │   ├── fileScanner.ts
│   │   ├── metadataParser.ts
│   │   ├── lyricParser.ts
│   │   └── store.ts
│   └── windows/
│       ├── mainWindow.ts
│       ├── miniPlayer.ts
│       └── desktopLyric.ts
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── components/
│   │   ├── layout/        # Sidebar, BottomPlayerBar, MainContent
│   │   ├── player/        # PlayerControls, ProgressBar, VolumeControl
│   │   ├── library/       # SongList(virtualized), SongRow, FolderBrowser
│   │   ├── playlist/      # PlaylistSidebar, PlaylistHeader, PlaylistDetail
│   │   ├── search/        # SearchInput, SearchHistory, SearchResults
│   │   ├── lyrics/        # LyricsDisplay, DesktopLyrics
│   │   ├── equalizer/     # EqualizerPanel, BandSlider, PresetSelector
│   │   └── common/        # CoverArt, EmptyState, ContextMenu
│   ├── stores/            # 6 Zustand stores
│   ├── engine/
│   │   ├── audioEngine.ts
│   │   ├── equalizer.ts
│   │   └── visualizer.ts
│   ├── hooks/
│   ├── types/
│   │   └── index.ts
│   └── utils/
├── resources/             # App icons
├── package.json
├── vite.config.ts
├── electron-builder.yml
└── tsconfig.json
```

---

## 10. Edge Cases & Error Handling

| Scenario | Handling |
|---|---|
| 文件被移动/删除 | 播放前检查文件存在性, 不存在则标记灰色并跳过, 提示用户 |
| 不支持的文件格式 | 显示格式名灰色, 尝试播放时 toast 提示 "暂不支持此格式" |
| 空文件夹扫描 | 统计结果显示 0 首歌曲, EmptyState 引导用户选择正确目录 |
| 元数据缺失 | file name 作为 title, "Unknown Artist" / "Unknown Album" 占位 |
| 封面缺失 | 显示默认音乐图标 + 从 primaryColor 生成渐变背景 |
| 歌词文件缺失 | 显示 "暂无歌词", desktop 歌词窗口不打开 |
| 重复导入 | 基于 file path 去重, 若元数据有更新则刷新 |
| 播放队列为空 | 播放按钮 disabled 或点击无响应 |
| AudioContext 被浏览器暂停 | 监听 `onstatechange`, 自动 resume (Electron 中不常见) |
| 大量歌曲 (>10k) | SongList 用虚拟滚动, 搜索/过滤用 Web Worker 避免卡主线程 |
| 迷你播放器关闭时 | 自动回主窗口, 无状态丢失 |
| 桌面歌词关闭时 | lyricStore.showDesktopLyric 置 false, 主窗口歌词面板仍可选 |

---

## 11. What's NOT in v1

- 在线流媒体 / 音乐搜索 / 推荐系统
- 用户账号系统 / 云同步
- K歌 / 直播 / 社区功能
- 播客 / 有声书支持
- 自动从网络抓取封面和歌词
- 插件系统
- 快捷键自定义（仅内置媒体键支持）
- 国际化（仅中文）
- WMA 格式（edge case, 极少见）

---

## 12. Success Criteria

1. 能扫描并播放所有主流本地音频格式（MP3/FLAC/AAC/WAV/OGG）
2. 歌单可创建、编辑、拖拽排序、持久化
3. 歌词 .lrc 文件自动匹配加载、同步滚动
4. 10 段均衡器，6 个预设 + 自定义
5. 桌面歌词和迷你播放器独立窗口
6. 暗黑/亮色模式切换
7. 虚拟滚动处理 10,000+ 首歌曲不卡顿
8. 媒体键（键盘快捷键）响应播放/暂停/上下首
