import { Box } from '@mui/material';
import { MusicNote } from '@mui/icons-material';

interface CoverArtProps {
  src: string | null;
  size?: number;
  borderRadius?: number;
  fallbackIcon?: React.ReactNode;
}

export function CoverArt({ src, size = 48, borderRadius = 2, fallbackIcon }: CoverArtProps) {
  if (src) {
    return (
      <Box
        component="img"
        src={src}
        width={size}
        height={size}
        sx={{ borderRadius, objectFit: 'cover', flexShrink: 0 }}
      />
    );
  }
  return (
    <Box
      width={size}
      height={size}
      sx={{
        borderRadius,
        bgcolor: 'action.hover',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      {fallbackIcon || <MusicNote sx={{ color: 'text.secondary', fontSize: size * 0.5 }} />}
    </Box>
  );
}
