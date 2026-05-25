import { Box, Typography } from '@mui/material';
import { useEffect } from 'react';
import { useLyricStore } from '@/stores/lyricStore';
import { usePlayerStore } from '@/stores/playerStore';

export function DesktopLyrics() {
  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const currentTime = usePlayerStore((s) => s.currentTime);
  const currentLyric = useLyricStore((s) => s.currentLyric);
  const currentLineIndex = useLyricStore((s) => s.currentLineIndex);
  const loadLyric = useLyricStore((s) => s.loadLyric);
  const syncToTime = useLyricStore((s) => s.syncToTime);
  const setShowDesktopLyric = useLyricStore((s) => s.setShowDesktopLyric);

  useEffect(() => {
    setShowDesktopLyric(true);
    return () => setShowDesktopLyric(false);
  }, []);

  useEffect(() => {
    if (currentTrack) loadLyric(currentTrack);
  }, [currentTrack?.id]);

  useEffect(() => {
    syncToTime(currentTime);
  }, [currentTime]);

  const currentText = currentLyric[currentLineIndex]?.text || '';
  const nextText = currentLineIndex + 1 < currentLyric.length ? currentLyric[currentLineIndex + 1]?.text : '';

  return (
    <Box
      sx={{
        height: '100vh',
        width: '100vw',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'transparent',
        WebkitAppRegion: 'drag',
        userSelect: 'none',
      }}
    >
      <Typography
        variant="h4"
        sx={{
          color: '#fff',
          textShadow: '0 0 10px rgba(0,0,0,0.8), 0 0 20px rgba(0,0,0,0.5)',
          fontWeight: 700,
          mb: 2,
        }}
      >
        {currentText}
      </Typography>
      {nextText && (
        <Typography
          variant="h6"
          sx={{
            color: 'rgba(255,255,255,0.6)',
            textShadow: '0 0 8px rgba(0,0,0,0.6)',
          }}
        >
          {nextText}
        </Typography>
      )}
    </Box>
  );
}
