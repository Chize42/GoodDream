import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../contexts/AuthContext";
import { getSleepData, saveSleepData } from "../../services/sleepService";

const formatDuration = (ms) => {
  if (ms === undefined || ms === null || ms < 0) {
    return "00h 00m";
  }

  const totalMinutes = Math.floor(ms / (1000 * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  const formattedHours = String(hours).padStart(2, "0");
  const formattedMinutes = String(minutes).padStart(2, "0");

  return `${formattedHours}h ${formattedMinutes}m`;
};

const Dismiss = ({ navigation, route }) => {
  const { user } = useAuth();
  const { durationMs, startTime } = route.params;
  const sleepDuration = formatDuration(durationMs);
  const [isSaving, setIsSaving] = useState(false);

  // 컴포넌트 마운트 시 자동으로 수면 데이터 저장
  useEffect(() => {
    console.log("🎯 Dismiss 화면 마운트됨");
    console.log("📦 받은 데이터:", { durationMs, startTime });

    if (startTime) {
      saveSleepRecord();
    } else {
      console.log("❌ startTime이 없습니다!");
    }
  }, []);

  const saveSleepRecord = async () => {
    console.log("🚀 saveSleepRecord 함수 시작");

    try {
      console.log("👤 user 상태:", user);

      if (!user?.uid) {
        console.log("❌ 로그인 상태가 아닙니다");
        Alert.alert("오류", "로그인이 필요합니다.");
        return;
      }

      console.log("✅ 사용자 확인:", user.uid);

      if (!durationMs || durationMs < 0) {
        console.log("❌ 유효하지 않은 수면 시간:", durationMs);
        Alert.alert("오류", "유효하지 않은 수면 시간입니다.");
        return;
      }

      console.log("✅ 수면 시간 확인:", durationMs, "ms");

      if (!startTime) {
        console.log("❌ startTime이 없습니다!");
        Alert.alert("오류", "시작 시간 정보가 없습니다.");
        return;
      }

      console.log("✅ 시작 시간 확인:", startTime);

      setIsSaving(true);

      // 수면 시작 시간으로 날짜 결정
      const sleepStartTime = new Date(startTime);
      const sleepDate = sleepStartTime.toISOString().split("T")[0];

      console.log("💾 수면 기록 저장 시작:", {
        userId: user.uid,
        date: sleepDate,
        durationMs,
      });

      // 기존 데이터 확인
      const existingDataResult = await getSleepData(user.uid, sleepDate);
      const existingData = existingDataResult?.data;

      const durationMinutes = Math.floor(durationMs / (1000 * 60));
      const endTime = new Date();

      // HH:MM 형식으로 시간 추출
      const bedTimeStr = sleepStartTime.toTimeString().slice(0, 5);
      const wakeTimeStr = endTime.toTimeString().slice(0, 5);

      if (existingData && existingData.bedTime && existingData.wakeTime) {
        // ✅ 기존 데이터가 있으면 duration만 누적
        console.log("📊 기존 데이터 발견 - duration 누적");

        const existingDuration = existingData.duration || 0;
        const totalDuration = existingDuration + durationMinutes;

        // ✅ 각 수면의 시작/종료 시간은 최신 것으로 업데이트
        // duration은 누적된 총 수면 시간
        const updatedSleepData = {
          date: sleepDate,
          bedTime: bedTimeStr, // ✅ 최신 취침 시간
          wakeTime: wakeTimeStr, // ✅ 최신 기상 시간
          duration: totalDuration, // ✅ 누적된 총 수면 시간 (분)
          bedTimeISO: sleepStartTime.toISOString(),
          wakeTimeISO: endTime.toISOString(),
          source: "app_tracking",
          isManualEntry: false,
          lastModified: new Date().toISOString(),
        };

        await saveSleepData(user.uid, updatedSleepData);

        console.log("✅ Duration 누적 저장 완료:", {
          이전_수면시간: `${existingDuration}분`,
          이번_수면시간: `${durationMinutes}분`,
          누적_총시간: `${totalDuration}분`,
        });
      } else {
        // ✅ 첫 수면 기록
        console.log("🆕 새로운 수면 기록 생성");

        const newSleepData = {
          date: sleepDate,
          bedTime: bedTimeStr,
          wakeTime: wakeTimeStr,
          duration: durationMinutes,
          bedTimeISO: sleepStartTime.toISOString(),
          wakeTimeISO: endTime.toISOString(),
          source: "app_tracking",
          isManualEntry: false,
          lastModified: new Date().toISOString(),
        };

        await saveSleepData(user.uid, newSleepData);

        console.log("✅ 새 기록 저장 완료:", {
          수면시간: `${durationMinutes}분`,
        });
      }
    } catch (error) {
      console.error("❌ 수면 기록 저장 오류:", error);
      Alert.alert("오류", "수면 기록 저장에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDismiss = () => {
    // 수면 리포트로 이동하면서 저장된 날짜 전달
    const sleepStartTime = new Date(startTime);
    const sleepDate = sleepStartTime.toISOString().split("T")[0];

    navigation.reset({
      index: 0,
      routes: [
        { name: "Home" },
        {
          name: "SleepReport",
          params: {
            initialDate: sleepDate,
            refresh: true,
          },
        },
      ],
    });
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* 뒤로가기 버튼 */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate("Home")}
        >
          <Ionicons name="chevron-back" size={24} color="#fff" marginTop={30} />
        </TouchableOpacity>

        <View style={styles.content}>
          {/* 깨어있는 부엉이 이미지 */}
          <Image
            source={require("../../../assets/images/wakeup-Owl.png")}
            style={styles.owlImage}
          />

          {/* Wake-up. It's time! 문구 */}
          <Text style={styles.wakeUpTitle}>Wake-up. It's time!</Text>

          {/* 수면 시간 표시 */}
          <View style={styles.statsCard}>
            <View style={styles.statItem}>
              <View style={styles.statHeader}>
                <Image
                  source={require("../../../assets/images/sleep.png")}
                  style={styles.statIcon}
                />
                <Text style={styles.statLabel}>Sleep</Text>
              </View>
              <Text style={styles.statValue}>{sleepDuration}</Text>
            </View>
          </View>

          {/* 저장 중 표시 */}
          {isSaving && (
            <View style={styles.savingIndicator}>
              <ActivityIndicator size="small" color="#3b82f6" />
              <Text style={styles.savingText}>기록 저장 중...</Text>
            </View>
          )}
        </View>

        {/* Dismiss 버튼 */}
        <TouchableOpacity style={styles.dismissButton} onPress={handleDismiss}>
          <Text style={styles.dismissButtonText}>Dismiss</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#2E2217",
  },
  safeArea: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
  },
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
    width: 120,
    height: 120,
    resizeMode: "contain",
    marginBottom: 30,
  },
  wakeUpTitle: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 40,
  },
  statsCard: {
    flexDirection: "row",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    borderRadius: 20,
    padding: 20,
    width: "85%",
    alignItems: "center",
    justifyContent: "space-around",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  statIcon: {
    width: 16,
    height: 16,
    marginRight: 8,
    tintColor: "#A9A9A9",
  },
  statLabel: {
    color: "#A9A9A9",
    fontSize: 16,
  },
  statValue: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
  },
  savingIndicator: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    gap: 8,
  },
  savingText: {
    color: "#3b82f6",
    fontSize: 14,
  },
  dismissButton: {
    backgroundColor: "#3b82f6",
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: "center",
    width: "85%",
    marginBottom: 40,
  },
  dismissButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default Dismiss;
