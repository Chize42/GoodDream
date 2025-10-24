// src/screens/SleepDetailScreen.js
import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import CircularProgress from "../../components/CircularProgress";
import SleepFeedback from "../../components/SleepFeedback";
import { colors, typography, spacing } from "../../styles/globalStyles";

const SleepDetailScreen = ({ navigation, route }) => {
  const { sleepData, date } = route.params;

  // 👇 실제 수면 시간 계산 (duration 우선 사용)
  const calculateActualSleep = () => {
    // 수면 단계 데이터가 있으면 합산
    if (
      (sleepData.deep || 0) + (sleepData.light || 0) + (sleepData.rem || 0) >
      0
    ) {
      return (
        (sleepData.deep || 0) + (sleepData.light || 0) + (sleepData.rem || 0)
      );
    }

    // Health Connect duration이 있으면 사용 (분 → 시간)
    if (sleepData.duration && sleepData.duration > 0) {
      return sleepData.duration / 60;
    }

    // 둘 다 없으면 0
    return 0;
  };

  const actualSleepTime = calculateActualSleep();

  // 👇 총 침대 시간 (실제 수면 + 깸)
  const totalBedTime = actualSleepTime + (sleepData.awake || 0);

  // 안전한 데이터 처리
  const safeData = {
    deep: sleepData.deep || 0,
    light: sleepData.light || 0,
    rem: sleepData.rem || 0,
    awake: sleepData.awake || 0,
    score: sleepData.score || 0,
    bedTime: sleepData.bedTime || "23:00",
    wakeTime: sleepData.wakeTime || "07:00",
    actualSleep: actualSleepTime, // 👈 계산된 값
    totalSleepDuration: totalBedTime, // 👈 계산된 값
  };

  // 날짜 포맷팅
  const formatDate = (dateString) => {
    const date = new Date(dateString + "T00:00:00");
    const year = String(date.getFullYear()).slice(2);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}년${month}월${day}일`;
  };

  // 시간 포맷팅
  const formatTime = (timeStr) => {
    const [hour, minute] = timeStr.split(":");
    const hourInt = parseInt(hour);
    const period = hourInt >= 12 ? "PM" : "AM";
    const displayHour =
      hourInt === 0 ? 12 : hourInt > 12 ? hourInt - 12 : hourInt;
    return `${String(displayHour).padStart(2, "0")}h ${minute}m`;
  };

  // 시간을 시간과 분으로 변환하는 함수
  const formatDuration = (hours) => {
    const safeHours = hours || 0;
    const h = Math.floor(safeHours);
    const m = Math.round((safeHours % 1) * 60);
    return { hours: h, minutes: m };
  };

  // 수면 단계 데이터
  const sleepStages = [
    {
      key: "deep",
      label: "깊은잠",
      value: safeData.deep,
      color: "#4074D8",
    },
    {
      key: "light",
      label: "얕은잠",
      value: safeData.light,
      color: "#F2F2F2",
    },
    {
      key: "rem",
      label: "렘수면",
      value: safeData.rem,
      color: "#9DB7EA",
    },
    {
      key: "awake",
      label: "깸",
      value: safeData.awake,
      color: "#272638",
    },
  ];

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>수면 효율 세부화면</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 날짜 */}
        <View style={styles.dateContainer}>
          <Text style={styles.dateText}>{formatDate(date)}</Text>
          <Text style={styles.dateSubtext}>수면 효율</Text>
        </View>

        {/* 메인 차트 */}
        <View style={styles.chartContainer}>
          <CircularProgress
            score={safeData.score}
            sleepData={safeData}
            size={200}
          />
        </View>

        {/* 수면 단계 블록들 */}
        <View style={styles.stagesRowContainer}>
          {sleepStages.map((stage, index) => {
            const duration = formatDuration(stage.value);
            return (
              <View key={index} style={styles.stageBlock}>
                <View style={styles.stageBlockHeader}>
                  <View
                    style={[
                      styles.stageColorDot,
                      { backgroundColor: stage.color },
                    ]}
                  />
                  <Text style={styles.stageBlockLabel}>{stage.label}</Text>
                </View>
                <Text style={styles.stageBlockTime}>
                  {duration.hours}h {duration.minutes}min
                </Text>
              </View>
            );
          })}
        </View>

        {/* 수면 시간 정보 */}
        <View style={styles.infoSection}>
          <View style={styles.infoItem}>
            <View style={styles.infoIconContainer}>
              <Ionicons name="moon-outline" size={24} color="#fff" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoTime}>
                {formatTime(safeData.bedTime)}
              </Text>
              <Text style={styles.infoLabel}>수면 시작 시간</Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <View style={styles.infoIconContainer}>
              <Ionicons name="hourglass-outline" size={24} color="#fff" />
            </View>
            <View style={styles.infoContent}>
              <View style={styles.timeRow}>
                <Text style={styles.infoTime}>
                  {safeData.actualSleep.toFixed(1)}h
                </Text>
                <Text style={styles.totalSleepTime}>
                  /{safeData.totalSleepDuration.toFixed(1)}h
                </Text>
              </View>
              <Text style={styles.infoLabel}>실수면시간</Text>
            </View>
          </View>
        </View>

        {/* 수면 비교 정보 */}
        <View style={styles.infoSection}>
          <View style={styles.infoItem}>
            <View style={styles.infoIconContainer}>
              <Ionicons
                name="checkmark-circle-outline"
                size={24}
                color="#fff"
              />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoTime}>
                {safeData.actualSleep > 0
                  ? Math.round((safeData.actualSleep / 8) * 100)
                  : 0}
                %
              </Text>
              <Text style={styles.infoLabel}>권장수면량</Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <View style={styles.infoIconContainer}>
              <Ionicons name="analytics-outline" size={24} color="#fff" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoTime}>
                {safeData.actualSleep > 0
                  ? Math.round((safeData.actualSleep / 7.2) * 100)
                  : 0}
                %
              </Text>
              <Text style={styles.infoLabel}>내 평균 수면량</Text>
            </View>
          </View>
        </View>

        {/* 수면 피드백 컴포넌트 */}
        <SleepFeedback sleepData={safeData} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 50,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  dateContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  dateText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  dateSubtext: {
    color: colors.textSecondary,
    fontSize: 16,
  },
  chartContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  stagesRowContainer: {
    flexDirection: "row",
    paddingHorizontal: 12,
    marginBottom: 32,
    justifyContent: "space-around",
  },
  stageBlock: {
    alignItems: "center",
    paddingHorizontal: 2,
    minWidth: 70,
  },
  stageBlockHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  stageColorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  stageBlockLabel: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: "500",
    textAlign: "center",
  },
  stageBlockTime: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },
  infoSection: {
    flexDirection: "row",
    paddingHorizontal: 32,
    marginBottom: 24,
    justifyContent: "center",
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    width: 140,
    marginHorizontal: 12,
  },
  infoIconContainer: {
    marginRight: 12,
    width: 24,
    alignItems: "center",
  },
  infoContent: {
    flex: 1,
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 2,
  },
  infoTime: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  totalSleepTime: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: "normal",
    marginLeft: 2,
  },
  infoLabel: {
    color: colors.textSecondary,
    fontSize: 12,
  },
});

export default SleepDetailScreen;
