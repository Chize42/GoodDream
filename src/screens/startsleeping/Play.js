import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Modal, FlatList, SafeAreaView } from 'react-native';
import { Ionicons } from "@expo/vector-icons";
// 임시 데이터: 음악 리스트
const musicData = [
  { id: '1', title: 'Thunderstorm', category: 'Relax' },
  { id: '2', title: 'Thunderstorm', category: 'Relax' },
  { id: '3', title: 'Thunderstorm', category: 'Relax' },
  { id: '4', title: 'Thunderstorm', category: 'Relax' },
  { id: '5', title: 'Thunderstorm', category: 'Relax' },
  { id: '6', title: 'Thunderstorm', category: 'Relax' },
];

const Play = ({ navigation }) => {
  // 상태 관리
  const [isPlaying, setIsPlaying] = useState(false); // 재생/일시정지 상태
  const [isTimerOpen, setIsTimerOpen] = useState(false); // 타이머 드롭다운 상태
  const [selectedTime, setSelectedTime] = useState('select hour...'); // 선택된 시간
  const [isMusicModalVisible, setMusicModalVisible] = useState(false); // 음악 목록 모달 상태

  // 타이머 옵션
  const timerOptions = ['Play for 1 hour', 'Play for 2 hour', 'Play for 3 hour', 'Play for 6 hour'];

  // 타이머 시간 선택 핸들러
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
          source={{ uri: 'https://i.ibb.co/8nFt38dJ/sleepOwl.png' }}
          style={styles.owlImage}
        />

        {/* 3. 현재 재생되고 있는 음악 (터치 시 모달 열기) */}
        <TouchableOpacity style={styles.musicInfoContainer} onPress={() => setMusicModalVisible(true)}>
          <Image source={{ uri: 'https://i.ibb.co/tMJtV2kP/sounds.png' }} style={styles.musicIcon} />
          <Text style={styles.musicTitle}>Thunderstorm</Text>
          <Text style={styles.musicCategory}>· Relax</Text>
        </TouchableOpacity>

        {/* 4. 재생/일시정지 버튼 */}
        <TouchableOpacity onPress={() => setIsPlaying(!isPlaying)}>
          <Image
            source={{ uri: isPlaying ? 'https://i.ibb.co/pjt4MSNy/pause.png' : 'https://i.ibb.co/bMd74SLW/play.png' }}
            style={styles.playPauseButton}
          />
        </TouchableOpacity>
        
        {/* 5. 재생 타이머 드롭다운 */}
        <View style={styles.timerContainer}>
          <TouchableOpacity style={styles.timerSelector} onPress={() => setIsTimerOpen(!isTimerOpen)}>
            <Text style={styles.timerText}>{selectedTime}</Text>
            <Image
              source={{ uri: isTimerOpen ? 'https://i.ibb.co/6RDqCpwT/down.png' : 'https://i.ibb.co/Q3kqj7Qz/down-1.png' }}
            />
          </TouchableOpacity>
          {isTimerOpen && (
            <View style={styles.timerOptions}>
              {timerOptions.map((option, index) => (
                <TouchableOpacity key={index} onPress={() => handleTimeSelection(option)}>
                  <Text style={styles.timerOptionText}>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* 6. 일어나는 시각 알람 표시 */}
        <View style={styles.wakeUpContainer}>
          <Image source={{ uri: 'https://i.imgur.com/dztYd5c.png' }} style={styles.sunIcon} />
          <Text style={styles.wakeUpText}>06:30 AM</Text>
        </View>
      </View>

      {/* 7. Stop Sleeping 버튼 */}
      <TouchableOpacity 
      style={styles.stopButton}
      onPress={() => navigation.navigate('Dismiss')}
    >
        <Image source={{ uri: 'https://i.ibb.co/ccMZ5kbK/pausebutton.png' }} style={styles.stopIcon} />
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
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.musicListItem}>
                  <Image source={{ uri: 'https://i.ibb.co/tMJtV2kP/sounds.png' }} style={styles.musicListIcon} />
                  <Text style={styles.musicListTitle}>{item.title}</Text>
                  <Text style={styles.musicListCategory}>· {item.category}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity style={styles.modalCloseButton} onPress={() => setMusicModalVisible(false)}>
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
  container: { flex: 1, backgroundColor: '#121212', alignItems: 'center' },
  backButton: { 
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 1, 
  },
  icon: { 
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  content: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    width: '100%' 
  },
  owlImage: { 
    width: 150, 
    height: 150, 
    resizeMode: 'contain', 
    marginBottom: 40 
  },
  musicInfoContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 20 
  },
  musicIcon: { 
    width: 20, 
    height: 20, 
    tintColor: 'gray', 
    marginRight: 8 
  },
  musicTitle: { 
    color: 'white', 
    fontSize: 18, 
    fontWeight: 'bold' 
  },
  musicCategory: { 
    color: 'gray', 
    fontSize: 18 
  },
  playPauseButton: { 
    width: 60, 
    height: 60, 
    resizeMode: 'contain', 
    marginVertical: 20 
  },
  timerContainer: { 
    alignItems: 'center', 
    marginVertical: 10 
  },
  timerSelector: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    borderWidth: 1, 
    borderColor: '#555', 
    borderRadius: 8, 
    paddingHorizontal: 20, 
    paddingVertical: 12, 
    width: 250, 
    justifyContent: 'space-between' 
  },
  timerText: { 
    color: '#ccc', 
    fontSize: 16 
  },
  arrowIcon: { 
    width: 12, 
    height: 12, 
    tintColor: '#ccc' 
  },
  timerOptions: { 
    marginTop: 10, 
    width: 250 
  },
  timerOptionText: { 
    color: '#4A90E2', 
    fontSize: 16, 
    paddingVertical: 8, 
    textAlign: 'center' 
  },
  wakeUpContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginTop: 30 
  },
  sunIcon: { 
    width: 20, 
    height: 20, 
    marginRight: 8, 
    tintColor: '#FFD700' 
  },
  wakeUpText: { 
    color: '#ccc', 
    fontSize: 16 
  },
  stopButton: { 
    flexDirection: 'row', 
    backgroundColor: '#4A90E2', 
    paddingVertical: 18, 
    paddingHorizontal: 30, 
    borderRadius: 30, 
    alignItems: 'center', 
    justifyContent: 'center', 
    width: '80%', 
    marginBottom: 40 
  },
  stopIcon: { 
    width: 20, 
    height: 20, 
    marginRight: 10, 
    tintColor: 'white' 
  },
  stopButtonText: { 
    color: 'white', 
    fontSize: 18, 
    fontWeight: 'bold' 
  },

  modalContainer: { 
    flex: 1, 
    justifyContent: 'flex-end', 
    backgroundColor: 'rgba(0,0,0,0.7)' 
  },
  modalContent: { 
    backgroundColor: '#222', 
    borderTopLeftRadius: 20, 
    borderTopRightRadius: 20, 
    padding: 20, 
    height: '60%' 
  },
  musicListItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: 15 
  },
  musicListIcon: { 
    width: 24, 
    height: 24, 
    tintColor: '#888', 
    marginRight: 15 
  },
  musicListTitle: { 
    color: 'white', 
    fontSize: 16 
  },
  musicListCategory: { 
    color: '#888', 
    fontSize: 16 
  },
  modalCloseButton: { 
    backgroundColor: '#333', 
    borderRadius: 15, 
    padding: 15, 
    alignItems: 'center', 
    marginTop: 20 
  },
  modalCloseButtonText: { 
    color: 'white', 
    fontSize: 16, 
    fontWeight: 'bold' 
  },
});

export default Play;