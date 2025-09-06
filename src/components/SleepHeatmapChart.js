// src/components/SleepHeatmapChart.js
import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { colors, typography } from "../styles/globalStyles";

const SleepHeatmapChart = ({ weekData }) => {
  const totalHours = 24;
  const segmentWidth = 3; // 4에서 3으로 변경해서 96 * 3 = 288
  const chartHeight = 40;

  // 디버깅을 위한 로그
  React.useEffect(() => {
    console.log(
      "SleepHeatmapChart (8PM-8PM) - weekData:",
      weekData.map((day) => ({
        dayName: day.dayName,
        date: day.date,
        bedTime: day.data?.bedTime,
        wakeTime: day.data?.wakeTime,
      }))
    );
  }, [weekData]);

  // 시간을 분으로 변환
  const timeToMinutes = (timeStr) => {
    const [hour, minute] = timeStr.split(":").map(Number);
    return hour * 60 + minute;
  };

  // 수면 시간 세그먼트 배열 생성 (밤 8시부터 시작하는 24시간)
  const createSleepSegments = () => {
    const segments = new Array(96).fill(0); // 15분 단위로 96개 구간

    weekData.forEach((day) => {
      if (day.data && day.data.bedTime && day.data.wakeTime) {
        const bedTimeMinutes = timeToMinutes(day.data.bedTime);
        const wakeTimeMinutes = timeToMinutes(day.data.wakeTime);

        // 밤 8시(20:00)를 시작점(0)으로 하는 시간 변환
        const adjustTime = (minutes) => {
          const adjusted = minutes - 20 * 60; // 20:00를 0으로 만들기
          return adjusted < 0 ? adjusted + 24 * 60 : adjusted; // 음수면 다음날로
        };

        const adjustedBedTime = adjustTime(bedTimeMinutes);
        const adjustedWakeTime = adjustTime(wakeTimeMinutes);

        let currentMinutes = adjustedBedTime;
        let iterations = 0;

        while (iterations < 96) {
          // 15분 단위 구간 인덱스 계산
          const segmentIndex = Math.floor((currentMinutes % (24 * 60)) / 15);
          if (segmentIndex >= 0 && segmentIndex < 96) {
            segments[segmentIndex]++;
          }

          currentMinutes += 15;
          iterations++;

          // 기상 시간 체크
          const normalizedCurrent = currentMinutes % (24 * 60);

          // 기상 시간에 도달하면 종료
          if (adjustedWakeTime > adjustedBedTime) {
            // 같은 "날" 내에서 자고 일어나는 경우 (20시~다음날20시 기준)
            if (normalizedCurrent >= adjustedWakeTime) {
              break;
            }
          } else {
            // 다음 "날"로 넘어가서 일어나는 경우
            if (
              currentMinutes >= 24 * 60 &&
              normalizedCurrent >= adjustedWakeTime
            ) {
              break;
            }
          }
        }
      }
    });

    return segments;
  };

  const sleepSegments = createSleepSegments();
  const maxOverlap = Math.max(...sleepSegments, 1);

  // 색상 강도 계산 (다른 차트와 동일한 파란색 사용)
  const getIntensityColor = (count) => {
    if (count === 0) return "transparent";
    const intensity = count / maxOverlap;

    // colors.blue 또는 colors.primary의 실제 hex 값 사용
    const baseColor = colors.blue || colors.primary || "#6366F1"; // 기본값으로 fallback

    // hex를 rgb로 변환
    const hex = baseColor.replace("#", "");
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    const alpha = Math.min(0.3 + intensity * 0.7, 1.0);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  // 시간 레이블 생성 (정확한 24시간 간격)
  const timeLabels = [
    { hour: 0, label: "8pm", originalHour: 20 }, // 0시간 (0px)
    { hour: 6, label: "2am", originalHour: 2 }, // 6시간 (72px)
    { hour: 12, label: "8am", originalHour: 8 }, // 12시간 (144px)
    { hour: 18, label: "2pm", originalHour: 14 }, // 18시간 (216px)
    { hour: 23.9, label: "8pm", originalHour: 20 }, // 거의 24시간 (287px)
  ];

  // 시간별 구분선 위치 계산 (정확한 픽셀 위치)
  const getHourPosition = (hour) => {
    return hour * segmentWidth * 4; // 시간당 4개 세그먼트 * 3px = 12px per hour
  };

  return (
    <View style={styles.container}>
      {/* 24시간 히트맵 - 스크롤 가능 */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.heatmapScrollContainer}
        contentContainerStyle={styles.heatmapScrollContent}
      >
        <View style={styles.heatmapContainer}>
          <View style={styles.heatmap}>
            {sleepSegments.map((count, index) => {
              return (
                <View
                  key={index}
                  style={[
                    styles.segment,
                    {
                      backgroundColor: getIntensityColor(count),
                      width: segmentWidth,
                    },
                  ]}
                />
              );
            })}
          </View>

          {/* 시간 구분선 - 6시간 간격만 표시 */}
          <View style={styles.hourLines}>
            {timeLabels.map((timeLabel, index) => (
              <View
                key={index}
                style={[
                  styles.hourLine,
                  {
                    left: getHourPosition(timeLabel.hour),
                    borderLeftWidth: 2,
                    opacity: 0.5,
                  },
                ]}
              />
            ))}
          </View>
        </View>
      </ScrollView>

      {/* 시간 레이블 - 스크롤 가능 */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.timeLabelsScrollContainer}
        contentContainerStyle={styles.timeLabelsScrollContent}
      >
        <View style={[styles.timeLabelsContainer, { width: 96 * 3 }]}>
          {timeLabels.map((timeLabel, index) => (
            <View
              key={index}
              style={[
                styles.timeLabelContainer,
                { left: getHourPosition(timeLabel.hour) },
              ]}
            >
              <Text style={styles.timeLabel}>{timeLabel.label}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 16,
  },
  heatmapScrollContainer: {
    marginBottom: 12,
  },
  heatmapScrollContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
  heatmapContainer: {
    position: "relative",
  },
  heatmap: {
    flexDirection: "row",
    height: 40,
    backgroundColor: colors.surface,
    borderRadius: 6,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.textMuted,
    opacity: 0.3,
    width: 96 * 3, // 96개 세그먼트 * 3px = 288px (정확히)
  },
  segment: {
    height: "100%",
  },
  hourLines: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  hourLine: {
    position: "absolute",
    top: 0,
    bottom: 0,
    borderLeftColor: colors.textMuted,
  },
  timeLabelsScrollContainer: {
    marginBottom: 16,
  },
  timeLabelsScrollContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
  timeLabelsContainer: {
    position: "relative",
    height: 20,
  },
  timeLabelContainer: {
    position: "absolute",
    top: 0,
  },
  timeLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 10,
    transform: [{ translateX: -15 }], // 중앙 정렬
  },
  legendContainer: {
    alignItems: "center",
    marginTop: 8,
  },
  legendTitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: 6,
    fontWeight: "500",
  },
  legendBar: {
    flexDirection: "row",
    width: 100,
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 4,
  },
  legendSegment: {
    flex: 1,
  },
  legendLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: 100,
  },
  legendText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 9,
  },
});

export default SleepHeatmapChart;
