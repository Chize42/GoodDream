// src/components/WeekChart.js
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, typography } from "../styles/globalStyles";

const WeekChart = ({ weekData }) => {
  const yAxisLabels = [100, 90, 80, 70, 60]; // 위에서 아래로
  const chartHeight = 100; // 차트 높이

  return (
    <View style={styles.container}>
      <View style={styles.chartContainer}>
        {/* Y축 레이블 (세로축) */}
        <View style={styles.yAxisContainer}>
          {yAxisLabels.map((label, index) => (
            <View key={index} style={styles.yAxisLabelContainer}>
              <Text style={styles.yAxisLabel}>{label}%</Text>
            </View>
          ))}
        </View>

        {/* 차트 영역 */}
        <View style={styles.chartArea}>
          {/* 격자선 (선택사항) */}
          <View style={styles.gridLines}>
            {yAxisLabels.map((_, index) => (
              <View key={index} style={styles.gridLine} />
            ))}
          </View>

          {/* 바 차트 */}
          <View style={styles.barChart}>
            {weekData.map((day, index) => (
              <View key={index} style={styles.barContainer}>
                <View style={styles.barWrapper}>
                  {day.data ? (
                    <View
                      style={[
                        styles.bar,
                        {
                          height: Math.max(
                            (day.data.score / 100) * chartHeight,
                            4
                          ), // 최소 높이 4
                        },
                      ]}
                    />
                  ) : (
                    <View style={styles.noDataBar} />
                  )}
                </View>
              </View>
            ))}
          </View>
        </View>
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
    paddingTop: 16,
  },
  chartContainer: {
    flexDirection: "row",
    height: 120,
    marginBottom: 12,
  },
  yAxisContainer: {
    width: 40,
    justifyContent: "space-between",
    paddingRight: 8,
  },
  yAxisLabelContainer: {
    height: 20,
    justifyContent: "center",
  },
  yAxisLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: "right",
    fontSize: 11,
  },
  chartArea: {
    flex: 1,
    position: "relative",
  },
  gridLines: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "space-between",
  },
  gridLine: {
    height: 1,
    backgroundColor: colors.textMuted,
    opacity: 0.2,
  },
  barChart: {
    flexDirection: "row",
    alignItems: "flex-end",
    height: "100%",
    paddingHorizontal: 4,
  },
  barContainer: {
    flex: 1,
    alignItems: "center",
    height: "100%",
  },
  barWrapper: {
    height: "100%",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: 2,
  },
  bar: {
    width: 20,
    backgroundColor: colors.primary,
    borderRadius: 3,
    minHeight: 4,
  },
  noDataBar: {
    width: 20,
    height: 4,
    backgroundColor: colors.textMuted,
    borderRadius: 2,
    opacity: 0.5,
  },
  xAxisContainer: {
    flexDirection: "row",
    paddingLeft: 40, // Y축 공간만큼 왼쪽 여백
  },
  dayLabelContainer: {
    flex: 1,
    alignItems: "center",
  },
  dayLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});

export default WeekChart;
