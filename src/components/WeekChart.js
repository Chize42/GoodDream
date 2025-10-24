import React from "react";
import { View, Text, StyleSheet } from "react-native";
import * as GlobalStyles from "../styles/globalStyles";

const { colors, spacing, typography } = GlobalStyles;

const WeekChart = ({ weekData }) => {
  const chartHeight = 100; // 차트 높이

  const calculateScore = (data) => {
    if (!data) return 0;

    // 👇 score가 있으면 그대로 사용
    if (data.score !== undefined && data.score !== null && data.score > 0) {
      return data.score;
    }

    // 👇 duration으로 계산
    if (data.duration && data.duration > 0) {
      const sleepHours = data.duration / 60;

      if (sleepHours >= 7 && sleepHours <= 9) {
        const deviation = Math.abs(sleepHours - 8);
        return Math.round(100 - deviation * 10);
      } else if (sleepHours >= 6 && sleepHours <= 10) {
        const deviation = sleepHours < 7 ? 7 - sleepHours : sleepHours - 9;
        return Math.round(80 - deviation * 20);
      } else if (sleepHours >= 5 && sleepHours <= 11) {
        const deviation = sleepHours < 6 ? 6 - sleepHours : sleepHours - 10;
        return Math.round(60 - deviation * 20);
      } else if (sleepHours >= 4 && sleepHours <= 12) {
        const deviation = sleepHours < 5 ? 5 - sleepHours : sleepHours - 11;
        return Math.round(40 - deviation * 20);
      } else {
        const deviation = sleepHours < 4 ? 4 - sleepHours : sleepHours - 12;
        return Math.max(0, Math.round(20 - deviation * 5));
      }
    }

    // 👇 deep, light, rem으로 계산 (기존 더미 데이터)
    if ((data.deep || 0) + (data.light || 0) + (data.rem || 0) > 0) {
      const totalSleep = (data.deep || 0) + (data.light || 0) + (data.rem || 0);
      const sleepHours = totalSleep;

      if (sleepHours >= 7 && sleepHours <= 9) {
        const deviation = Math.abs(sleepHours - 8);
        return Math.round(100 - deviation * 10);
      } else if (sleepHours >= 6 && sleepHours <= 10) {
        const deviation = sleepHours < 7 ? 7 - sleepHours : sleepHours - 9;
        return Math.round(80 - deviation * 20);
      } else if (sleepHours >= 5 && sleepHours <= 11) {
        const deviation = sleepHours < 6 ? 6 - sleepHours : sleepHours - 10;
        return Math.round(60 - deviation * 20);
      } else if (sleepHours >= 4 && sleepHours <= 12) {
        const deviation = sleepHours < 5 ? 5 - sleepHours : sleepHours - 11;
        return Math.round(40 - deviation * 20);
      } else {
        const deviation = sleepHours < 4 ? 4 - sleepHours : sleepHours - 12;
        return Math.max(0, Math.round(20 - deviation * 5));
      }
    }

    return 0;
  };

  return (
    <View style={styles.container}>
      {/* 차트 영역 */}
      <View style={styles.barChart}>
        {weekData.map((day, index) => {
          const score = calculateScore(day.data);

          console.log(`${day.dayName} - score: ${score}, data:`, day.data); // 👈 디버깅용

          return (
            <View key={index} style={styles.barContainer}>
              {day.data && score > 0 ? (
                <View
                  style={[
                    styles.bar,
                    {
                      height: Math.max((score / 100) * chartHeight, 4),
                    },
                  ]}
                />
              ) : (
                <View style={styles.noDataBar} />
              )}
            </View>
          );
        })}
      </View>

      {/* X축 레이블 (요일) */}
      <View style={styles.xAxisContainer}>
        {weekData.map((day, index) => (
          <View key={index} style={styles.dayLabelContainer}>
            <Text style={styles.dayLabel}>{day.dayName}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: spacing.lg,
  },
  barChart: {
    flexDirection: "row",
    alignItems: "flex-end",
    height: 120,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  barContainer: {
    flex: 1,
    height: "100%",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  bar: {
    width: 24, // 👈 막대 너비 조금 늘림
    backgroundColor: colors.primary,
    borderRadius: 4,
    minHeight: 4,
  },
  noDataBar: {
    width: 24,
    height: 4,
    backgroundColor: colors.textMuted,
    borderRadius: 2,
    opacity: 0.3,
  },
  xAxisContainer: {
    flexDirection: "row",
    paddingHorizontal: spacing.md,
  },
  dayLabelContainer: {
    flex: 1,
    alignItems: "center",
  },
  dayLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 12,
  },
});

export default WeekChart;
