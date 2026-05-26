import { Box, TextField, InputAdornment, Typography, Chip, Tabs, Tab, IconButton, Menu, MenuItem, ListItemText, CircularProgress } from '@mui/material';
import { Search, FavoriteBorder, Favorite, PlaylistAdd } from '@mui/icons-material';
import { useState, useRef, useCallback, useEffect } from 'react';
import { useLibraryStore } from '@/stores/libraryStore';
import { usePlayerStore } from '@/stores/playerStore';
import { usePlaylistStore } from '@/stores/playlistStore';
import { audioEngine } from '@/engine/audioEngine';
import type { Track } from '@/types';

export function SearchPage() {
  const [query, setQuery] = useState('');
  const [history, setHistory] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('searchHistory') || '[]'); } catch { return []; }
  });
  // MyFreeMp3
  const [myfreemp3Results, setMyfreemp3Results] = useState<any[]>([]);
  const [searchingMyfreeMp3, setSearchingMyfreeMp3] = useState(false);
  // Bilibili
  const [bilibiliResults, setBilibiliResults] = useState<any[]>([]);
  const [searchingBilibili, setSearchingBilibili] = useState(false);
  // Netease
  const [neteaseResults, setNeteaseResults] = useState<any[]>([]);
  const [searchingNetease, setSearchingNetease] = useState(false);
  const [onlineError, setOnlineError] = useState('');
  const [onlineTab, setOnlineTab] = useState(0); // 0 = MyFreeMp3, 1 = Bilibili, 2 = Netease
  // Infinite scroll
  const [hasMore, setHasMore] = useState({ myfree: true, bili: true, netease: true });
  const [loadingMore, setLoadingMore] = useState(false);
  const pageRef = useRef({ myfree: 1, bili: 1, netease: 1 });
  const scrollBoxRef = useRef<HTMLDivElement>(null);
  const currentQueryRef = useRef('');

  const loadingRef = useRef(false);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const composingRef = useRef(false);
  const addTrackToLibrary = useLibraryStore((s) => s.addTrack);
  const toggleFavorite = usePlaylistStore((s) => s.toggleFavorite);
  const isFavorite = usePlaylistStore((s) => s.isFavorite);
  const playlists = usePlaylistStore((s) => s.playlists);
  const addTracks = usePlaylistStore((s) => s.addTracks);

  // Popover state for online track actions
  const [popoverData, setPopoverData] = useState<{ song: any; source: string } | null>(null);
  const [favAnchor, setFavAnchor] = useState<HTMLElement | null>(null);
  const [plAnchor, setPlAnchor] = useState<HTMLElement | null>(null);

  // Create a virtual Track from online song data so it can be added to playlists
  const ensureTrack = useCallback((song: any, source: string): Track => {
    const tid = source === 'myfree' ? `myfree-${song.id}` : source === 'bili' ? `bv-${song.bvid}` : `netease-${song.id}`;
    const title = source === 'myfree' ? song.title : source === 'bili' ? song.title : song.name;
    const artist = source === 'myfree' ? song.artist : source === 'bili' ? song.author : song.artists?.map((a: any) => a.name).join(', ') || '';
    const cover = source === 'myfree' ? (song.coverUrl || '') : source === 'bili' ? (song.coverUrl || '') : (song.album?.picUrl || '');
    const dur = song.duration || 0;

    const track: Track = {
      id: tid,
      path: `online://${tid}`,
      title,
      artist,
      album: '',
      duration: dur,
      coverArt: cover || null,
      format: 'online',
      fileSize: 0,
      dateAdded: Date.now(),
      hasLyrics: false,
    };
    addTrackToLibrary(track);
    return track;
  }, [addTrackToLibrary]);

  const handleFavoriteOnline = useCallback((song: any, source: string) => {
    const track = ensureTrack(song, source);
    toggleFavorite(track.id);
    setFavAnchor(null);
  }, [ensureTrack, toggleFavorite]);

  const handleAddToPlaylist = useCallback((song: any, source: string, playlistId: string) => {
    const track = ensureTrack(song, source);
    addTracks(playlistId, [track.id]);
    setPlAnchor(null);
  }, [ensureTrack, addTracks]);

  const searchSource = useCallback(async (source: 'myfree' | 'bili' | 'netease', q: string, pg: number) => {
    const api = (window as any).api;
    if (!api) return [];

    const searchFn = source === 'myfree' ? api.myfreemp3Search
      : source === 'bili' ? api.bilibiliSearch
      : api.neteaseSearch;

    if (!searchFn) return [];
    const results = await searchFn(q, pg);
    return results || [];
  }, []);

  const handleSearch = useCallback((q: string) => {
    setQuery(q);

    if (!q.trim()) {
      setMyfreemp3Results([]);
      setBilibiliResults([]);
      setNeteaseResults([]);
      setOnlineError('');
      return;
    }

    currentQueryRef.current = q.trim();

    // Save to history
    const currentHistory: string[] = JSON.parse(localStorage.getItem('searchHistory') || '[]');
    if (!currentHistory.includes(q.trim())) {
      const newHistory = [q.trim(), ...currentHistory].slice(0, 20);
      setHistory(newHistory);
      localStorage.setItem('searchHistory', JSON.stringify(newHistory));
    }

    // Reset pages
    pageRef.current = { myfree: 1, bili: 1, netease: 1 };
    setHasMore({ myfree: true, bili: true, netease: true });

    // Show searching state
    setSearchingMyfreeMp3(true);
    setSearchingBilibili(true);
    setSearchingNetease(true);

    const trimmed = q.trim();

    searchSource('myfree', trimmed, 1).then((songs) => {
      setMyfreemp3Results(songs);
      setSearchingMyfreeMp3(false);
      if (songs.length === 0) setHasMore(prev => ({ ...prev, myfree: false }));
    }).catch(() => setSearchingMyfreeMp3(false));

    searchSource('bili', trimmed, 1).then((songs) => {
      setBilibiliResults(songs);
      setSearchingBilibili(false);
      if (songs.length === 0) setHasMore(prev => ({ ...prev, bili: false }));
    }).catch(() => setSearchingBilibili(false));

    searchSource('netease', trimmed, 1).then((songs) => {
      setNeteaseResults(songs);
      setSearchingNetease(false);
      if (songs.length < 30) setHasMore(prev => ({ ...prev, netease: false }));
    }).catch((e: any) => {
      setOnlineError(e?.message || '在线搜索失败');
      setSearchingNetease(false);
    });
  }, [searchSource]);

  // Load next page
  const loadMore = useCallback(async () => {
    const q = currentQueryRef.current;
    if (!q || loadingMore) return;

    const source = onlineTab === 0 ? 'myfree' : onlineTab === 1 ? 'bili' : 'netease';
    const sourceKey = onlineTab === 0 ? 'myfree' : onlineTab === 1 ? 'bili' : 'netease' as 'myfree' | 'bili' | 'netease';
    if (!hasMore[sourceKey]) return;

    setLoadingMore(true);
    const nextPage = pageRef.current[sourceKey] + 1;
    const songs = await searchSource(sourceKey, q, nextPage);

    if (songs.length === 0) {
      setHasMore(prev => ({ ...prev, [sourceKey]: false }));
    } else {
      pageRef.current[sourceKey] = nextPage;
      if (sourceKey === 'myfree') setMyfreemp3Results(prev => [...prev, ...songs]);
      else if (sourceKey === 'bili') setBilibiliResults(prev => [...prev, ...songs]);
      else setNeteaseResults(prev => [...prev, ...songs]);
    }
    setLoadingMore(false);
  }, [onlineTab, loadingMore, hasMore, searchSource]);

  // Scroll detection
  useEffect(() => {
    const el = scrollBoxRef.current;
    if (!el) return;

    const handleScroll = () => {
      if (el.scrollHeight - el.scrollTop - el.clientHeight < 100) {
        loadMore();
      }
    };
    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, [loadMore]);

  const playOnlineTrack = useCallback(async (track: {
    id: string; title: string; artist: string; album?: string;
    duration: number; coverUrl: string; url: string; referer?: string;
  }) => {
    try {
      await audioEngine.loadAndPlayUrl(track.url, track.referer);
      const store = usePlayerStore.getState();
      store.setDuration(audioEngine.getDuration());
      store.setIsPlaying(true);
      usePlayerStore.setState({
        currentTrack: {
          id: track.id,
          path: track.url,
          title: track.title,
          artist: track.artist,
          album: track.album || '',
          duration: track.duration,
          coverArt: track.coverUrl || null,
          format: 'online',
          fileSize: 0,
          dateAdded: Date.now(),
          hasLyrics: false,
          playbackUrl: track.url,
          referer: track.referer,
        },
      });
      // Cache the URL so playlist playback works without re-fetching
      const lib = useLibraryStore.getState();
      const existing = lib.tracks.find((t) => t.id === track.id);
      if (existing) {
        lib.addTrack({ ...existing, playbackUrl: track.url, referer: track.referer });
      }
    } catch (e: any) {
      setOnlineError(e?.message || '播放失败');
      throw e;
    }
  }, []);

  const handleMyfreeMp3Click = useCallback(async (song: any) => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    try {
      const result = await window.api.myfreemp3SongUrl(song.id);
      if (result?.songUrl) {
        await playOnlineTrack({
          id: `myfree-${song.id}`,
          title: result.title || song.title,
          artist: result.artist || song.artist,
          duration: 0,
          coverUrl: result.coverUrl,
          url: result.songUrl,
          referer: 'https://myfreemp3online.com',
        });
      }
    } catch (e: any) {
      setOnlineError(e?.message || '获取歌曲失败');
    } finally {
      loadingRef.current = false;
    }
  }, [playOnlineTrack]);

  const handleBilibiliClick = useCallback(async (song: any) => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    try {
      const result = await window.api.bilibiliAudioUrl(song.bvid);
      if (result?.url) {
        await playOnlineTrack({
          id: `bili-${song.bvid}`,
          title: song.title,
          artist: song.author,
          duration: song.duration,
          coverUrl: song.coverUrl,
          url: result.url,
          referer: 'https://www.bilibili.com',
        });
      }
    } catch (e: any) {
      setOnlineError(e?.message || '获取B站音频失败');
    } finally {
      loadingRef.current = false;
    }
  }, [playOnlineTrack]);

  const handleNeteaseClick = useCallback(async (song: any) => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    try {
      let url = await window.api.neteaseSongUrl(song.id);
      if (!url) {
        await new Promise((r) => setTimeout(r, 300));
        url = await window.api.neteaseSongUrl(song.id);
      }
      if (url) {
        await playOnlineTrack({
          id: `netease-${song.id}`,
          title: song.name,
          artist: song.artists?.map((a: any) => a.name).join(', ') || '',
          album: song.album?.name || '',
          duration: song.duration,
          coverUrl: song.album?.picUrl || '',
          url,
          referer: 'https://music.163.com',
        });
      }
    } catch (e: any) {
      setOnlineError(e?.message || '获取播放链接失败');
    } finally {
      loadingRef.current = false;
    }
  }, [playOnlineTrack]);

  const onlineResults = onlineTab === 0 ? myfreemp3Results : onlineTab === 1 ? bilibiliResults : neteaseResults;
  const isSearchingOnline = onlineTab === 0 ? searchingMyfreeMp3 : onlineTab === 1 ? searchingBilibili : searchingNetease;
  const onlineSource = onlineTab === 0 ? 'myfree' : onlineTab === 1 ? 'bili' : 'netease';

  return (
    <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <Box sx={{ display: 'flex', gap: 1, mb: 3, maxWidth: 650 }}>
        <TextField
          fullWidth
          size="medium"
          placeholder="搜索歌曲、歌手、专辑..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onCompositionStart={() => { composingRef.current = true; }}
          onCompositionEnd={(e) => {
            composingRef.current = false;
            const val = (e.target as HTMLInputElement).value;
            setQuery(val);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !composingRef.current && query.trim()) {
              handleSearch(query.trim());
            }
          }}
          InputProps={{
            startAdornment: <InputAdornment position="start"><Search /></InputAdornment>,
          }}
        />
        <IconButton
          color="primary"
          disabled={!query.trim()}
          onClick={() => handleSearch(query.trim())}
          sx={{ bgcolor: 'primary.main', color: 'white', '&:hover': { bgcolor: 'primary.dark' }, '&.Mui-disabled': { bgcolor: 'action.disabledBackground', color: 'action.disabled' } }}
        >
          <Search />
        </IconButton>
      </Box>

      {!query.trim() && history.length > 0 && (
        <Box>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>搜索历史</Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
            {history.map((h) => (
              <Chip key={h} label={h} onClick={() => handleSearch(h)} onDelete={() => {
                const next = history.filter((item) => item !== h);
                setHistory(next);
                localStorage.setItem('searchHistory', JSON.stringify(next));
              }} />
            ))}
          </Box>
        </Box>
      )}

      {/* Online results */}
      {query.trim() && (window as any).api && (
        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
            <Typography variant="h6">在线搜索</Typography>
            <Tabs value={onlineTab} onChange={(_, v) => setOnlineTab(v)} sx={{ minHeight: 'auto', '& .MuiTab-root': { minHeight: 'auto', py: 0.5 } }}>
              <Tab label={`MP3${searchingMyfreeMp3 ? ' ...' : myfreemp3Results.length > 0 ? ` (${myfreemp3Results.length})` : ''}`} />
              <Tab label={`B站${searchingBilibili ? ' ...' : bilibiliResults.length > 0 ? ` (${bilibiliResults.length})` : ''}`} />
              <Tab label={`网易云${searchingNetease ? ' ...' : neteaseResults.length > 0 ? ` (${neteaseResults.length})` : ''}`} />
            </Tabs>
          </Box>
          {onlineError && <Typography variant="body2" color="error.light" sx={{ mb: 1 }}>{onlineError}</Typography>}
          {isSearchingOnline && !onlineResults.length && (
            <Typography variant="body2" color="text.secondary">搜索中...</Typography>
          )}
          <Box ref={scrollBoxRef} sx={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
            {onlineResults.map((song: any) => {
                const key = onlineSource === 'myfree' ? `myfree-${song.id}` : onlineSource === 'bili' ? song.bvid : `netease-${song.id}`;
                const cover = onlineSource === 'myfree' ? (song.coverUrl || '') : onlineSource === 'bili' ? (song.coverUrl || '') : (song.album?.picUrl || '');
                const title = onlineSource === 'myfree' ? song.title : onlineSource === 'bili' ? song.title : song.name;
                const subtitle = onlineSource === 'myfree' ? song.artist : onlineSource === 'bili' ? song.author : song.artists?.map((a: any) => a.name).join(', ');
                const durSeconds = song.duration || 0;
                const durText = `${Math.floor(durSeconds / 60)}:${(Math.floor(durSeconds) % 60).toString().padStart(2, '0')}`;
                const clickHandler = onlineSource === 'myfree' ? () => handleMyfreeMp3Click(song) : onlineSource === 'bili' ? () => handleBilibiliClick(song) : () => handleNeteaseClick(song);

                const trackId = onlineSource === 'myfree' ? `myfree-${song.id}` : onlineSource === 'bili' ? `bv-${song.bvid}` : `netease-${song.id}`;
                const isFav = isFavorite(trackId);

                return (
                <Box
                  key={key}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    px: 2,
                    py: 1,
                    borderRadius: 1,
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'action.hover' },
                  }}
                  onClick={clickHandler}
                >
                  <Box
                    component="img"
                    src={cover}
                    sx={{ width: 40, height: 40, borderRadius: 1, mr: 1.5, objectFit: 'cover' }}
                    onError={(e: any) => { e.target.style.display = 'none'; }}
                  />
                  <Box sx={{ flex: 1, overflow: 'hidden' }}>
                    <Typography variant="body2" noWrap fontWeight={500}>{title}</Typography>
                    <Typography variant="caption" color="text.secondary" noWrap>{subtitle}</Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ mr: 0.5 }}>{durText}</Typography>
                  {/* Heart — add to favorites */}
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFavoriteOnline(song, onlineSource);
                    }}
                    sx={{ opacity: 0.7, '&:hover': { opacity: 1 } }}
                  >
                    {isFav ? <Favorite fontSize="small" color="error" /> : <FavoriteBorder fontSize="small" />}
                  </IconButton>
                  {/* Add to playlist */}
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPopoverData({ song, source: onlineSource });
                      setPlAnchor(e.currentTarget as HTMLElement);
                    }}
                    sx={{ opacity: 0.7, '&:hover': { opacity: 1 } }}
                  >
                    <PlaylistAdd fontSize="small" />
                  </IconButton>
                </Box>
                );
              })}
            {loadingMore && (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                <CircularProgress size={24} />
              </Box>
            )}
            {!hasMore[onlineSource as 'myfree' | 'bili' | 'netease'] && onlineResults.length > 0 && (
              <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ py: 2 }}>
                — 已加载全部结果 —
              </Typography>
            )}
          </Box>
          {!isSearchingOnline && onlineResults.length === 0 && (
            <Typography variant="body2" color="text.secondary">无结果</Typography>
          )}
        </Box>
      )}

      {/* Playlist popover for online tracks */}
      <Menu
        anchorEl={plAnchor}
        open={!!plAnchor}
        onClose={() => { setPlAnchor(null); setPopoverData(null); }}
      >
        {playlists.length === 0 ? (
          <MenuItem disabled>
            <ListItemText>暂无歌单，请先在歌单页面创建</ListItemText>
          </MenuItem>
        ) : (
          playlists.map((pl) => (
            <MenuItem
              key={pl.id}
              onClick={() => popoverData && handleAddToPlaylist(popoverData.song, popoverData.source, pl.id)}
            >
              <ListItemText primary={pl.name} secondary={`${pl.trackIds.length} 首`} />
            </MenuItem>
          ))
        )}
      </Menu>
    </Box>
  );
}
