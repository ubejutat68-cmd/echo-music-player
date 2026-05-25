import { Box, TextField, InputAdornment, Typography, Chip } from '@mui/material';
import { Search } from '@mui/icons-material';
import { useState, useMemo } from 'react';
import { useLibraryStore } from '@/stores/libraryStore';
import { SongList } from '@/components/library/SongList';
import type { SearchResult } from '@/types';

export function SearchPage() {
  const [query, setQuery] = useState('');
  const [history, setHistory] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('searchHistory') || '[]'); } catch { return []; }
  });
  const tracks = useLibraryStore((s) => s.tracks);

  const results = useMemo((): SearchResult | null => {
    if (!query.trim()) return null;
    const lower = query.toLowerCase();
    const matchedTracks = tracks.filter(
      (t) => t.title.toLowerCase().includes(lower) || t.artist.toLowerCase().includes(lower) || t.album.toLowerCase().includes(lower)
    );

    const artistMap = new Map<string, number>();
    const albumMap = new Map<string, { artist: string; count: number; cover: string | null }>();
    for (const t of matchedTracks) {
      artistMap.set(t.artist, (artistMap.get(t.artist) || 0) + 1);
      const prev = albumMap.get(t.album) || { artist: t.artist, count: 0, cover: t.coverArt };
      albumMap.set(t.album, { ...prev, count: prev.count + 1 });
    }

    return {
      tracks: matchedTracks,
      artists: [...artistMap.entries()].map(([name, count]) => ({ name, trackCount: count })),
      albums: [...albumMap.entries()].map(([name, info]) => ({ name, artist: info.artist, trackCount: info.count, coverArt: info.cover })),
    };
  }, [query, tracks]);

  const handleSearch = (q: string) => {
    setQuery(q);
    if (q.trim() && !history.includes(q.trim())) {
      const newHistory = [q.trim(), ...history].slice(0, 20);
      setHistory(newHistory);
      localStorage.setItem('searchHistory', JSON.stringify(newHistory));
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <TextField
        fullWidth
        size="medium"
        placeholder="搜索歌曲、歌手、专辑..."
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        InputProps={{
          startAdornment: <InputAdornment position="start"><Search /></InputAdornment>,
        }}
        sx={{ mb: 3, maxWidth: 600 }}
      />

      {!results && history.length > 0 && (
        <Box>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>搜索历史</Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
            {history.map((h) => (
              <Chip key={h} label={h} onClick={() => setQuery(h)} onDelete={() => {
                const next = history.filter((item) => item !== h);
                setHistory(next);
                localStorage.setItem('searchHistory', JSON.stringify(next));
              }} />
            ))}
          </Box>
        </Box>
      )}

      {results && (
        <>
          {results.tracks.length > 0 && (
            <>
              <Typography variant="h6" sx={{ mb: 1 }}>歌曲 ({results.tracks.length})</Typography>
              <Box sx={{ maxHeight: 360, overflow: 'auto', mb: 3 }}>
                <SongList tracks={results.tracks} />
              </Box>
            </>
          )}
          {results.artists.length > 0 && (
            <>
              <Typography variant="h6" sx={{ mb: 1 }}>歌手</Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>
                {results.artists.map((a) => (
                  <Chip key={a.name} label={`${a.name} (${a.trackCount})`} onClick={() => setQuery(a.name)} />
                ))}
              </Box>
            </>
          )}
          {results.albums.length > 0 && (
            <>
              <Typography variant="h6" sx={{ mb: 1 }}>专辑</Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>
                {results.albums.map((a) => (
                  <Chip key={a.name} label={`${a.name} - ${a.artist} (${a.trackCount})`} onClick={() => setQuery(a.name)} />
                ))}
              </Box>
            </>
          )}
          {results.tracks.length === 0 && (
            <Typography color="text.secondary" sx={{ mt: 4, textAlign: 'center' }}>
              没有找到 "{query}" 的相关结果
            </Typography>
          )}
        </>
      )}
    </Box>
  );
}
