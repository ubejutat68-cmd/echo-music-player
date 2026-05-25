import { Box, Typography, Card, CardActionArea, CardContent, Button, Stack } from '@mui/material';
import { FolderOpen, Add, PlayArrow } from '@mui/icons-material';
import { useLibraryStore } from '@/stores/libraryStore';
import { usePlayerStore } from '@/stores/playerStore';
import { CoverArt } from '@/components/common/CoverArt';
import { EmptyState } from '@/components/common/EmptyState';

export function HomePage() {
  const tracks = useLibraryStore((s) => s.tracks);
  const scanFolders = useLibraryStore((s) => s.scanFolders);
  const play = usePlayerStore((s) => s.play);

  const recentTracks = tracks.slice(0, 10);

  const handleScan = async () => {
    try {
      const paths = await window.api.selectFolder();
      if (paths.length > 0) {
        await scanFolders(paths);
      }
    } catch {
      // Fallback: try scanning last path
      const lastPath = useLibraryStore.getState().lastScanPath;
      if (lastPath) await scanFolders([lastPath]);
    }
  };

  if (tracks.length === 0) {
    return (
      <Box sx={{ p: 4 }}>
        <EmptyState
          icon={<FolderOpen sx={{ fontSize: 64 }} />}
          title="还没有音乐"
          description="扫描本地文件夹来添加你的音乐"
          action={
            <Button variant="contained" onClick={handleScan} startIcon={<Add />}>
              扫描文件夹
            </Button>
          }
        />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
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
