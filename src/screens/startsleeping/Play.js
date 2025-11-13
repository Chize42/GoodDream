import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Modal,
  FlatList,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
// 임시 데이터: 음악 리스트
import { Audio } from "expo-av";

// 사운드 파일 목록
const musicData = [
  {
    id: "1",
    title: "Desert Wind",
    category: "Ambient",
    file: require("../../../assets/sounds/desert-wind.mp3"),
  },
  {
    id: "2",
    title: "Firewood Crackle",
    category: "Relax",
    file: require("../../../assets/sounds/firewood.mp3"),
  },
  {
    id: "3",
    title: "Quiet Library",
    category: "Focus",
    file: require("../../../assets/sounds/library.mp3"),
  },
  {
    id: "4",
    title: "Rain Drops",
    category: "Relax",
    file: require("../../../assets/sounds/rain.mp3"),
  },
  {
    id: "5",
    title: "Spaceship Hum",
    category: "Ambient",
    file: require("../../../assets/sounds/spaceship.mp3"),
  },
  {
    id: "6",
    title: "White Noise",
    category: "Sleep",
    file: require("../../../assets/sounds/whitenoise.mp3"),
  },
];

const Play = ({ navigation, route }) => {
  // 상태 관리
  const [isPlaying, setIsPlaying] = useState(false); // 재생/일시정지 상태
  const [isTimerOpen, setIsTimerOpen] = useState(false); // 타이머 드롭다운 상태
  const [selectedTime, setSelectedTime] = useState("select hour..."); // 선택된 시간 (드롭다운)
  const [isMusicModalVisible, setMusicModalVisible] = useState(false); // 음악 목록 모달 상태
  const [elapsedTime, setElapsedTime] = useState(0); // ✅ 경과 시간 (초)

  // 시작 시간 가져오기
  const { startTime } = route.params || {};
  const [selectedMusicId, setSelectedMusicId] = useState(musicData[0].id);

  // 오디오 관련 상태 추가
  const [sound, setSound] = useState(null); // 현재 재생 중인 Sound 객체
  const [timer, setTimer] = useState(null); // 타이머 ID 저장

  // 타이머 옵션
  const timerOptions = [
    "Play for 1 hour",
    "Play for 2 hour",
    "Play for 3 hour",
    "Play for 6 hour",
  ];

  // 현재 재생 음악 정보
  const currentMusic =
    musicData.find((m) => m.id === selectedMusicId) || musicData[0];

  // ✅ 경과 시간을 포맷팅하는 함수
  const formatElapsedTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
        2,
        "0"
      )}:${String(secs).padStart(2, "0")}`;
    }
    return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(
      2,
      "0"
    )}`;
  };

  // ✅ 실시간 타이머 업데이트
  useEffect(() => {
    if (!startTime) return;

    const interval = setInterval(() => {
      const now = new Date();
      const start = new Date(startTime);
      const diffMs = now.getTime() - start.getTime();
      const diffSeconds = Math.floor(diffMs / 1000);
      setElapsedTime(diffSeconds);
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  // 1. 오디오 재생/변경/정지 핵심 로직
  const playSound = async (file) => {
    // 이전에 재생 중이던 사운드가 있으면 정지하고 메모리에서 언로드
    if (sound) {
      await sound.stopAsync();
      await sound.unloadAsync();
    }

    // 새 사운드 로드 및 재생
    const { sound: newSound } = await Audio.Sound.createAsync(file, {
      isLooping: true,
    }); // 무한 반복 설정
    setSound(newSound); // 새 Sound 객체 상태에 저장
    await newSound.playAsync();
  };

  // 2. 재생/일시정지 버튼 핸들러 (수정된 로직)
  const handlePlayPause = async () => {
    // 오디오 로드 없이 재생 요청이 들어왔다면, 현재 음악을 로드하고 재생 시작
    if (!sound && !isPlaying && currentMusic) {
      await playSound(currentMusic.file);
      setIsPlaying(true);
      return; // 처리 완료
    }

    if (sound) {
      // 현재 isPlaying 상태를 확인하여 오디오를 제어.
      if (isPlaying) {
        // 현재 재생 중이면 -> 일시정지 (UI: Pause -> Play)
        await sound.pauseAsync();
        setIsPlaying(false);
      } else {
        // 현재 일시정지 상태면 -> 재생 (UI: Play -> Pause)
        await sound.playAsync();
        setIsPlaying(true);
      }
    }
  };

  // 3. 음악 선택 핸들러 (선택 시 바로 재생)
  const handleMusicSelection = (musicId) => {
    setSelectedMusicId(musicId);
    const selectedMusic = musicData.find((m) => m.id === musicId);
    if (selectedMusic) {
      playSound(selectedMusic.file); // 선택 시 즉시 재생 시작
      setIsPlaying(true);
    }
  };

  const handleStopSleeping = () => {
    const stopTime = new Date();
    const startTimeObj = new Date(startTime);

    const durationMs = stopTime.getTime() - startTimeObj.getTime();
    if (sound) {
      sound.stopAsync();
      sound.unloadAsync();
    }
    navigation.navigate("Dismiss", {
      durationMs: durationMs,
      startTime: startTime, // ✅ startTime 전달 추가
    });
  };

  // 4. 컴포넌트 언마운트 시 오디오 정리 (메모리 누수 방지)
  useEffect(() => {
    // 컴포넌트가 사라지거나 sound 객체가 변경될 때 (새 음악 선택 등) 실행됨
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  // 타이머 시간 선택 핸들러 (기존 로직 유지)
  const handleTimeSelection = (time) => {
    setSelectedTime(time);
    setIsTimerOpen(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 1. 뒤로가기 버튼 */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.navigate("Home")}
      >
        <Ionicons name="chevron-back" size={24} color="#fff" marginTop={30} />
      </TouchableOpacity>

      <View style={styles.content}>
        {/* 2. 자고 있는 부엉이 이미지 */}
        <Image
          source={require("../../../assets/images/sleep-Owl.png")}
          style={styles.owlImage}
        />

        {/* ✅ 경과 시간 표시 - 시간만 */}
        <Text style={styles.elapsedTimeText}>
          {formatElapsedTime(elapsedTime)}
        </Text>

        {/* 3. 현재 재생되고 있는 음악 (터치 시 모달 열기) */}
        <TouchableOpacity
          style={styles.musicInfoContainer}
          onPress={() => setMusicModalVisible(true)}
        >
          <Image
            source={require("../../../assets/images/sounds.png")}
            style={styles.musicIcon}
          />
          <Text style={styles.musicTitle}>{currentMusic.title}</Text>
          <Text style={styles.musicCategory}>· {currentMusic.category}</Text>
        </TouchableOpacity>

        {/* 4. 재생/일시정지 버튼  */}
        <TouchableOpacity onPress={handlePlayPause}>
          <Image
            source={
              isPlaying
                ? require("../../../assets/images/play.png")
                : require("../../../assets/images/pause.png")
            }
            style={styles.playPauseButton}
          />
        </TouchableOpacity>

        {/* 5. 재생 타이머 드롭다운 */}
        <View style={styles.timerContainer}>
          <TouchableOpacity
            style={styles.timerSelector}
            onPress={() => setIsTimerOpen(!isTimerOpen)}
          >
            {/* 선택된 시간(기본값이 아닐 때)에 따라 텍스트 색상 파란색으로 변경 */}
            <Text
              style={[
                styles.timerText,
                selectedTime !== "select hour..." && { color: "#4A90E2" },
              ]}
            >
              {selectedTime}
            </Text>

            {/* 텍스트 화살표 아이콘 */}
            <Text
              style={[
                styles.timerArrow,
                (selectedTime !== "select hour..." || isTimerOpen) && {
                  color: "#4A90E2",
                },
              ]}
            >
              {isTimerOpen ? "▲" : "▼"}
            </Text>
          </TouchableOpacity>
          {isTimerOpen && (
            <View style={styles.timerOptions}>
              {timerOptions.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleTimeSelection(option)}
                  style={
                    selectedTime === option ? styles.selectedTimerOption : null
                  }
                >
                  <Text
                    style={[
                      styles.timerOptionText,
                      selectedTime !== option &&
                        styles.unselectedTimerOptionText,
                    ]}
                  >
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>

      {/* 7. Stop Sleeping 버튼 */}
      <TouchableOpacity style={styles.stopButton} onPress={handleStopSleeping}>
        <Image
          source={require("../../../assets/images/pausebutton.png")}
          style={styles.stopIcon}
        />
        <Text style={styles.stopButtonText}>Stop Sleeping</Text>
      </TouchableOpacity>

      {/* 음악 선택 모달 */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isMusicModalVisible}
        onRequestClose={() => setMusicModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <FlatList
              data={musicData}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => {
                const isSelected = item.id === selectedMusicId;
                return (
                  <TouchableOpacity
                    style={[
                      styles.musicListItem,
                      isSelected && styles.selectedMusicItem,
                    ]}
                    onPress={() => handleMusicSelection(item.id)}
                  >
                    <Image
                      source={require("../../../assets/images/sounds.png")}
                      style={[
                        styles.musicListIcon,
                        isSelected && { tintColor: "#4A90E2" },
                      ]}
                    />
                    <Text
                      style={[
                        styles.musicListTitle,
                        isSelected && { fontWeight: "bold", color: "#4A90E2" },
                      ]}
                    >
                      {item.title}
                    </Text>
                    <Text style={styles.musicListCategory}>
                      · {item.category}
                    </Text>
                  </TouchableOpacity>
                );
              }}
            />
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setMusicModalVisible(false)}
            >
              <Text style={styles.modalCloseButtonText}>완료</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

// 스타일시트
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121212", alignItems: "center" },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 1,
  },
  icon: {
    width: 24,
    height: 24,
    resizeMode: "contain",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  owlImage: {
    width: 150,
    height: 150,
    resizeMode: "contain",
    marginBottom: 20,
  },
  elapsedTimeText: {
    color: "#eaeaeaff",
    fontSize: 35,
    fontWeight: "bold",
    fontFamily: "monospace",
    marginBottom: 30,
    letterSpacing: 2,
  },
  musicInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  musicIcon: {
    width: 20,
    height: 20,
    tintColor: "gray",
    marginRight: 8,
  },
  musicTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  musicCategory: {
    color: "gray",
    fontSize: 18,
  },
  playPauseButton: {
    width: 60,
    height: 60,
    resizeMode: "contain",
    marginVertical: 20,
  },
  timerContainer: {
    alignItems: "center",
    marginVertical: 10,
  },
  timerSelector: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#555",
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    width: 200,
    justifyContent: "space-between",
  },
  timerText: {
    color: "#ccc",
    fontSize: 16,
  },
  timerArrow: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#ccc",
    marginLeft: 10,
  },
  timerOptions: {
    marginTop: 10,
    width: 200,
    backgroundColor: "#1E1E1E",
    borderRadius: 8,
    paddingVertical: 5,
  },
  timerOptionText: {
    color: "#4A90E2",
    fontSize: 16,
    paddingVertical: 8,
    textAlign: "center",
  },
  unselectedTimerOptionText: {
    color: "white",
  },
  selectedTimerOption: {
    backgroundColor: "#333344",
    borderRadius: 5,
  },
  wakeUpContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 30,
  },
  sunIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
    tintColor: "#FFD700",
  },
  wakeUpText: {
    color: "#ccc",
    fontSize: 16,
  },
  stopButton: {
    flexDirection: "row",
    backgroundColor: "#4A90E2",
    paddingVertical: 18,
    paddingHorizontal: 30,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    width: "80%",
    marginBottom: 40,
  },
  stopIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
    tintColor: "white",
  },
  stopButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.7)",
  },
  modalContent: {
    backgroundColor: "#222",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    height: "60%",
  },
  musicListItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  selectedMusicItem: {
    borderWidth: 1,
    borderColor: "#4A90E2",
    backgroundColor: "#333",
  },
  musicListIcon: {
    width: 24,
    height: 24,
    tintColor: "#888",
    marginRight: 15,
  },
  musicListTitle: {
    color: "white",
    fontSize: 16,
  },
  musicListCategory: {
    color: "#888",
    fontSize: 16,
  },
  modalCloseButton: {
    backgroundColor: "#333",
    borderRadius: 15,
    padding: 15,
    alignItems: "center",
    marginTop: 20,
  },
  modalCloseButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default Play;
