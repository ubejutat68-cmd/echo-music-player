import { IconButton, Stack } from '@mui/material';
import { PlayArrow, Pause, SkipPrevious, SkipNext, Shuffle, Repeat, RepeatOne } from '@mui/icons-material';
import { usePlayerStore } from '@/stores/playerStore';

export function PlayerControls() {
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const playMode = usePlayerStore((s) => s.playMode);
  const resume = usePlayerStore((s) => s.resume);
  const pause = usePlayerStore((s) => s.pause);
  const next = usePlayerStore((s) => s.next);
  const prev = usePlayerStore((s) => s.prev);
  const togglePlayMode = usePlayerStore((s) => s.togglePlayMode);

  const modeIcon = playMode === 'single' ? <RepeatOne /> : playMode === 'shuffle' ? <Shuffle /> : <Repeat />;
  const modeActive = playMode !== 'sequential';

  return (
    <Stack direction="row" alignItems="center" spacing={0.5}>
      <IconButton size="small" onClick={togglePlayMode} color={modeActive ? 'primary' : 'default'}>
        {modeIcon}
      </IconButton>
      <IconButton onClick={prev}><SkipPrevious /></IconButton>
      <IconButton onClick={isPlaying ? pause : resume} sx={{ bgcolor: 'primary.main', color: 'white', '&:hover': { bgcolor: 'primary.dark' } }}>
        {isPlaying ? <Pause /> : <PlayArrow />}
      </IconButton>
      <IconButton onClick={next}><SkipNext /></IconButton>
    </Stack>
  );
}
