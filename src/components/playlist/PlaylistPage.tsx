import { Box, Typography, Button } from '@mui/material';
import { PlayArrow, Delete } from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { usePlaylistStore } from '@/stores/playlistStore';
import { useLibraryStore } from '@/stores/libraryStore';
import { usePlayerStore } from '@/stores/playerStore';
import { PlaylistSidebar } from './PlaylistSidebar';
import { SongList } from '@/components/library/SongList';
import { EmptyState } from '@/components/common/EmptyState';
import { QueueMusic } from '@mui/icons-material';

export function PlaylistPage() {
  const { id } = useParams<{ id: string }>();
  const getPlaylist = usePlaylistStore((s) => s.getPlaylist);
  const tracks = useLibraryStore((s) => s.tracks);
  const play = usePlayerStore((s) => s.play);
  const navigate = useNavigate();

  const playlist = getPlaylist(id || '__favorites__');
  if (!playlist) {
    navigate('/playlist/__favorites__');
    return null;
  }

  const playlistTracks = playlist.trackIds
    .map((tid) => tracks.find((t) => t.id === tid))
    .filter(Boolean) as typeof tracks;

  const isFavorites = id === '__favorites__';

  return (
    <Box sx={{ display: 'flex', height: '100%' }}>
      <PlaylistSidebar />
      <Box sx={{ flex: 1, p: 3, overflow: 'auto' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Typography variant="h5" fontWeight={700}>{playlist.name}</Typography>
          <Typography variant="body2" color="text.secondary">{playlistTracks.length} 首歌曲</Typography>
          {playlistTracks.length > 0 && (
            <>
              <Button variant="contained" startIcon={<PlayArrow />} onClick={() => play(playlistTracks[0])}>
                播放
              </Button>
              {!isFavorites && (
                <Button color="error" startIcon={<Delete />} onClick={() => {
                  usePlaylistStore.getState().delete(playlist.id);
                  navigate('/playlist/__favorites__');
                }}>
                  删除歌单
                </Button>
              )}
            </>
          )}
        </Box>

        {playlistTracks.length === 0 ? (
          <EmptyState
            icon={<QueueMusic sx={{ fontSize: 64 }} />}
            title="歌单是空的"
            description="从音乐库中双击歌曲加入此歌单"
          />
        ) : (
          <SongList tracks={playlistTracks} />
        )}
      </Box>
    </Box>
  );
}
