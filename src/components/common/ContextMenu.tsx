import { Menu, MenuItem, ListItemIcon, ListItemText, Divider } from '@mui/material';
import { PlayArrow, QueueMusic, Favorite, FavoriteBorder, Delete } from '@mui/icons-material';
import type { Track } from '@/types';
import { usePlayerStore } from '@/stores/playerStore';
import { usePlaylistStore } from '@/stores/playlistStore';
import { useLibraryStore } from '@/stores/libraryStore';

interface ContextMenuProps {
  track: Track;
  anchorEl: HTMLElement | null;
  onClose: () => void;
}

export function ContextMenu({ track, anchorEl, onClose }: ContextMenuProps) {
  const play = usePlayerStore((s) => s.play);
  const addToQueue = usePlayerStore((s) => s.addToQueue);
  const toggleFav = usePlaylistStore((s) => s.toggleFavorite);
  const isFav = usePlaylistStore((s) => s.isFavorite(track.id));
  const removeTracks = useLibraryStore((s) => s.removeTracks);

  return (
    <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={onClose}>
      <MenuItem onClick={() => { play(track); onClose(); }}>
        <ListItemIcon><PlayArrow fontSize="small" /></ListItemIcon>
        <ListItemText>播放</ListItemText>
      </MenuItem>
      <MenuItem onClick={() => { addToQueue([track]); onClose(); }}>
        <ListItemIcon><QueueMusic fontSize="small" /></ListItemIcon>
        <ListItemText>加入队列</ListItemText>
      </MenuItem>
      <MenuItem onClick={() => { toggleFav(track.id); onClose(); }}>
        <ListItemIcon>
          {isFav ? <Favorite fontSize="small" color="error" /> : <FavoriteBorder fontSize="small" />}
        </ListItemIcon>
        <ListItemText>{isFav ? '取消喜欢' : '喜欢'}</ListItemText>
      </MenuItem>
      <Divider />
      <MenuItem onClick={() => { removeTracks([track.id]); onClose(); }}>
        <ListItemIcon><Delete fontSize="small" color="error" /></ListItemIcon>
        <ListItemText>从库中删除</ListItemText>
      </MenuItem>
    </Menu>
  );
}
