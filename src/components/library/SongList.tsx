import { useRef } from 'react';
import { Box } from '@mui/material';
import { useVirtualizer } from '@tanstack/react-virtual';
import type { Track } from '@/types';
import { SongRow } from './SongRow';

interface SongListProps {
  tracks: Track[];
  showCover?: boolean;
}

export function SongList({ tracks, showCover = true }: SongListProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: tracks.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 52,
    overscan: 10,
  });

  return (
    <Box ref={parentRef} sx={{ height: '100%', overflow: 'auto' }}>
      <Box sx={{ height: virtualizer.getTotalSize(), position: 'relative' }}>
        {virtualizer.getVirtualItems().map((virtualItem) => {
          const track = tracks[virtualItem.index];
          return (
            <Box
              key={track.id}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              <SongRow track={track} index={virtualItem.index} showCover={showCover} />
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
