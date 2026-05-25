import { useCallback } from 'react';
import { usePlayerStore } from '@/stores/playerStore';
import { useLyricStore } from '@/stores/lyricStore';

export function useLyricSync() {
  const currentTime = usePlayerStore((s) => s.currentTime);
  const currentLyric = useLyricStore((s) => s.currentLyric);

  const getCurrentLine = useCallback(() => {
    if (!currentLyric.length) return null;
    let idx = 0;
    for (let i = 0; i < currentLyric.length; i++) {
      if (currentLyric[i].time <= currentTime) {
        idx = i;
      } else {
        break;
      }
    }
    return idx;
  }, [currentLyric, currentTime]);

  return { currentLineIndex: getCurrentLine(), currentLyric };
}
