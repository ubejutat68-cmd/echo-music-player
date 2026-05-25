import { useEffect } from 'react';
import { usePlayerStore } from '@/stores/playerStore';

export function useMediaKeys() {
  const next = usePlayerStore((s) => s.next);
  const prev = usePlayerStore((s) => s.prev);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const pause = usePlayerStore((s) => s.pause);
  const resume = usePlayerStore((s) => s.resume);

  useEffect(() => {
    if (!window.api?.onMediaKey) return;

    window.api.onMediaKey((action) => {
      switch (action) {
        case 'play': if (!isPlaying) resume(); break;
        case 'pause': if (isPlaying) pause(); break;
        case 'next': next(); break;
        case 'prev': prev(); break;
      }
    });
  }, [isPlaying, next, prev, pause, resume]);
}
