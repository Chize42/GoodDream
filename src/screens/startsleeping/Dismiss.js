import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, SafeAreaView } from 'react-native';


const Dismiss  = ({ navigation }) => {
  return (
    // LinearGradient 대신 일반 View 컴포넌트를 사용하고, 배경색을 지정합니다.
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* 뒤로가기 버튼 */}
        <TouchableOpacity 
      style={styles.backButton} // ✨ 이 스타일을 적용하세요!
      onPress={() => navigation.navigate("Home")}
    >
      <Image
        source={{ uri: "https://i.ibb.co/Dg5C8MzW/Arrow.png" }}
        style={styles.icon}
      />
    </TouchableOpacity>

        <View style={styles.content}>
          {/* 깨어있는 부엉이 이미지 */}
          <Image
            source={{ uri: 'https://i.ibb.co/PzPQTJwJ/wakeup-Owl.png' }}
            style={styles.owlImage}
          />

          {/* Wake-up. It's time! 문구 */}
          <Text style={styles.wakeUpTitle}>Wake-up. It's time!</Text>

          {/* 수면 시각, 수면 질 시각화 */}
          <View style={styles.statsCard}>
            <View style={styles.statItem}>
              <View style={styles.statHeader}>
                <Image source={{ uri: 'https://i.imgur.com/8e5P5nN.png' }} style={styles.statIcon} />
                <Text style={styles.statLabel}>Sleep</Text>
              </View>
              <Text style={styles.statValue}>06h 41m</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statItem}>
              <View style={styles.statHeader}>
                <View style={styles.qualityCircleOuter}>
                    <View style={styles.qualityCircleInner} />
                </View>
                <Text style={styles.statLabel}>Quality</Text>
              </View>
              <Text style={styles.statValue}>60%</Text>
            </View>
          </View>
        </View>

        {/* Dismiss 버튼 */}
        <TouchableOpacity style={styles.dismissButton}
          onPress={() => navigation.navigate("Home")}
        >
          <Text style={styles.dismissButtonText}>Dismiss</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  // LinearGradient 대신 backgroundColor 속성을 지정합니다.
  container: { flex: 1, backgroundColor: '#2E2217' }, 
  safeArea: { flex: 1, alignItems: 'center', justifyContent: 'space-between' },
  backButton: { // ✨ 이 스타일을 추가하세요!
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 1, // 다른 요소들 위에 보이게 함
  },
 icon: { // 뒤로가기 아이콘 스타일
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', width: '100%' },
  owlImage: { width: 120, height: 120, resizeMode: 'contain', marginBottom: 30 },
  wakeUpTitle: { color: 'white', fontSize: 24, fontWeight: 'bold', marginBottom: 40 },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 20,
    padding: 20,
    width: '85%',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  statItem: { flex: 1, alignItems: 'center' },
  statHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  statIcon: { width: 16, height: 16, marginRight: 8, tintColor: '#A9A9A9' },
  statLabel: { color: '#A9A9A9', fontSize: 16 },
  statValue: { color: 'white', fontSize: 22, fontWeight: 'bold' },
  divider: { width: 1, height: '80%', backgroundColor: '#555' },
  qualityCircleOuter: {
    width: 16, height: 16, borderRadius: 8, borderWidth: 1.5, borderColor: '#3b82f6',
    justifyContent: 'center', alignItems: 'center', marginRight: 8,
  },
  qualityCircleInner: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#3b82f6' },
  dismissButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: 'center',
    width: '85%',
    marginBottom: 40,
  },
  dismissButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
});

export default Dismiss;