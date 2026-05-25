import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './components/layout/ThemeProvider';
import { Layout } from './components/layout/Layout';
import { HomePage } from './components/library/HomePage';
import { LibraryPage } from './components/library/LibraryPage';
import { PlaylistPage } from './components/playlist/PlaylistPage';
import { SearchPage } from './components/search/SearchPage';
import { NowPlayingPage } from './components/player/NowPlayingPage';
import { MiniPlayer } from './components/player/MiniPlayer';
import { DesktopLyrics } from './components/lyrics/DesktopLyrics';

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/library" element={<LibraryPage />} />
            <Route path="/playlist/:id" element={<PlaylistPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/nowplaying" element={<NowPlayingPage />} />
          </Route>
          <Route path="/mini-player" element={<MiniPlayer />} />
          <Route path="/desktop-lyric" element={<DesktopLyrics />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
