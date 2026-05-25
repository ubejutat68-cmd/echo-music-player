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
  const [onlineResults, setOnlineResults] = useState<any[]>([]);
  const [searchingOnline, setSearchingOnline] = useState(false);
  const [onlineError, setOnlineError] = useState('');
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
    // Trigger online search
    if (q.trim()) {
      if (window.api?.neteaseSearch) {
        setSearchingOnline(true);
        setOnlineError('');
        window.api.neteaseSearch(q.trim()).then((songs) => {
          setOnlineResults(songs || []);
          setSearchingOnline(false);
        }).catch((e: any) => {
          setOnlineError(e?.message || '在线搜索失败');
          setSearchingOnline(false);
        });
      } else {
        setOnlineResults([]);
        setOnlineError('在线搜索需要 Electron 环境');
      }
    } else {
      setOnlineResults([]);
      setOnlineError('');
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

      {/* Online results section */}
      {query.trim() && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            网易云在线 {searchingOnline ? '(搜索中...)' : onlineResults.length > 0 ? `(${onlineResults.length})` : onlineError ? '(连接失败)' : '(无结果)'}
          </Typography>
          {onlineError && <Typography variant="body2" color="error.light" sx={{ mb: 1 }}>{onlineError}</Typography>}
          {onlineResults.length > 0 && (
            <Box>
              {onlineResults.map((song) => (
                <Box
                  key={song.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    px: 2,
                    py: 1,
                    borderRadius: 1,
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'action.hover' },
                  }}
                  onClick={async () => {
                    const url = await window.api.neteaseSongUrl(song.id);
                    if (url) {
                      // Play online via audio engine
                      const { audioEngine } = await import('@/engine/audioEngine');
                      const { usePlayerStore } = await import('@/stores/playerStore');
                      audioEngine.loadAndPlayUrl(url).then(() => {
                        usePlayerStore.getState().setIsPlaying(true);
                        usePlayerStore.getState().setDuration(audioEngine.getDuration());
                      });
                    }
                  }}
                >
                  <Box
                    component="img"
                    src={song.album?.picUrl}
                    sx={{ width: 40, height: 40, borderRadius: 1, mr: 1.5, objectFit: 'cover' }}
                  />
                  <Box sx={{ flex: 1, overflow: 'hidden' }}>
                    <Typography variant="body2" noWrap fontWeight={500}>{song.name}</Typography>
                    <Typography variant="caption" color="text.secondary" noWrap>
                      {song.artists?.map((a: any) => a.name).join(', ')} · {song.album?.name}
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {Math.floor(song.duration / 60)}:{(Math.floor(song.duration) % 60).toString().padStart(2, '0')}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}
