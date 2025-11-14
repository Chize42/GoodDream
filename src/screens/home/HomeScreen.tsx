// src/screens/HomeScreen.tsx
import { Feather, Ionicons } from "@expo/vector-icons";
import React, { useState, useEffect } from "react";
import { auth, db } from "../../services/firebase";
import { doc, getDoc } from "firebase/firestore";
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from "react-native";
import WeekChart from "../../components/WeekChart";
import { useAuth } from "../../contexts/AuthContext";
import { useSyncContext } from "../../contexts/SyncContext";

const { width } = Dimensions.get("window");

// 📱 반응형 스케일 계산
const BASE_WIDTH = 375; // iPhone 11 Pro 기준
const scale = width / BASE_WIDTH;

// ✅ 좌우도 증가분의 70%만 적용
const normalizeSize = (size: number) => {
  const scaledSize = size * scale;
  const limitedScale = size + (scaledSize - size) * 0.7; // 증가분의 70%만 적용
  return Math.round(limitedScale);
};

// ✅ 카드 텍스트는 작은 화면에서 더 작게
const normalizeCardText = (size: number) => {
  if (width < 375) {
    // 작은 화면에서는 90% 크기로
    return Math.round(size * 0.9);
  }
  return normalizeSize(size);
};

// ✅ 카드 높이는 화면 너비에 비례하지만 가로보다 덜 늘어남 (70%)
const scaleHeight = (size: number) => {
  const scaledSize = size * scale;
  const limitedScale = size + (scaledSize - size) * 0.7; // 증가분의 70%만 적용
  return Math.round(limitedScale);
};

// 태블릿 여부 판단
const isTablet = width >= 768;

