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
} from "react-native";
import WeekChart from "../../components/WeekChart";
import { useAuth } from "../../contexts/AuthContext";
import EnhancedSyncButton from "../../components/EnhancedSyncButton";

const { width } = Dimensions.get("window");

function HomeScreen({ navigation }: { navigation: any }) {
  const { user } = useAuth();
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

  // Health Connect 동기화 완료 후 콜백
  const handleSyncComplete = async (syncedData: any) => {
    console.log("✅ Health Connect 동기화 완료, 화면 갱신");

    // 주간 데이터 다시 로드
    await fetchWeekSleepData();
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

        // Firestore에서 사용자 정보 가져오기
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUsername(userData.username || "사용자");
        }

        // 주간 수면 데이터 가져오기
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

  // 현재 날짜 포맷팅
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
              <Feather name="edit-2" size={14} color="#2E4A7D" />
            </TouchableOpacity>
          </View>
        </View>

        {/* ⭐ Health Connect 동기화 버튼 추가 */}
        <View style={styles.syncButtonContainer}>
          <EnhancedSyncButton
            onSyncComplete={handleSyncComplete}
            style={styles.syncButton}
          />
        </View>

        <View style={styles.weekly}>
          <Text style={styles.weeklyText}>weekly report</Text>
          <TouchableOpacity
            style={styles.seeMoreButton}
            onPress={() => {
              const today = new Date().toISOString().split("T")[0];
              navigation.navigate("SleepReport", { initialDate: today });
            }}
          >
            <Text style={styles.seeMoreText}>더보기</Text>
            <Ionicons name="chevron-forward" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.chartBox}>
          <WeekChart weekData={weekData} />
        </View>

        {/* 알람 + 사운드/버블 */}
        <View style={styles.cardRow}>
          {/* 왼쪽 알람 큰 카드 */}
          <TouchableOpacity
            style={[styles.bigCard, styles.purple]}
            onPress={() => navigation.navigate("SleepSchedule")}
          >
            <Image
              source={require("../../../assets/alramOwl.png")}
              style={styles.cardIllustration}
            />
            <Text style={styles.cardTitle}>스케쥴 설정</Text>
            <Text style={styles.cardSubtitle}>SCHEDULE</Text>
          </TouchableOpacity>

          {/* 오른쪽 (사운드 + 버블) */}
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
              <Text style={styles.cardTitle}>버블</Text>
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
          onPress={() => navigation.navigate("Play")}
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
    paddingVertical: 5,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  homeContent: {
    width: "100%",
    maxWidth: 400,
  },
  homeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  dateText: {
    fontSize: 17,
    color: "#aaa",
    marginTop: 0,
    marginBottom: 4,
  },
  welcomeText: {
    fontSize: 25,
    fontWeight: "bold",
    color: "white",
    marginBottom: 4,
  },
  profileWrapper: {
    position: "relative",
    width: 60,
    height: 60,
  },
  profileCircle: {
    backgroundColor: "#2E4A7D",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  profileImg: {
    width: 40,
    height: 40,
    resizeMode: "contain",
  },
  editButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "white",
    borderRadius: 12,
    padding: 3,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
  },
  // ⭐ 동기화 버튼 컨테이너 스타일
  syncButtonContainer: {
    marginBottom: 16,
    alignItems: "center",
  },
  syncButton: {
    width: "100%",
  },
  weekly: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  weeklyText: {
    fontSize: 18,
    color: "white",
  },
  seeMoreButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  seeMoreText: {
    marginRight: 4,
    color: "#aaa",
  },
  chartBox: {
    backgroundColor: "#1D1B20",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    minHeight: 200,
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  bigCard: {
    flex: 1,
    borderRadius: 16,
    padding: 12,
    height: 200,
    marginRight: 10,
  },
  smallCardColumn: {
    flex: 1,
    justifyContent: "space-between",
  },
  smallCard: {
    borderRadius: 16,
    padding: 12,
    height: 95,
    marginBottom: 10,
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
    width: 77,
    height: 77,
    position: "absolute",
    top: 16,
    right: 16,
  },
  soundIllustration: {
    width: 60,
    height: 60,
    position: "absolute",
    top: 15,
    right: 9,
  },
  bubbleIllustration: {
    width: 50,
    height: 50,
    position: "absolute",
    top: 20,
    right: 16,
  },
  cardTitle: {
    fontWeight: "bold",
    fontSize: 20,
    color: "white",
    position: "absolute",
    bottom: 45,
    left: 20,
  },
  cardTitleT: {
    fontWeight: "bold",
    fontSize: 20,
    color: "#3F414E",
    position: "absolute",
    bottom: 45,
    left: 20,
  },
  cardSubtitle: {
    fontSize: 10,
    color: "white",
    position: "absolute",
    bottom: 27,
    left: 20,
  },
  cardSubtitleT: {
    fontSize: 10,
    color: "#524F53",
    position: "absolute",
    bottom: 27,
    left: 20,
  },
  challengeBox: {
    backgroundColor: "#333242",
    borderRadius: 16,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    paddingLeft: 70,
    gap: 110,
  },
  challengeOwl: {
    width: 77,
    height: 77,
  },
  challengeTexts: {
    flex: 1,
  },
  challengeTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    right: 25,
  },
  challengeSubtitle: {
    fontSize: 11,
    color: "#ccc",
    marginTop: 10,
    fontWeight: "bold",
    right: 25,
  },
  startSleepingBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#3f78ff",
    borderRadius: 30,
    paddingVertical: 15,
    paddingHorizontal: 30,
    alignSelf: "center",
    gap: 8,
  },
  sleepingIcon: {
    width: 18,
    height: 18,
  },
  startSleepingText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
  },
});

export default HomeScreen;
