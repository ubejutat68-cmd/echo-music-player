import { IconButton, Slider, Box } from '@mui/material';
import { VolumeUp, VolumeOff, VolumeDown } from '@mui/icons-material';
import { usePlayerStore } from '@/stores/playerStore';

export function VolumeControl() {
  const volume = usePlayerStore((s) => s.volume);
  const isMuted = usePlayerStore((s) => s.isMuted);
  const setVolume = usePlayerStore((s) => s.setVolume);
  const toggleMute = usePlayerStore((s) => s.toggleMute);

  const volumeIcon = isMuted || volume === 0 ? <VolumeOff /> : volume < 0.5 ? <VolumeDown /> : <VolumeUp />;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, width: 160 }}>
      <IconButton size="small" onClick={toggleMute}>{volumeIcon}</IconButton>
      <Slider
        size="small"
        min={0}
        max={1}
        step={0.01}
        value={isMuted ? 0 : volume}
        onChange={(_e, v) => setVolume(v as number)}
        sx={{ flex: 1 }}
      />
    </Box>
  );
}
