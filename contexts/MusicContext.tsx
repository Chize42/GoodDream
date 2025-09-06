// contexts/MusicContext.tsx
import React, { createContext, ReactNode, useContext, useEffect, useRef, useState } from 'react';

interface SoundItem {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  image: any;
}

interface MusicContextType {
  currentSound: SoundItem | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  playSound: (sound: SoundItem) => void;
  togglePlayPause: () => void;
  setCurrentTime: (time: number) => void;
  rewind: () => void;
  forward: () => void;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

interface MusicProviderProps {
  children: ReactNode;
}

export function MusicProvider({ children }: MusicProviderProps) {
  const [currentSound, setCurrentSound] = useState<SoundItem | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTimeState] = useState(0);
  const [duration] = useState(2700); // 45분 (45 * 60 = 2700초)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 재생 타이머 관리
  useEffect(() => {
    // 이전 interval 정리
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (isPlaying && currentSound) {
      intervalRef.current = setInterval(() => {
        setCurrentTimeState(prev => {
          if (prev >= duration) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isPlaying, currentSound, duration]);

  const playSound = (sound: SoundItem) => {
    if (currentSound?.id === sound.id) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentSound(sound);
      setIsPlaying(true);
      setCurrentTimeState(0); // 새로운 곡일 때는 처음부터
    }
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const setCurrentTime = (time: number) => {
    const clampedTime = Math.max(0, Math.min(duration, time));
    setCurrentTimeState(clampedTime);
  };

  const rewind = () => {
    setCurrentTime(Math.max(0, currentTime - 30));
  };

  const forward = () => {
    setCurrentTime(Math.min(duration, currentTime + 30));
  };

  const value: MusicContextType = {
    currentSound,
    isPlaying,
    currentTime,
    duration,
    playSound,
    togglePlayPause,
    setCurrentTime,
    rewind,
    forward,
  };

  return (
    <MusicContext.Provider value={value}>
      {children}
    </MusicContext.Provider>
  );
}

export function useMusicContext() {
  const context = useContext(MusicContext);
  if (context === undefined) {
    throw new Error('useMusicContext must be used within a MusicProvider');
  }
  return context;
}