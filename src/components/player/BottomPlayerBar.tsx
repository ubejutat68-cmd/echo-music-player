import { AppBar, Toolbar, Box, Typography, IconButton } from '@mui/material';
import { Lyrics, PictureInPicture } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { usePlayerStore } from '@/stores/playerStore';
import { useLyricStore } from '@/stores/lyricStore';
import { CoverArt } from '@/components/common/CoverArt';
import { PlayerControls } from './PlayerControls';
import { ProgressBar } from './ProgressBar';
import { VolumeControl } from './VolumeControl';

export function BottomPlayerBar() {
  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const toggleDesktopLyric = useLyricStore((s) => s.toggleDesktopLyric);
  const showDesktopLyric = useLyricStore((s) => s.showDesktopLyric);
  const navigate = useNavigate();

  if (!currentTrack) return null;

  return (
    <AppBar position="fixed" color="inherit" sx={{ top: 'auto', bottom: 0, borderTop: 1, borderColor: 'divider' }}>
      <Toolbar sx={{ gap: 2, minHeight: '64px !important' }}>
        {/* Track info */}
        <Box
          sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 200, maxWidth: 280, cursor: 'pointer' }}
          onClick={() => navigate('/nowplaying')}
        >
          <CoverArt src={currentTrack.coverArt} size={44} borderRadius={1.5} />
          <Box sx={{ overflow: 'hidden' }}>
            <Typography variant="body2" noWrap fontWeight={500}>{currentTrack.title}</Typography>
            <Typography variant="caption" color="text.secondary" noWrap>{currentTrack.artist}</Typography>
          </Box>
        </Box>

        {/* Controls + progress */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
          <PlayerControls />
          <ProgressBar />
        </Box>

        {/* Right side */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, minWidth: 200, justifyContent: 'flex-end' }}>
          <IconButton size="small" color={showDesktopLyric ? 'primary' : 'default'} onClick={toggleDesktopLyric}>
            <Lyrics />
          </IconButton>
          <IconButton size="small" onClick={() => window.api.openMiniPlayer()}>
            <PictureInPicture />
          </IconButton>
          <VolumeControl />
        </Box>
      </Toolbar>
    </AppBar>
  );
}
