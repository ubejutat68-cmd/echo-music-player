import { Box, Typography, ToggleButtonGroup, ToggleButton, TextField, InputAdornment } from '@mui/material';
import { Search } from '@mui/icons-material';
import { useLibraryStore } from '@/stores/libraryStore';
import { SongList } from './SongList';
import { EmptyState } from '@/components/common/EmptyState';
import { FolderOpen } from '@mui/icons-material';
import type { SortField } from '@/types';

export function LibraryPage() {
  const tracks = useLibraryStore((s) => s.tracks);
  const filtered = useLibraryStore((s) => s.getFilteredTracks());
  const sortBy = useLibraryStore((s) => s.sortBy);
  const sortOrder = useLibraryStore((s) => s.sortOrder);
  const setSortBy = useLibraryStore((s) => s.setSortBy);
  const setSortOrder = useLibraryStore((s) => s.setSortOrder);
  const setFilterText = useLibraryStore((s) => s.setFilterText);
  const filterText = useLibraryStore((s) => s.filterText);

  if (tracks.length === 0) {
    return (
      <Box sx={{ p: 4 }}>
        <EmptyState
          icon={<FolderOpen sx={{ fontSize: 64 }} />}
          title="音乐库是空的"
          description="先在首页扫描本地文件夹"
        />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" fontWeight={700} gutterBottom>音乐库</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {tracks.length} 首歌曲
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <TextField
          size="small"
          placeholder="搜索歌曲、歌手、专辑..."
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          InputProps={{
            startAdornment: <InputAdornment position="start"><Search /></InputAdornment>,
          }}
          sx={{ minWidth: 280 }}
        />
        <ToggleButtonGroup
          size="small"
          value={sortBy}
          exclusive
          onChange={(_, v) => v && setSortBy(v as SortField)}
        >
          <ToggleButton value="title">歌名</ToggleButton>
          <ToggleButton value="artist">歌手</ToggleButton>
          <ToggleButton value="album">专辑</ToggleButton>
          <ToggleButton value="duration">时长</ToggleButton>
          <ToggleButton value="dateAdded">添加时间</ToggleButton>
        </ToggleButtonGroup>
        <ToggleButtonGroup
          size="small"
          value={sortOrder}
          exclusive
          onChange={(_, v) => v && setSortOrder(v)}
        >
          <ToggleButton value="asc">升序</ToggleButton>
          <ToggleButton value="desc">降序</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Box sx={{ height: 'calc(100vh - 260px)' }}>
        <SongList tracks={filtered} />
      </Box>
    </Box>
  );
}
