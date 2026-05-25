import { Box, Typography, Tabs, Tab, IconButton } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlayerStore } from '@/stores/playerStore';
import { useAudioEngine } from '@/hooks/useAudioEngine';
import { CoverArt } from '@/components/common/CoverArt';
import { PlayerControls } from './PlayerControls';
import { ProgressBar } from './ProgressBar';
import { VolumeControl } from './VolumeControl';
import { LyricsDisplay } from '@/components/lyrics/LyricsDisplay';
import { EqualizerPanel } from '@/components/equalizer/EqualizerPanel';
import { visualizer } from '@/engine/visualizer';

export function NowPlayingPage() {
  const navigate = useNavigate();
  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const [tab, setTab] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useAudioEngine();

  useEffect(() => {
    if (canvasRef.current && tab === 2) {
      visualizer.mount(canvasRef.current);
      return () => visualizer.unmount();
    }
  }, [tab]);

  if (!currentTrack) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="text.secondary">没有正在播放的歌曲</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
        <IconButton onClick={() => navigate(-1)}><ArrowBack /></IconButton>
        <Typography variant="h6" sx={{ ml: 1 }}>正在播放</Typography>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
        <CoverArt src={currentTrack.coverArt} size={280} borderRadius={4} />
      </Box>

      <Box sx={{ textAlign: 'center', px: 4, mb: 2 }}>
        <Typography variant="h6" noWrap>{currentTrack.title}</Typography>
        <Typography variant="body2" color="text.secondary">{currentTrack.artist} · {currentTrack.album}</Typography>
      </Box>

      <Box sx={{ px: 4, mb: 1 }}>
        <ProgressBar />
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
        <PlayerControls />
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
        <VolumeControl />
      </Box>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} centered sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tab label="歌词" />
        <Tab label="均衡器" />
        <Tab label="可视化" />
      </Tabs>

      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {tab === 0 && <LyricsDisplay />}
        {tab === 1 && <EqualizerPanel />}
        {tab === 2 && (
          <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
        )}
      </Box>
    </Box>
  );
}
