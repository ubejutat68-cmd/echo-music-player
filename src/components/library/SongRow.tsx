import { Box, Typography, IconButton } from '@mui/material';
import { PlayArrow, Favorite, FavoriteBorder } from '@mui/icons-material';
import type { Track } from '@/types';
import { usePlayerStore } from '@/stores/playerStore';
import { usePlaylistStore } from '@/stores/playlistStore';
import { CoverArt } from '@/components/common/CoverArt';
import { formatTime } from '@/utils/formatTime';

interface SongRowProps {
  track: Track;
  index: number;
  showCover?: boolean;
}

export function SongRow({ track, index, showCover = true }: SongRowProps) {
  const play = usePlayerStore((s) => s.play);
  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const isFav = usePlaylistStore((s) => s.isFavorite(track.id));
  const toggleFav = usePlaylistStore((s) => s.toggleFavorite);

  const isCurrent = currentTrack?.id === track.id;

  return (
    <Box
      onDoubleClick={() => play(track)}
      sx={{
        display: 'flex',
        alignItems: 'center',
        px: 2,
        py: 0.75,
        borderRadius: 1,
        cursor: 'pointer',
        bgcolor: isCurrent ? 'action.selected' : 'transparent',
        '&:hover': { bgcolor: 'action.hover' },
        '&:hover .song-actions': { opacity: 1 },
      }}
    >
      <Typography variant="body2" sx={{ width: 32, textAlign: 'center', color: 'text.secondary', flexShrink: 0 }}>
        {isCurrent ? <PlayArrow fontSize="small" color="primary" /> : index + 1}
      </Typography>

      {showCover && <CoverArt src={track.coverArt} size={36} borderRadius={1} />}

      <Box sx={{ ml: 1.5, flex: 1, overflow: 'hidden' }}>
        <Typography variant="body2" noWrap fontWeight={isCurrent ? 600 : 400} color={isCurrent ? 'primary.main' : 'text.primary'}>
          {track.title}
        </Typography>
        <Typography variant="caption" color="text.secondary" noWrap>{track.artist}</Typography>
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ width: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: { xs: 'none', md: 'block' } }}>
        {track.album}
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ width: 60, textAlign: 'right', mr: 1, fontVariantNumeric: 'tabular-nums' }}>
        {formatTime(track.duration)}
      </Typography>

      <Box className="song-actions" sx={{ opacity: 0, display: 'flex', transition: 'opacity 0.15s' }}>
        <IconButton size="small" onClick={(e) => { e.stopPropagation(); toggleFav(track.id); }}>
          {isFav ? <Favorite fontSize="small" color="error" /> : <FavoriteBorder fontSize="small" />}
        </IconButton>
      </Box>
    </Box>
  );
}
