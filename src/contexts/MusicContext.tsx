import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";
import { Audio } from "expo-av";

// SoundItem 타입 정의
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
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  playSound: (item: SoundItem) => Promise<void>;
  togglePlayPause: () => Promise<void>;
  seekToTime: (timeInSeconds: number) => Promise<void>;
  playPlaylist: (tracks: SoundItem[]) => void;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export const MusicProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentSound, setCurrentSound] = useState<SoundItem | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [soundInstance, setSoundInstance] = useState<Audio.Sound | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  
  const [playbackQueue, setPlaybackQueue] = useState<SoundItem[]>([]);
  const [queueIndex, setQueueIndex] = useState(0);

  useEffect(() => {
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: true,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
    });
  }, []);
  
  const playNextInQueue = () => {
    if (queueIndex < playbackQueue.length - 1) {
      const nextIndex = queueIndex + 1;
      setQueueIndex(nextIndex);
      playSound(playbackQueue[nextIndex]);
    } else {
      setPlaybackQueue([]);
      setQueueIndex(0);
    }
  };

  const playSound = async (item: SoundItem) => {
    try {
      if (soundInstance) {
        await soundInstance.unloadAsync();
        setSoundInstance(null);
      }

      setCurrentSound(item);
      const { sound } = await Audio.Sound.createAsync(item.audio, { shouldPlay: true });
      setSoundInstance(sound);

      sound.setOnPlaybackStatusUpdate((status: any) => {
        if (!status.isLoaded) return;

        setIsPlaying(status.isPlaying);
        setCurrentTime(Math.floor(status.positionMillis / 1000));
        setDuration(Math.floor(status.durationMillis / 1000));

        if (status.didJustFinish && !status.isLooping) {
          if (playbackQueue.length > 0) {
            playNextInQueue();
          } else {
            setIsPlaying(false);
          }
        }
      });
    } catch (error) {
        console.error("Error in playSound:", error);
    }
  };
  
  const playPlaylist = (tracks: SoundItem[]) => {
      if (tracks.length === 0) return;
      setPlaybackQueue(tracks);
      setQueueIndex(0);
      playSound(tracks[0]);
  };

  const togglePlayPause = async () => {
    if (!soundInstance) return;
    const status = await soundInstance.getStatusAsync();
    if (status.isLoaded) {
      status.isPlaying ? await soundInstance.pauseAsync() : await soundInstance.playAsync();
    }
  };

  const seekToTime = async (timeInSeconds: number) => {
    if (soundInstance) await soundInstance.setPositionAsync(timeInSeconds * 1000);
  };

  const value = {
    currentSound,
    isPlaying,
    currentTime,
    duration,
    playSound,
    togglePlayPause,
    seekToTime,
    playPlaylist,
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