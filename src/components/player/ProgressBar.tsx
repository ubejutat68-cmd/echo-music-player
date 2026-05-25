import { Box, Slider, Typography } from '@mui/material';
import { usePlayerStore } from '@/stores/playerStore';
import { formatTime } from '@/utils/formatTime';

export function ProgressBar() {
  const currentTime = usePlayerStore((s) => s.currentTime);
  const duration = usePlayerStore((s) => s.duration);
  const seek = usePlayerStore((s) => s.seek);

  const handleChange = (_e: Event, value: number | number[]) => {
    seek(value as number);
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%', maxWidth: 500 }}>
      <Typography variant="caption" sx={{ minWidth: 36, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
        {formatTime(currentTime)}
      </Typography>
      <Slider
        size="small"
        min={0}
        max={duration || 1}
        value={currentTime}
        onChange={handleChange}
        sx={{ flex: 1 }}
      />
      <Typography variant="caption" sx={{ minWidth: 36, fontVariantNumeric: 'tabular-nums' }}>
        {formatTime(duration)}
      </Typography>
    </Box>
  );
}
