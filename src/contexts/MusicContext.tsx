import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";
import { Audio } from "expo-av";

// SoundItem 타입 정의 (기존과 동일)
interface SoundItem {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  image: any;
  audio: any;
}

// [수정] 1. 인터페이스 변경
// playSound -> playSingleSound로 변경
interface MusicContextType {
  currentSound: SoundItem | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  playSingleSound: (item: SoundItem) => Promise<void>; // playSound가 이걸로 바뀜
  togglePlayPause: () => Promise<void>;
  seekToTime: (timeInSeconds: number) => Promise<void>;
  playPlaylist: (tracks: SoundItem[]) => void;
  playbackQueue: SoundItem[];
  queueIndex: number;
  playTrackFromQueue: (index: number) => void;
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

  // [수정] 2. 기존 playSound 함수의 이름을 _internalPlaySound로 변경
  // 이것은 Context 내부에서만 사용하는 핵심 재생 함수입니다.
  const _internalPlaySound = async (item: SoundItem) => {
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
        console.error("Error in _internalPlaySound:", error);
    }
  };
  
  const playNextInQueue = () => {
    if (queueIndex < playbackQueue.length - 1) {
      const nextIndex = queueIndex + 1;
      setQueueIndex(nextIndex);
      _internalPlaySound(playbackQueue[nextIndex]); // _internalPlaySound 호출
    } else {
      setPlaybackQueue([]);
      setQueueIndex(0);
    }
  };
  
  const playPlaylist = (tracks: SoundItem[]) => {
      if (tracks.length === 0) return;
      setPlaybackQueue(tracks);
      setQueueIndex(0);
      _internalPlaySound(tracks[0]); // _internalPlaySound 호출
  };

  const playTrackFromQueue = (index: number) => {
    if (index >= 0 && index < playbackQueue.length) {
      setQueueIndex(index);
      _internalPlaySound(playbackQueue[index]); // _internalPlaySound 호출
    }
  };

  // [추가] 3. "단일 곡 재생" 함수 (가장 중요!)
  // 이 함수는 밖(MusicPlayerScreen)에서 호출되며, 재생 목록을 비웁니다.
  const playSingleSound = async (item: SoundItem) => {
    setPlaybackQueue([]); // <-- 핵심: 플레이리스트를 비웁니다.
    setQueueIndex(0);
    await _internalPlaySound(item); // 내부 재생 함수 호출
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

  // [수정] 4. value 객체 변경 (playSound 대신 playSingleSound)
  const value = {
    currentSound,
    isPlaying,
    currentTime,
    duration,
    playSingleSound, // playSound가 이걸로 바뀜
    togglePlayPause,
    seekToTime,
    playPlaylist,
    playbackQueue,
    queueIndex,
    playTrackFromQueue,
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