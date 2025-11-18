// src/components/SleepStageChart.js
import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import Svg, { Rect, Text as SvgText, Line } from "react-native-svg";
import { colors, typography } from "../styles/globalStyles";

const SleepStageChart = ({ sleepData }) => {
  // 👇 화면 너비 가져오기
  const screenWidth = Dimensions.get("window").width;

  // 👇 반응형 차트 너비 계산 (패딩 고려)
  const chartWidth = Math.min(screenWidth - 40, 800); // 최대 800px, 최소 양쪽 20px 패딩
  const chartHeight = 160;
  const padding = { top: 20, right: 40, bottom: 30, left: 60 };

  // 수면 데이터가 없거나 stages가 없는 경우 처리
  if (!sleepData || !sleepData.stages || sleepData.stages.length === 0) {
    return (
      <View style={styles.noDataContainer}>
        <Text style={styles.noDataText}>수면 단계 데이터가 없습니다</Text>
      </View>
    );
  }

  // 수면 단계 정의
  const sleepStages = [
    { key: "awake", label: "깸", color: "#FFFFFF" },
    { key: "light", label: "얕은잠", color: colors.blue },
    { key: "deep", label: "깊은잠", color: colors.purple },
    { key: "rem", label: "렘수면", color: colors.indigo },
  ];

  // Health Connect stage 숫자 코드를 문자열로 매핑
  const mapStageToString = (stageCode) => {
    switch (stageCode) {
      case 5:
        return "deep";
      case 4:
        return "light";
      case 6:
        return "rem";
      case 1:
      case 7:
        return "awake";
      case 2:
      case 8:
        return "light";
      default:
        return "light";
    }
  };

  // 실제 수면 패턴 데이터 생성
  const generateRealSleepPattern = () => {
    const pattern = [];

    const bedTime = sleepData.bedTimeISO || sleepData.bedTime;
    const wakeTime = sleepData.wakeTimeISO || sleepData.wakeTime;

    const bedDate = new Date(bedTime);
    const wakeDate = new Date(wakeTime);

    let chartStartTime = new Date(bedDate);
    chartStartTime.setHours(chartStartTime.getHours() - 2);
    chartStartTime.setMinutes(0);
    chartStartTime.setSeconds(0);

    let chartEndTime = new Date(wakeDate);
    chartEndTime.setHours(chartEndTime.getHours() + 2);
    chartEndTime.setMinutes(0);
    chartEndTime.setSeconds(0);

    const totalChartDuration = chartEndTime - chartStartTime;
    const segmentDuration = 15 * 60 * 1000;
    const totalSegments = Math.ceil(totalChartDuration / segmentDuration);

    for (let i = 0; i < totalSegments; i++) {
      const segmentStart = new Date(
        chartStartTime.getTime() + i * segmentDuration
      );
      const segmentEnd = new Date(segmentStart.getTime() + segmentDuration);
      const segmentMiddle = new Date(
        (segmentStart.getTime() + segmentEnd.getTime()) / 2
      );

      let stage = "awake";

      for (const stageData of sleepData.stages) {
        const stageStart = new Date(stageData.startTime);
        const stageEnd = new Date(stageData.endTime);

        if (segmentMiddle >= stageStart && segmentMiddle < stageEnd) {
          stage = mapStageToString(stageData.stage);
          break;
        }
      }

      const hoursFromStart = (segmentStart - chartStartTime) / (1000 * 60 * 60);

      pattern.push({
        hour: hoursFromStart,
        stage: stage,
        segmentIndex: i,
        timestamp: segmentStart,
      });
    }

    return {
      pattern,
      totalHours: totalChartDuration / (1000 * 60 * 60),
      chartStartTime,
    };
  };

  const {
    pattern: sleepPattern,
    totalHours,
    chartStartTime,
  } = generateRealSleepPattern();

  // 시간 레이블 생성 (실제 시간 기반)
  const generateTimeLabels = () => {
    const labels = [];
    const labelInterval = Math.ceil(totalHours / 8);

    for (let i = 0; i <= Math.ceil(totalHours); i += labelInterval) {
      const labelTime = new Date(chartStartTime.getTime() + i * 60 * 60 * 1000);
      const hours = labelTime.getHours();
      const period = hours >= 12 ? "pm" : "am";
      const displayHours = hours % 12 || 12;

      labels.push({
        hour: i,
        label: `${displayHours}${period}`,
      });
    }

    return labels;
  };

  const timeLabels = generateTimeLabels();

  // 차트 내 좌표 계산
  const getXPosition = (hour) => {
    return (
      padding.left +
      (hour / totalHours) * (chartWidth - padding.left - padding.right)
    );
  };

  const getYPosition = (stageIndex) => {
    const stageHeight =
      (chartHeight - padding.top - padding.bottom) / sleepStages.length;
    return padding.top + stageIndex * stageHeight;
  };

  const getStageIndex = (stage) => {
    return sleepStages.findIndex((s) => s.key === stage);
  };

  // 세그먼트 너비 계산
  const segmentWidth =
    (chartWidth - padding.left - padding.right) / sleepPattern.length;

  return (
    <View style={styles.container}>
      <Svg width={chartWidth} height={chartHeight}>
        {/* 배경 격자선 */}
        {timeLabels.map((timeLabel, index) => (
          <Line
            key={`grid-${index}`}
            x1={getXPosition(timeLabel.hour)}
            y1={padding.top}
            x2={getXPosition(timeLabel.hour)}
            y2={chartHeight - padding.bottom}
            stroke={colors.textMuted}
            strokeWidth="0.5"
            strokeDasharray="2,2"
            opacity={0.3}
          />
        ))}

        {/* 수면 단계별 구분선 */}
        {sleepStages.map((_, index) => (
          <Line
            key={`stage-line-${index}`}
            x1={padding.left}
            y1={getYPosition(index)}
            x2={chartWidth - padding.right}
            y2={getYPosition(index)}
            stroke={colors.textMuted}
            strokeWidth="0.5"
            opacity={0.2}
          />
        ))}

        {/* 수면 패턴 세그먼트 */}
        {sleepPattern.map((segment, index) => {
          const stageIndex = getStageIndex(segment.stage);
          const stageColor = sleepStages[stageIndex]?.color || colors.textMuted;
          const stageHeight =
            (chartHeight - padding.top - padding.bottom) / sleepStages.length;
          const isAwake = segment.stage === "awake";

          return (
            <Rect
              key={index}
              x={getXPosition(segment.hour)}
              y={getYPosition(stageIndex)}
              width={segmentWidth}
              height={stageHeight}
              fill={stageColor}
              stroke={isAwake ? colors.textMuted : "none"}
              strokeWidth={isAwake ? 0.5 : 0}
              opacity={isAwake ? 1 : 0.8}
            />
          );
        })}

        {/* X축 시간 레이블 */}
        {timeLabels.map((timeLabel, index) => (
          <SvgText
            key={`time-${index}`}
            x={getXPosition(timeLabel.hour)}
            y={chartHeight - 5}
            fontSize="10"
            fill={colors.textSecondary}
            textAnchor="middle"
          >
            {timeLabel.label}
          </SvgText>
        ))}

        {/* Y축 수면 단계 레이블 */}
        {sleepStages.map((stage, index) => (
          <SvgText
            key={`stage-${index}`}
            x={15}
            y={
              getYPosition(index) +
              (chartHeight - padding.top - padding.bottom) /
                sleepStages.length /
                2 +
              4
            }
            fontSize="11"
            fill={colors.textSecondary}
            textAnchor="start"
          >
            {stage.label}
          </SvgText>
        ))}
      </Svg>

      {/* 범례 */}
      <View style={styles.legendContainer}>
        {sleepStages.map((stage, index) => (
          <View key={index} style={styles.legendItem}>
            <View
              style={[styles.legendColor, { backgroundColor: stage.color }]}
            />
            <Text style={styles.legendText}>{stage.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 16,
    alignItems: "center", // 👈 차트 중앙 정렬
  },
  legendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 16,
    flexWrap: "wrap",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 8,
    marginVertical: 4,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 2,
    marginRight: 6,
  },
  legendText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 11,
  },
  noDataContainer: {
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  noDataText: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: "center",
  },
});

export default SleepStageChart;
