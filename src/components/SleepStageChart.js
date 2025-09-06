// src/components/SleepStageChart.js
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Rect, Text as SvgText, Line } from "react-native-svg";
import { colors, typography } from "../styles/globalStyles";

const SleepStageChart = ({ sleepData }) => {
  const chartWidth = 320;
  const chartHeight = 160;
  const padding = { top: 20, right: 40, bottom: 30, left: 60 };

  // 수면 데이터가 없거나 모든 값이 0인 경우 처리
  if (
    !sleepData ||
    (!sleepData.deep && !sleepData.light && !sleepData.rem && !sleepData.awake)
  ) {
    return (
      <View style={styles.noDataContainer}>
        <Text style={styles.noDataText}>수면 단계 데이터가 없습니다</Text>
      </View>
    );
  }
  // 수면 단계 정의
  const sleepStages = [
    { key: "awake", label: "깸", color: "#FFFFFF" }, // 흰색으로 변경
    { key: "light", label: "얕은잠", color: colors.blue },
    { key: "deep", label: "깊은잠", color: colors.purple },
    { key: "rem", label: "렘수면", color: colors.indigo },
  ];

  // 시간 레이블 (20시부터 20시까지)
  const timeLabels = [
    { hour: 0, label: "8pm" },
    { hour: 3, label: "11pm" },
    { hour: 6, label: "2am" },
    { hour: 9, label: "5am" },
    { hour: 12, label: "8am" },
    { hour: 15, label: "11am" },
    { hour: 18, label: "2pm" },
    { hour: 21, label: "5pm" },
    { hour: 24, label: "8pm" },
  ];

  // 가상의 수면 패턴 데이터 생성 (실제로는 props나 API에서 받아올 데이터)
  const generateSleepPattern = () => {
    const pattern = [];
    const totalHours = 24;
    const segmentsPerHour = 4; // 15분 단위

    // 수면 시간 설정 (예: 22:30 ~ 07:00)
    const sleepStartHour = 2.5; // 22:30 (20시 기준으로 2.5시간 후)
    const sleepEndHour = 11; // 07:00 (20시 기준으로 11시간 후)

    for (let i = 0; i < totalHours * segmentsPerHour; i++) {
      const hourFromStart = i / segmentsPerHour;

      let stage = "awake";

      // 수면 시간대인 경우
      if (hourFromStart >= sleepStartHour && hourFromStart <= sleepEndHour) {
        const sleepProgress =
          (hourFromStart - sleepStartHour) / (sleepEndHour - sleepStartHour);

        // 수면 패턴 시뮬레이션
        if (sleepProgress < 0.1 || sleepProgress > 0.9) {
          // 잠들기 시작과 깨어나기 전: 얕은잠
          stage = "light";
        } else if (sleepProgress < 0.3) {
          // 초기: 깊은잠
          stage = Math.random() > 0.3 ? "deep" : "light";
        } else if (sleepProgress < 0.7) {
          // 중간: 렘수면과 깊은잠이 섞임
          const rand = Math.random();
          if (rand < 0.4) stage = "rem";
          else if (rand < 0.7) stage = "deep";
          else stage = "light";
        } else {
          // 후반: 주로 렘수면과 얕은잠
          stage = Math.random() > 0.4 ? "rem" : "light";
        }
      }

      pattern.push({
        hour: hourFromStart,
        stage: stage,
        segmentIndex: i,
      });
    }

    return pattern;
  };

  const sleepPattern = generateSleepPattern();

  // 차트 내 좌표 계산
  const getXPosition = (hour) => {
    return (
      padding.left + (hour / 24) * (chartWidth - padding.left - padding.right)
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
  const segmentWidth = (chartWidth - padding.left - padding.right) / (24 * 4);

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
              stroke={isAwake ? colors.textMuted : "none"} // 깸 단계에만 테두리
              strokeWidth={isAwake ? 0.5 : 0}
              opacity={isAwake ? 1 : 0.8} // 깸 단계는 완전 불투명
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
