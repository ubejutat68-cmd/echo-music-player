import { Box, Typography, IconButton } from '@mui/material';
import { PlayArrow, Pause, SkipNext, SkipPrevious, Close } from '@mui/icons-material';
import { usePlayerStore } from '@/stores/playerStore';
import { CoverArt } from '@/components/common/CoverArt';

export function MiniPlayer() {
  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const resume = usePlayerStore((s) => s.resume);
  const pause = usePlayerStore((s) => s.pause);
  const next = usePlayerStore((s) => s.next);
  const prev = usePlayerStore((s) => s.prev);

  if (!currentTrack) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="text.secondary">没有正在播放的歌曲</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        px: 2,
        gap: 2,
        bgcolor: 'background.paper',
        border: 1,
        borderColor: 'divider',
        borderRadius: 2,
        WebkitAppRegion: 'drag',
        userSelect: 'none',
      }}
    >
      <CoverArt src={currentTrack.coverArt} size={60} borderRadius={2} />

      <Box sx={{ flex: 1, overflow: 'hidden' }}>
        <Typography variant="body1" noWrap fontWeight={600}>{currentTrack.title}</Typography>
        <Typography variant="body2" color="text.secondary" noWrap>{currentTrack.artist}</Typography>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', WebkitAppRegion: 'no-drag' }}>
        <IconButton size="small" onClick={prev}><SkipPrevious /></IconButton>
        <IconButton onClick={isPlaying ? pause : resume} color="primary">
          {isPlaying ? <Pause /> : <PlayArrow />}
        </IconButton>
        <IconButton size="small" onClick={next}><SkipNext /></IconButton>
      </Box>

      <IconButton
        size="small"
        onClick={() => window.api.closeMiniPlayer()}
        sx={{ WebkitAppRegion: 'no-drag' }}
      >
        <Close fontSize="small" />
      </IconButton>
    </Box>
  );
}
