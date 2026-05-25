import { Box, Typography, Card, CardActionArea, CardContent, Button, Stack, Alert } from '@mui/material';
import { FolderOpen, Add, PlayArrow } from '@mui/icons-material';
import { useState } from 'react';
import { useLibraryStore } from '@/stores/libraryStore';
import { usePlayerStore } from '@/stores/playerStore';
import { CoverArt } from '@/components/common/CoverArt';
import { EmptyState } from '@/components/common/EmptyState';

const AUTO_SCAN_PATH = 'C:\\Users\\Lenovo\\Music';

export function HomePage() {
  const tracks = useLibraryStore((s) => s.tracks);
  const scanFolders = useLibraryStore((s) => s.scanFolders);
  const scanStatus = useLibraryStore((s) => s.scanStatus);
  const play = usePlayerStore((s) => s.play);
  const [scanError, setScanError] = useState('');

  const recentTracks = tracks.slice(0, 10);

  const doScan = async (paths: string[]) => {
    setScanError('');
    try {
      await scanFolders(paths);
    } catch (e: any) {
      setScanError(e?.message || '扫描失败');
    }
  };

  const handleScan = async () => {
    // Try native dialog first
    if ((window as any).api?.selectFolder) {
      try {
        const paths = await window.api.selectFolder();
        if (paths.length > 0) {
          await doScan(paths);
          return;
        }
      } catch {}
    }
    // Fallback: auto-scan default Music folder
    await doScan([AUTO_SCAN_PATH]);
  };

  if (tracks.length === 0) {
    return (
      <Box sx={{ p: 4 }}>
        {scanError && <Alert severity="error" sx={{ mb: 2 }}>{scanError}</Alert>}
        {scanStatus === 'scanning' && <Alert severity="info" sx={{ mb: 2 }}>正在扫描音乐文件...</Alert>}
        <EmptyState
          icon={<FolderOpen sx={{ fontSize: 64 }} />}
          title="还没有音乐"
          description={(window as any).api?.selectFolder ? '点击按钮选择文件夹' : `点击按钮自动扫描 ${AUTO_SCAN_PATH}`}
          action={
            <Button variant="contained" onClick={handleScan} startIcon={<Add />} disabled={scanStatus === 'scanning'}>
              {scanStatus === 'scanning' ? '扫描中...' : '扫描文件夹'}
            </Button>
          }
        />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {scanError && <Alert severity="error" sx={{ mb: 2 }}>{scanError}</Alert>}
      {scanStatus === 'scanning' && <Alert severity="info" sx={{ mb: 2 }}>正在扫描音乐文件...</Alert>}
      <Typography variant="h5" fontWeight={700} gutterBottom>首页</Typography>

      <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
        <Button variant="contained" onClick={() => play(tracks[0])} startIcon={<PlayArrow />}>
          播放全部
        </Button>
        <Button variant="outlined" onClick={handleScan} startIcon={<FolderOpen />}>
          扫描文件夹
        </Button>
      </Stack>

      <Typography variant="h6" gutterBottom>最近添加</Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 2 }}>
        {recentTracks.map((track) => (
          <Card key={track.id} sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
            <CardActionArea onClick={() => play(track)}>
              <CoverArt src={track.coverArt} size={180} />
              <CardContent sx={{ py: 1 }}>
                <Typography variant="body2" noWrap fontWeight={500}>{track.title}</Typography>
                <Typography variant="caption" color="text.secondary" noWrap>{track.artist}</Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        ))}
      </Box>
    </Box>
  );
}