function HomeScreen({ navigation }: { navigation: any }) {
  const { user } = useAuth();
  const { syncData, isSyncing } = useSyncContext();
  const [username, setUsername] = useState("사용자");
  const [loading, setLoading] = useState(true);
  const [weekData, setWeekData] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  // 이번 주 날짜 계산 함수
  const getThisWeekDates = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));

    const weekDates = [];
    const dayNames = ["월", "화", "수", "목", "금", "토", "일"];

    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      weekDates.push({
        date: date.toISOString().split("T")[0],
        dayName: dayNames[i],
        data: null,
      });
    }

    return weekDates;
  };

  // Firebase에서 수면 데이터 가져오기
  const fetchWeekSleepData = async () => {
    try {
      if (!user?.uid) {
        console.log("❌ 사용자 정보가 없습니다");
        setWeekData(getThisWeekDates());
        return;
      }

      const weekDates = getThisWeekDates();
      const startDate = weekDates[0].date;
      const endDate = weekDates[6].date;

      console.log(
        `📖 주간 데이터 조회: ${user.uid} - ${startDate} ~ ${endDate}`
      );

      const { getSleepDataRange } = await import("../../services/sleepService");
      const sleepDataMap = await getSleepDataRange(
        user.uid,
        startDate,
        endDate
      );

      const updatedWeekData = weekDates.map((dayInfo) => ({
        ...dayInfo,
        data: sleepDataMap[dayInfo.date] || null,
      }));

      setWeekData(updatedWeekData);
      console.log(
        `✅ 주간 데이터 로드 완료: ${Object.keys(sleepDataMap).length}개`
      );
    } catch (error) {
      console.error("주간 수면 데이터 조회 오류:", error);
      setWeekData(getThisWeekDates());
    }
  };

  // 빠른 동기화 핸들러
  const handleQuickSync = async () => {
    try {
      const result = await syncData(7);

      if (result.success) {
        Alert.alert(
          "동기화 완료",
          `${result.syncedCount}개의 데이터를 가져왔습니다.`
        );
        await fetchWeekSleepData();
      } else {
        Alert.alert(
          "동기화 실패",
          result.error || "알 수 없는 오류가 발생했습니다."
        );
      }
    } catch (error: any) {
      console.error("동기화 오류:", error);
      Alert.alert("오류", error.message || "동기화 중 오류가 발생했습니다.");
    }
  };

  // 새로고침
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchWeekSleepData();
    setRefreshing(false);
  };

  useEffect(() => {
    const loadUserData = async () => {
      try {
        if (!user?.uid) {
          console.log("❌ 로그인 상태가 아닙니다");
          setLoading(false);
          return;
        }

        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUsername(userData.username || "사용자");
        }

        await fetchWeekSleepData();
      } catch (error) {
        console.error("사용자 정보를 가져오는 중 오류:", error);
        setUsername("사용자");
        setWeekData(getThisWeekDates());
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [user]);

  const getCurrentDate = () => {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = {
      day: "2-digit",
      month: "short",
      year: "numeric",
    };
    return now.toLocaleDateString("en-US", options);
  };

  if (loading) {
    return (
      <View
        style={[
          styles.homeScreen,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <Text style={{ color: "white" }}>로딩 중...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.homeScreen}
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor="#fff"
          colors={["#007AFF"]}
        />
      }
    >
      <View style={styles.homeContent}>
        <View style={styles.homeHeader}>
          <View>
            <Text style={styles.welcomeText}>Welcome, {username}</Text>
            <Text style={styles.dateText}>{getCurrentDate()}</Text>
          </View>

          <View style={styles.profileWrapper}>
            <View style={styles.profileCircle}>
              <Image
                source={require("../../../assets/owl.png")}
                style={styles.profileImg}
              />
            </View>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => navigation.navigate("Settings")}
            >
              <Feather name="edit-2" size={normalizeSize(14)} color="#2E4A7D" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.weekly}>
          <Text style={styles.weeklyText}>weekly report</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity
              onPress={handleQuickSync}
              disabled={isSyncing}
              style={styles.syncIconButton}
            >
              {isSyncing ? (
                <ActivityIndicator size="small" color="#4074D8" />
              ) : (
                <Ionicons
                  name="sync-outline"
                  size={normalizeSize(18)}
                  color="#4074D8"
                />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.seeMoreButton}
              onPress={() => {
                const today = new Date().toISOString().split("T")[0];
                navigation.navigate("SleepReport", { initialDate: today });
              }}
            >
              <Text style={styles.seeMoreText}>더보기</Text>
              <Ionicons
                name="chevron-forward"
                size={normalizeSize(20)}
                color="#fff"
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.chartBox}>
          <WeekChart weekData={weekData} />
        </View>

        <View style={styles.cardRow}>
          <TouchableOpacity
            style={[styles.bigCard, styles.purple]}
            onPress={() => navigation.navigate("SleepSchedule")}
          >
            <Image
              source={require("../../../assets/alramOwl.png")}
              style={styles.cardIllustration}
            />
            <Text style={styles.cardTitle}>스케줄 설정</Text>
            <Text style={styles.cardSubtitle}>SCHEDULE</Text>
          </TouchableOpacity>

          <View style={styles.smallCardColumn}>
            <TouchableOpacity
              style={[styles.smallCard, styles.orange]}
              onPress={() => navigation.navigate("Music")}
            >
              <Image
                source={require("../../../assets/soundOwl.png")}
                style={styles.soundIllustration}
              />
              <Text style={styles.cardTitleT}>사운드</Text>
              <Text style={styles.cardSubtitleT}>MUSIC</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.smallCard, styles.blue]}
              onPress={() => navigation.navigate("Bubble")}
            >
              <Image
                source={require("../../../assets/bubble.png")}
                style={styles.bubbleIllustration}
              />
              <Text style={styles.cardTitle}>고민방울</Text>
              <Text style={styles.cardSubtitle}>BUBBLE</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={styles.challengeBox}
          onPress={() => navigation.navigate("Challenge")}
        >
          <Image
            source={require("../../../assets/challengeOwl.png")}
            style={styles.challengeOwl}
          />
          <View style={styles.challengeTexts}>
            <Text style={styles.challengeTitle}>챌린지</Text>
            <Text style={styles.challengeSubtitle}>CHALLENGE</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.startSleepingBtn}
          onPress={() =>
            navigation.navigate("Play", {
              startTime: new Date().toISOString(),
            })
          }
        >
          <Image
            source={require("../../../assets/moon.png")}
            style={styles.sleepingIcon}
          />
          <Text style={styles.startSleepingText}>Start Sleeping</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  homeScreen: {
    backgroundColor: "#181820",
    marginTop: 50,
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
    paddingVertical: normalizeSize(5),
    paddingHorizontal: normalizeSize(20),
    paddingTop: normalizeSize(20),
    paddingBottom: normalizeSize(40), // ✅ 하단 패딩 추가
  },
  homeContent: {
    width: "100%",
  },
  homeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: normalizeSize(20),
  },
  dateText: {
    fontSize: normalizeSize(17),
    color: "#aaa",
    marginTop: 0,
    marginBottom: normalizeSize(4),
  },
  welcomeText: {
    fontSize: normalizeSize(25),
    fontWeight: "bold",
    color: "white",
    marginBottom: normalizeSize(4),
  },
  profileWrapper: {
    position: "relative",
    width: normalizeSize(60),
    height: normalizeSize(60),
  },
  profileCircle: {
    backgroundColor: "#2E4A7D",
    width: normalizeSize(60),
    height: normalizeSize(60),
    borderRadius: normalizeSize(30),
    justifyContent: "center",
    alignItems: "center",
  },
  profileImg: {
    width: normalizeSize(40),
    height: normalizeSize(40),
    resizeMode: "contain",
  },
  editButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "white",
    borderRadius: normalizeSize(12),
    padding: normalizeSize(3),
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
  },
  weekly: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: normalizeSize(10),
  },
  weeklyText: {
    fontSize: normalizeSize(18),
    color: "white",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: normalizeSize(12),
  },
  syncIconButton: {
    width: normalizeSize(28),
    height: normalizeSize(28),
    justifyContent: "center",
    alignItems: "center",
    borderRadius: normalizeSize(14),
    backgroundColor: "rgba(64, 116, 216, 0.15)",
  },
  seeMoreButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  seeMoreText: {
    marginRight: normalizeSize(4),
    color: "#aaa",
    fontSize: normalizeSize(14),
  },
  chartBox: {
    backgroundColor: "#1D1B20",
    borderRadius: normalizeSize(12),
    paddingHorizontal: normalizeSize(24), // ✅ 가로 패딩 증가
    paddingVertical: normalizeSize(20), // ✅ 세로 패딩
    marginBottom: normalizeSize(20),
    minHeight: scaleHeight(240), // ✅ 높이 증가
    justifyContent: "flex-end", // ✅ 차트를 아래로 정렬
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: normalizeSize(20),
    gap: normalizeSize(12), // ✅ 카드 사이 간격 추가
  },
  bigCard: {
    flex: 1,
    borderRadius: normalizeSize(16),
    padding: normalizeSize(12),
    height: scaleHeight(200), // ✅ 화면 비율에 맞춰 높이 조정
  },
  smallCardColumn: {
    flex: 1,
    justifyContent: "space-between",
  },
  smallCard: {
    borderRadius: normalizeSize(16),
    padding: normalizeSize(12),
    height: scaleHeight(95), // ✅ 화면 비율에 맞춰 높이 조정
    marginBottom: normalizeSize(10),
  },
  purple: {
    backgroundColor: "#7593CE",
  },
  orange: {
    backgroundColor: "#B8D0FF",
  },
  blue: {
    backgroundColor: "#263A54",
  },
  cardIllustration: {
    width: normalizeSize(77),
    height: normalizeSize(77),
    position: "absolute",
    top: normalizeSize(16),
    right: normalizeSize(16),
  },
  soundIllustration: {
    width: normalizeSize(60),
    height: normalizeSize(60),
    position: "absolute",
    top: normalizeSize(15),
    right: normalizeSize(9),
  },
  bubbleIllustration: {
    width: normalizeSize(50),
    height: normalizeSize(50),
    position: "absolute",
    top: normalizeSize(20),
    right: normalizeSize(16),
  },
  cardTitle: {
    fontWeight: "bold",
    fontSize: normalizeCardText(20), // ✅ 작은 화면에서 줄어듦
    color: "white",
    position: "absolute",
    bottom: normalizeSize(45),
    left: normalizeSize(20),
  },
  cardTitleT: {
    fontWeight: "bold",
    fontSize: normalizeCardText(20), // ✅ 작은 화면에서 줄어듦
    color: "#3F414E",
    position: "absolute",
    bottom: normalizeSize(45),
    left: normalizeSize(20),
  },
  cardSubtitle: {
    fontSize: normalizeCardText(10), // ✅ 작은 화면에서 줄어듦
    color: "white",
    position: "absolute",
    bottom: normalizeSize(27),
    left: normalizeSize(20),
  },
  cardSubtitleT: {
    fontSize: normalizeCardText(10), // ✅ 작은 화면에서 줄어듦
    color: "#524F53",
    position: "absolute",
    bottom: normalizeSize(27),
    left: normalizeSize(20),
  },
  challengeBox: {
    backgroundColor: "#333242",
    borderRadius: normalizeSize(16),
    padding: normalizeSize(10),
    flexDirection: "row",
    alignItems: "center",
    marginBottom: normalizeSize(20),
    paddingLeft: normalizeSize(70),
    gap: normalizeSize(110),
    minHeight: scaleHeight(100), // ✅ 최소 높이 추가
  },
  challengeOwl: {
    width: normalizeSize(77),
    height: normalizeSize(77),
  },
  challengeTexts: {
    flex: 1,
  },
  challengeTitle: {
    fontSize: normalizeCardText(20), // ✅ 작은 화면에서 줄어듦
    fontWeight: "bold",
    color: "white",
    right: normalizeSize(25),
  },
  challengeSubtitle: {
    fontSize: normalizeCardText(11), // ✅ 작은 화면에서 줄어듦
    color: "#ccc",
    marginTop: normalizeSize(10),
    fontWeight: "bold",
    right: normalizeSize(25),
  },
  startSleepingBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#3f78ff",
    borderRadius: normalizeSize(30),
    paddingVertical: scaleHeight(15), // ✅ 화면 비율에 맞춰 패딩 조정
    paddingHorizontal: normalizeSize(30),
    alignSelf: "center",
    gap: normalizeSize(8),
    minHeight: scaleHeight(50), // ✅ 최소 높이 추가
  },
  sleepingIcon: {
    width: normalizeSize(18),
    height: normalizeSize(18),
  },
  startSleepingText: {
    color: "white",
    fontWeight: "bold",
    fontSize: normalizeSize(14),
  },
});

export default HomeScreen;
