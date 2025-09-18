// src/screens/HomeScreen.tsx
import { Feather } from "@expo/vector-icons";
import React, { useState, useEffect } from "react";
import { auth, db } from "../../services/firebase"; // Firebase 설정 파일 경로
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import WeekChart from "../../components/WeekChart";

const { width } = Dimensions.get("window");

function HomeScreen({ navigation }: { navigation: any }) {
  const [username, setUsername] = useState("사용자"); // 기본값
  const [loading, setLoading] = useState(true);
  const [weekData, setWeekData] = useState([]);

  // 이번 주 날짜 계산 함수
  const getThisWeekDates = () => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0(일요일) ~ 6(토요일)
    const monday = new Date(today);
    monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1)); // 월요일로 설정

    const weekDates = [];
    const dayNames = ["월", "화", "수", "목", "금", "토", "일"];

    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      weekDates.push({
        date: date.toISOString().split("T")[0], // YYYY-MM-DD 형식
        dayName: dayNames[i],
        data: null, // 초기값
      });
    }

    return weekDates;
  };

  // Firebase에서 수면 데이터 가져오기
  const fetchWeekSleepData = async (userId: string) => {
    try {
      const weekDates = getThisWeekDates();
      const updatedWeekData = [];

      for (const dayInfo of weekDates) {
        try {
          // 해당 날짜의 수면 데이터 조회
          const sleepQuery = query(
            collection(db, "sleepRecords"),
            where("userId", "==", userId),
            where("date", "==", dayInfo.date)
          );

          const querySnapshot = await getDocs(sleepQuery);

          if (!querySnapshot.empty) {
            const sleepData = querySnapshot.docs[0].data();
            updatedWeekData.push({
              ...dayInfo,
              data: {
                score: sleepData.sleepScore || 0, // 수면 점수
                duration: sleepData.sleepDuration || 0, // 수면 시간
              },
            });
          } else {
            // 데이터가 없는 경우
            updatedWeekData.push({
              ...dayInfo,
              data: null,
            });
          }
        } catch (error) {
          console.error(`${dayInfo.date} 데이터 조회 오류:`, error);
          updatedWeekData.push({
            ...dayInfo,
            data: null,
          });
        }
      }

      setWeekData(updatedWeekData);
    } catch (error) {
      console.error("주간 수면 데이터 조회 오류:", error);
      // 오류 발생 시 빈 데이터로 설정
      setWeekData(getThisWeekDates());
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Firestore에서 사용자 정보 가져오기
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUsername(userData.username || "사용자");
          }

          // 주간 수면 데이터 가져오기
          await fetchWeekSleepData(user.uid);
        } catch (error) {
          console.error("사용자 정보를 가져오는 중 오류:", error);
          setUsername("사용자");
          // 오류 발생 시에도 빈 차트 표시
          setWeekData(getThisWeekDates());
        }
      } else {
        // 로그인되지 않은 경우 빈 데이터
        setWeekData(getThisWeekDates());
      }
      setLoading(false);
    });

    // 컴포넌트 언마운트 시 리스너 정리
    return () => unsubscribe();
  }, [navigation]);

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

        <View style={styles.weekly}>
          <Text style={styles.weeklyText}>weekly report</Text>
          <TouchableOpacity>
            <Text
              style={styles.seeMore}
              onPress={() => {
                const today = new Date().toISOString().split("T")[0];
                navigation.navigate("SleepReport", { initialDate: today });
              }}
            >
              더보기 &gt;
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.chartBox}>
          <WeekChart weekData={weekData} />
        </View>

        <View style={styles.cardContainer}>
          <TouchableOpacity
            style={[styles.card, styles.purple]}
            onPress={() => navigation.navigate("SleepSchedule")}
          >
            <Image
              source={require("../../../assets/alramOwl.png")}
              style={styles.cardIllustration}
            />
            <Text style={styles.cardTitle}>스케줄설정</Text>
            <Text style={styles.cardSubtitle}>SCHEDULE</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.card, styles.orange]}
            onPress={() => navigation.navigate("Music")}
          >
            <Image
              source={require("../../../assets/soundOwl.png")}
              style={styles.cardIllustration}
            />
            <Text style={styles.cardTitleT}>사운드</Text>
            <Text style={styles.cardSubtitleT}>MUSIC</Text>
          </TouchableOpacity>
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
          onPress={() => navigation.navigate("Bubble")}
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
    marginBottom: 30,
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
  seeMore: {
    color: "#aaa",
    fontSize: 12,
  },
  chartBox: {
    backgroundColor: "#1D1B20",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    minHeight: 200,
  },
  barChartPlaceholder: {
    color: "#777",
    fontSize: 12,
  },
  cardContainer: {
    flexDirection: "row",
    gap: 20,
    justifyContent: "space-between",
    marginBottom: 20,
  },
  card: {
    flex: 1,
    borderRadius: 16,
    padding: 12,
    height: 200,
    position: "relative",
  },
  purple: {
    backgroundColor: "#7593CE",
  },
  orange: {
    backgroundColor: "#B8D0FF",
  },
  cardIllustration: {
    width: 77,
    height: 77,
    position: "absolute",
    top: 16,
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
