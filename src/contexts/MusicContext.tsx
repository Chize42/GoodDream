// src/contexts/MusicContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";
import { Audio } from "expo-av";

interface SoundItem {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  image: any;
  audio: any;
}

interface MusicContextType {
  currentSound: SoundItem | null;
  playedSounds: SoundItem[]; // 재생된 음원들을 기록
  isPlaying: boolean;
  soundInstance: Audio.Sound | null;
  currentTime: number;
  duration: number;
  playSound: (item: SoundItem) => Promise<void>;
  togglePlayPause: () => Promise<void>;
  seekToTime: (timeInSeconds: number) => Promise<void>;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export const MusicProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentSound, setCurrentSound] = useState<SoundItem | null>(null);
  const [playedSounds, setPlayedSounds] = useState<SoundItem[]>([]); // 새로 추가
  const [isPlaying, setIsPlaying] = useState(false);
  const [soundInstance, setSoundInstance] = useState<Audio.Sound | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const playbackUpdateSubscription = useRef<any>(null);

  // 오디오 세션 설정
  useEffect(() => {
    const setupAudio = async () => {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          staysActiveInBackground: true,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });
      } catch (error) {
        console.log("Error setting up audio:", error);
      }
    };
    setupAudio();
  }, []);

  // 오디오 재생 상태 업데이트
  useEffect(() => {
    if (soundInstance) {
      playbackUpdateSubscription.current =
        soundInstance.setOnPlaybackStatusUpdate((status: any) => {
          if (status.isLoaded) {
            setIsPlaying(status.isPlaying || false);
            setCurrentTime(Math.floor((status.positionMillis || 0) / 1000));
            if (status.durationMillis) {
              setDuration(Math.floor(status.durationMillis / 1000));
            }

            // 재생 완료 시에도 currentSound는 유지
            if (status.didJustFinish) {
              setIsPlaying(false);
            }
          }
        });
    }

    return () => {
      if (playbackUpdateSubscription.current) {
        playbackUpdateSubscription.current.remove();
      }
    };
  }, [soundInstance]);

  // 오디오 인스턴스 정리
  useEffect(() => {
    return () => {
      if (soundInstance) {
        soundInstance.unloadAsync();
      }
    };
  }, [soundInstance]);

  const playSound = async (item: SoundItem) => {
    try {
      console.log("playSound called with:", item);

      // 같은 음악을 다시 재생하는 경우
      if (currentSound?.id === item.id && soundInstance) {
        const status: any = await soundInstance.getStatusAsync();
        if (status.isLoaded) {
          if (status.isPlaying) {
            await soundInstance.pauseAsync();
            setIsPlaying(false);
          } else {
            await soundInstance.playAsync();
            setIsPlaying(true);
          }
          return;
        }
      }

      // currentSound 설정
      setCurrentSound({
        id: item.id,
        title: item.title,
        subtitle: item.subtitle,
        category: item.category,
        image: item.image,
        audio: item.audio,
      });

      // playedSounds 배열에 추가 (중복 방지)
      setPlayedSounds((prev) => {
        const exists = prev.find((sound) => sound.id === item.id);
        if (!exists) {
          return [...prev, item];
        }
        return prev;
      });

      // 기존 사운드 정리
      if (soundInstance) {
        try {
          await soundInstance.unloadAsync();
        } catch (error) {
          console.log("Error unloading previous sound:", error);
        }
        setSoundInstance(null);
      }

      console.log("Loading new sound:", item.title);

      const { sound: newSound } = await Audio.Sound.createAsync(item.audio, {
        shouldPlay: true,
        isLooping: true,
      });

      setSoundInstance(newSound);
      setIsPlaying(true);
    } catch (error) {
      console.log("Error playing sound:", error);
    }
  };

  const togglePlayPause = async () => {
    if (!soundInstance || !currentSound) return;

    try {
      const status: any = await soundInstance.getStatusAsync();
      if (status.isLoaded) {
        if (status.isPlaying) {
          await soundInstance.pauseAsync();
          setIsPlaying(false);
        } else {
          await soundInstance.playAsync();
          setIsPlaying(true);
        }
      }
    } catch (error) {
      console.log("Error toggling playback:", error);
    }
  };

  const seekToTime = async (timeInSeconds: number) => {
    if (!soundInstance) return;
    try {
      await soundInstance.setPositionAsync(timeInSeconds * 1000);
    } catch (error) {
      console.log("Error seeking:", error);
    }
  };

  const value = {
    currentSound,
    playedSounds, // 새로 추가
    isPlaying,
    soundInstance,
    currentTime,
    duration,
    playSound,
    togglePlayPause,
    seekToTime,
  };

  return (
    <MusicContext.Provider value={value}>{children}</MusicContext.Provider>
  );
};

export const useMusicContext = () => {
  const context = useContext(MusicContext);
  if (context === undefined) {
    throw new Error("useMusicContext must be used within a MusicProvider");
  }
  return context;
};
