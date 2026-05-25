import { Box, List, ListItemButton, ListItemText, IconButton, TextField, Button } from '@mui/material';
import { Add, Delete } from '@mui/icons-material';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { usePlaylistStore } from '@/stores/playlistStore';

export function PlaylistSidebar() {
  const playlists = usePlaylistStore((s) => s.playlists);
  const favorites = usePlaylistStore((s) => s.favorites);
  const create = usePlaylistStore((s) => s.create);
  const del = usePlaylistStore((s) => s.delete);
  const navigate = useNavigate();
  const { id } = useParams();
  const [newName, setNewName] = useState('');

  const allPlaylists = [favorites, ...playlists];

  return (
    <Box sx={{ width: 240, borderRight: 1, borderColor: 'divider', p: 1.5, overflow: 'auto' }}>
      <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
        <TextField
          size="small"
          placeholder="新歌单名"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && newName.trim()) {
              const newId = create(newName.trim());
              setNewName('');
              navigate(`/playlist/${newId}`);
            }
          }}
          sx={{ flex: 1 }}
        />
        <Button
          variant="contained"
          size="small"
          onClick={() => {
            if (newName.trim()) {
              const newId = create(newName.trim());
              setNewName('');
              navigate(`/playlist/${newId}`);
            }
          }}
          disabled={!newName.trim()}
        >
          <Add />
        </Button>
      </Box>

      <List dense>
        {allPlaylists.map((pl) => (
          <ListItemButton
            key={pl.id}
            selected={id === pl.id}
            onClick={() => navigate(`/playlist/${pl.id}`)}
            sx={{ borderRadius: 1, mb: 0.25 }}
          >
            <ListItemText
              primary={pl.name}
              secondary={`${pl.trackIds.length} 首`}
              primaryTypographyProps={{ variant: 'body2', noWrap: true }}
            />
            {pl.id !== '__favorites__' && (
              <IconButton size="small" onClick={(e) => { e.stopPropagation(); del(pl.id); if (id === pl.id) navigate('/playlist/__favorites__'); }}>
                <Delete fontSize="small" />
              </IconButton>
            )}
          </ListItemButton>
        ))}
      </List>
    </Box>
  );
}
