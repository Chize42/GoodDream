import React, { useState, useRef, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  Image,
  Modal,
  StyleSheet,
  ScrollView,
} from "react-native";

export default function ChallengeStartScreen({ route, navigation }) {
  const { totalDays } = route.params || {};

  const [infoModalVisible, setInfoModalVisible] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [completionModalVisible, setCompletionModalVisible] = useState(false);
  const [currentDay, setCurrentDay] = useState(1);
  const scrollViewRef = useRef(null);
  const [owlLayoutY, setOwlLayoutY] = useState(0); 
  const owlImg = "https://i.ibb.co/hxgqmQvL/image-1.png";
  const footprintImg = "https://i.ibb.co/xqYdhd5S/pngegg-1.png";
  const successOwlImg = "https://i.ibb.co/hJTLCHsf/Kakao-Talk-20250524-151947386-1.png";

  useEffect(() => {
    if (owlLayoutY > 0) {
      setTimeout(() => {
        const yOffset = owlLayoutY > 100 ? owlLayoutY - 100 : 0;
        scrollViewRef.current?.scrollTo({ y: yOffset, animated: false });
      }, 0); 
    }
  }, [owlLayoutY]);

  const handleNextDay = () => {
    const nextDay = currentDay + 1;
    if (currentDay >= totalDays) return;

    setCurrentDay(nextDay); 

    if (nextDay >= totalDays) {
      setCompletionModalVisible(true);
    } else {
      setSuccessModalVisible(true);
    }
  };

  const renderChallengePath = () => {
    if (!totalDays || totalDays <= 0) {
        return <Text style={styles.emptyText}>기간 없이 자유롭게 도전해요!</Text>;
      }
      return Array.from({ length: totalDays }, (_, i) => i + 1)
        .reverse()
        .map((day) => {
          const isCompleted = day <= currentDay;
          const isNextDay = day === currentDay + 1;
          const isLeft = (totalDays - day) % 2 === 0;
          return (
            <View key={day}>
              <View
                style={isLeft ? styles.rowLeft : styles.rowRight}
                onLayout={(event) => {
                  if (isNextDay) {
                    const layout = event.nativeEvent.layout;
                    setOwlLayoutY(layout.y);
                  }
                }}
              >
                <View style={styles.circle}>
                  {isCompleted ? <Image source={{ uri: footprintImg }} style={styles.footprint} />
                   : isNextDay && (currentDay < totalDays) ? <Image source={{ uri: owlImg }} style={styles.owl} />
                   : null}
                </View>
              </View>
              {day > 1 && (
                <View style={styles.dotRow}>
                  {Array.from({ length: 3 }).map((_, i) => <View key={i} style={styles.dot} />)}
                </View>
              )}
            </View>
          );
        });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image source={{ uri: 'https://i.ibb.co/Dg5C8MzW/Arrow.png' }} style={styles.icon} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setInfoModalVisible(true)}>
          <Image source={{ uri: 'https://i.ibb.co/JwCPKLj6/mage-information-circle-fill.png' }} style={styles.icon} />
        </TouchableOpacity>
      </View>

      <ScrollView ref={scrollViewRef} style={styles.scrollView} contentContainerStyle={styles.pathContainer}>
        {renderChallengePath()}
      </ScrollView>
      
      <Text style={styles.streakText}>
        <Text style={styles.blueText}>{currentDay > totalDays ? totalDays : currentDay}</Text>일 연속 도전 중!
      </Text>

      <Modal visible={infoModalVisible} transparent={true} animationType="fade" onRequestClose={() => setInfoModalVisible(false)}>
        <View style={styles.modalBackground}>
          <View style={styles.infoModalContent}>
            <TouchableOpacity style={styles.closeBtn} onPress={() => setInfoModalVisible(false)}>
              <Text style={styles.closeText}>×</Text>
            </TouchableOpacity>
            <Text style={styles.modalMainText}>
              {(!totalDays || totalDays <= 0) ? (
                <><Text style={styles.blueText}>기간없이</Text> 챌린지 중이에요</>
              ) : (
                <><Text style={styles.blueText}>{totalDays}</Text>일 챌린지 중이에요</>
              )}
            </Text>
            <TouchableOpacity 
              style={styles.resetButton}
              onPress={() => {
                setInfoModalVisible(false);
                navigation.navigate('Home');
              }}
            >
              <Text style={styles.resetButtonText}>챌린지 다시 설정하기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={successModalVisible} transparent={true} animationType="fade" onRequestClose={() => setSuccessModalVisible(false)}>
        <View style={styles.modalBackground}>
          <View style={styles.successModalContent}>
            <TouchableOpacity style={styles.closeBtn} onPress={() => setSuccessModalVisible(false)}>
              <Text style={styles.closeText}>×</Text>
            </TouchableOpacity>
            <Image source={{ uri: successOwlImg }} style={styles.successOwlImg} />
            <Text style={styles.successTitle}>오늘의 챌린지 성공!</Text>
            <Text style={styles.successSubtitle}>내일도 부엉이와 함께 해요</Text>
          </View>
        </View>
      </Modal>

      <Modal visible={completionModalVisible} transparent={true} animationType="fade" onRequestClose={() => setCompletionModalVisible(false)}>
        <View style={styles.modalBackground}>
          <View style={styles.completionModalContent}>
            <Text style={styles.completionTitle}>챌린지가 마무리 되었습니다</Text>
            <Text style={styles.completionSubtitle}>챌린지를 다시 설정하시겠습니까?</Text>
            <View style={styles.completionButtonRow}>
              <TouchableOpacity
                style={[styles.completionButton, styles.completionButtonNo]}
                onPress={() => setCompletionModalVisible(false)}
              >
                <Text style={styles.completionButtonTextNo}>아니오</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.completionButton, styles.completionButtonYes]}
                onPress={() => {
                  setCompletionModalVisible(false);
                  navigation.navigate('Home');
                }}
              >
                <Text style={styles.completionButtonTextYes}>예</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
      <TouchableOpacity style={styles.tempButton} onPress={handleNextDay}>
        <Text style={styles.tempButtonText}>하루 진행 (테스트용)</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#19171C" 
  },
  header: { 
    width: "100%", 
    flexDirection: "row", 
    justifyContent: "space-between", 
    paddingHorizontal: 20, 
    paddingTop: 20, 
    alignItems: "center", 
    zIndex: 1 
  },
  infoBtn: { 
    color: "#fff", 
    fontSize: 26, 
    fontWeight: "bold" 
  },
  icon: {
    width: 24,
    height: 24,
  },
  scrollView: { 
    width: '100%' 
  },
  pathContainer: { 
    paddingTop: 20, 
    paddingBottom: 100, 
    alignItems: "center" 
  },
  rowLeft: { 
    alignSelf: "flex-start", 
    marginLeft: 50 
  },
  rowRight: { 
    alignSelf: "flex-end", 
    marginRight: 50 
  },
  circle: { 
    width: 64, 
    height: 64, 
    borderRadius: 32, 
    backgroundColor: "#fff", 
    justifyContent: "center", 
    alignItems: "center", 
    marginVertical: 18 
  },
  footprint: { 
    width: 42, 
    height: 42, 
    resizeMode: "contain" 
  },
  owl: { 
    width: 64, 
    height: 64, 
    resizeMode: "contain" 
  },
  dotRow: { 
    alignItems: "center", 
    justifyContent: "center", 
    marginVertical: 6 
  },
  dot: { 
    width: 10, 
    height: 10, 
    borderRadius: 5, 
    backgroundColor: "#fff", 
    marginVertical: 4 
  },
  streakText: { 
    position: "absolute", 
    bottom: 80, 
    width: "100%", 
    textAlign: "left",
    paddingLeft: 30, 
    fontSize: 20, 
    color: "#fff", 
    fontWeight: "600" 
  },
  blueText: { 
    color: "#4074D8", 
    fontWeight: "bold" 
  },
  emptyText: { 
    color: "#fff", 
    fontSize: 18, 
    marginTop: 50 
  },
  modalBackground: { 
    flex: 1, 
    backgroundColor: "rgba(0,0,0,0.6)", 
    justifyContent: "center", 
    alignItems: "center" 
  },
  infoModalContent: { 
    backgroundColor: "#fff", 
    borderRadius: 16, 
    padding: 20, 
    paddingTop: 30, 
    width: '75%', 
    alignItems: "center", 
    position: "relative" 
  },
  closeBtn: { 
    position: "absolute", 
    top: 10, 
    right: 16, 
    zIndex: 2 
  },
  closeText: { 
    fontSize: 22, 
    color: "#19171C", 
    fontWeight: "bold" 
  },
  modalMainText: { 
    fontSize: 21, 
    color: "#19171C", 
    marginBottom: 20, 
  },
  resetButton: { 
    borderTopWidth: 1, 
    borderTopColor: '#eee', 
    width: '100%', 
    paddingTop: 10, 
    alignItems: 'center' 
  },
  resetButtonText: { 
    color: '#D9534F', 
    fontSize: 14 
  },
  successModalContent: { 
    width: "75%", 
    backgroundColor: "#fff", 
    borderRadius: 16, 
    padding: 20, 
    alignItems: "center", 
    position: "relative" 
  },
  successOwlImg: { 
    width: 80, 
    height: 80, 
    resizeMode: "contain", 
    marginBottom: 10 
  },
  successTitle: { 
    fontSize: 18, 
    fontWeight: "bold", 
    color: "#19171C", 
    marginBottom: 4 
  },
  successSubtitle: { 
    fontSize: 14, 
    color: "#555" 
  },
  tempButton: { 
    position: 'absolute', 
    bottom: 30, 
    alignSelf: 'center', 
    backgroundColor: '#4074D8', 
    paddingVertical: 10, 
    paddingHorizontal: 20, 
    borderRadius: 20 
  },
  tempButtonText: { 
    color: '#fff', 
    fontWeight: 'bold' 
  },

  completionModalContent: { 
    width: '75%', 
    backgroundColor: '#fff', 
    borderRadius: 14, 
    padding: 20, 
    alignItems: 'center' 
  },
  completionTitle: { 
    fontSize: 17, 
    fontWeight: 'bold', 
    color: '#000', 
    marginBottom: 4 
  },
  completionSubtitle: { 
    fontSize: 13, 
    color: '#000', 
    marginBottom: 20 
  },
  completionButtonRow: { 
    flexDirection: 'row', 
    width: '100%' 
  },
  completionButton: { 
    flex: 1, 
    paddingVertical: 12, 
    borderTopWidth: 1, 
    borderTopColor: '#EFEFEF' 
  },
  completionButtonNo: { 
    borderRightWidth: 1, 
    borderRightColor: '#EFEFEF' 
  },
  completionButtonTextNo: { 
    color: '#D9534F', 
    textAlign: 'center', 
    fontSize: 17 
  },
  completionButtonTextYes: { 
    color: '#007AFF', 
    textAlign: 'center', 
    fontSize: 17, 
    fontWeight: 'bold' 
  },
});