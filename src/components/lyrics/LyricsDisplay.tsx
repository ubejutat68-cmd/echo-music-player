import { Box, Typography } from '@mui/material';
import { useEffect, useRef } from 'react';
import { useLyricStore } from '@/stores/lyricStore';
import { usePlayerStore } from '@/stores/playerStore';

export function LyricsDisplay() {
  const currentLyric = useLyricStore((s) => s.currentLyric);
  const currentLineIndex = useLyricStore((s) => s.currentLineIndex);
  const loadLyric = useLyricStore((s) => s.loadLyric);
  const syncToTime = useLyricStore((s) => s.syncToTime);
  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const currentTime = usePlayerStore((s) => s.currentTime);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentTrack) {
      loadLyric(currentTrack);
    }
  }, [currentTrack?.id]);

  useEffect(() => {
    syncToTime(currentTime);
  }, [currentTime]);

  useEffect(() => {
    if (containerRef.current && currentLineIndex >= 0) {
      const lineEl = containerRef.current.children[currentLineIndex] as HTMLElement;
      if (lineEl) {
        lineEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [currentLineIndex]);

  if (!currentLyric.length) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <Typography color="text.secondary">暂无歌词</Typography>
      </Box>
    );
  }

  return (
    <Box
      ref={containerRef}
      sx={{
        height: '100%',
        overflow: 'auto',
        py: 4,
        px: 2,
        textAlign: 'center',
        '&::-webkit-scrollbar': { display: 'none' },
      }}
    >
      {currentLyric.map((line, idx) => (
        <Typography
          key={idx}
          variant="body1"
          sx={{
            py: 1.5,
            px: 2,
            transition: 'all 0.3s',
            fontSize: idx === currentLineIndex ? '1.5rem' : '1rem',
            fontWeight: idx === currentLineIndex ? 700 : 400,
            color: idx === currentLineIndex ? 'primary.main' : 'text.secondary',
            opacity: idx === currentLineIndex ? 1 : 0.5,
          }}
        >
          {line.text}
        </Typography>
      ))}
    </Box>
  );
}
