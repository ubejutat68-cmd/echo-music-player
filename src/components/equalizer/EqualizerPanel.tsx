import { Box, Typography, ToggleButtonGroup, ToggleButton, Switch, Slider, FormControlLabel } from '@mui/material';
import { useEqualizerStore } from '@/stores/equalizerStore';
import { EQ_FREQUENCIES, type EQPreset } from '@/types';
import { equalizer } from '@/engine/equalizer';
import { useEffect } from 'react';

const presetLabels: { value: EQPreset; label: string }[] = [
  { value: 'none', label: '关闭' },
  { value: 'pop', label: '流行' },
  { value: 'rock', label: '摇滚' },
  { value: 'classical', label: '古典' },
  { value: 'jazz', label: '爵士' },
  { value: 'electronic', label: '电子' },
  { value: 'custom', label: '自定义' },
];

export function EqualizerPanel() {
  const enabled = useEqualizerStore((s) => s.enabled);
  const preset = useEqualizerStore((s) => s.preset);
  const bands = useEqualizerStore((s) => s.bands);
  const toggle = useEqualizerStore((s) => s.toggle);
  const setPreset = useEqualizerStore((s) => s.setPreset);
  const setBand = useEqualizerStore((s) => s.setBand);

  useEffect(() => {
    if (enabled) {
      equalizer.setBands(bands);
    } else {
      equalizer.setBands(new Array(10).fill(0));
    }
  }, [enabled, bands]);

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <Typography variant="h6">均衡器</Typography>
        <FormControlLabel
          control={<Switch checked={enabled} onChange={toggle} />}
          label={enabled ? '开' : '关'}
        />
      </Box>

      <ToggleButtonGroup
        size="small"
        value={preset}
        exclusive
        onChange={(_, v) => v && setPreset(v)}
        sx={{ mb: 3, flexWrap: 'wrap' }}
      >
        {presetLabels.map((p) => (
          <ToggleButton key={p.value} value={p.value}>{p.label}</ToggleButton>
        ))}
      </ToggleButtonGroup>

      <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end', height: 160, mt: 2 }}>
        {bands.map((value, idx) => (
          <Box key={idx} sx={{ flex: 1, textAlign: 'center' }}>
            <Slider
              orientation="vertical"
              min={-12}
              max={12}
              step={0.5}
              value={value}
              onChange={(_, v) => setBand(idx, v as number)}
              disabled={!enabled}
              sx={{ height: 120 }}
            />
            <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
              {EQ_FREQUENCIES[idx] >= 1000 ? `${EQ_FREQUENCIES[idx] / 1000}k` : EQ_FREQUENCIES[idx]}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {value > 0 ? `+${value}` : value}dB
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
