import { useEffect, useRef, useCallback } from 'react';
import { usePlayerStore } from '@/stores/playerStore';
import { audioEngine } from '@/engine/audioEngine';

export function useAudioEngine() {
  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const volume = usePlayerStore((s) => s.volume);
  const setCurrentTime = usePlayerStore((s) => s.setCurrentTime);
  const setDuration = usePlayerStore((s) => s.setDuration);
  const setIsPlaying = usePlayerStore((s) => s.setIsPlaying);
  const animFrameRef = useRef<number>(0);

  const updateTime = useCallback(() => {
    if (audioEngine.getIsPlaying()) {
      const time = audioEngine.getCurrentTime();
      setCurrentTime(time);
      animFrameRef.current = requestAnimationFrame(updateTime);
    }
  }, [setCurrentTime]);

  useEffect(() => {
    if (!currentTrack) return;

    audioEngine.loadAndPlay(currentTrack.path).then(() => {
      setDuration(audioEngine.getDuration());
      setIsPlaying(true);
      animFrameRef.current = requestAnimationFrame(updateTime);
    }).catch((err) => {
      console.error('Playback error:', err);
      setIsPlaying(false);
    });

    return () => {
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [currentTrack?.id]);

  useEffect(() => {
    if (isPlaying) {
      audioEngine.resume();
      animFrameRef.current = requestAnimationFrame(updateTime);
    } else {
      audioEngine.pause();
      cancelAnimationFrame(animFrameRef.current);
    }
  }, [isPlaying]);

  useEffect(() => {
    audioEngine.setVolume(volume);
  }, [volume]);
}
