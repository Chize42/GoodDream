// src/components/CircularProgress.js - 깸 부분 추가
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { colors, typography } from "../styles/globalStyles";
import { sleepReportStyles } from "../styles/sleepReportStyles"; // 추가

const CircularProgress = ({ score, sleepData, size = 160 }) => {
  // 120에서 160으로 증가
  const radius = (size - 40) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeWidth = 20;

  // 수면 점수 계산 함수
  const calculateSleepScore = (sleepData) => {
    if (!sleepData) return 0;

    const { deep, light, rem, awake, actualSleep, totalSleepDuration } =
      sleepData;

    // 1. 수면 효율 점수 (40점 만점)
    const sleepEfficiency = actualSleep / totalSleepDuration;
    let efficiencyScore = 0;
    if (sleepEfficiency >= 0.85) efficiencyScore = 40;
    else if (sleepEfficiency >= 0.75) efficiencyScore = 35;
    else if (sleepEfficiency >= 0.65) efficiencyScore = 25;
    else efficiencyScore = Math.max(0, sleepEfficiency * 40);

    // 2. 수면 단계 비율 점수 (30점 만점)
    const totalSleep = deep + light + rem;
    const deepRatio = deep / totalSleep;
    const remRatio = rem / totalSleep;
    const lightRatio = light / totalSleep;

    // 이상적인 비율: 깊은잠 20%, 렘수면 25%, 얕은잠 55%
    const idealDeep = 0.2;
    const idealRem = 0.25;
    const idealLight = 0.55;

    // 각 단계별 점수 계산 (비율 차이가 적을수록 높은 점수)
    const deepScore = Math.max(0, 10 - Math.abs(deepRatio - idealDeep) * 50);
    const remScore = Math.max(0, 10 - Math.abs(remRatio - idealRem) * 40);
    const lightScore = Math.max(0, 10 - Math.abs(lightRatio - idealLight) * 20);

    const stageScore = deepScore + remScore + lightScore;

    // 3. 권장 수면시간 대비 점수 (30점 만점)
    const recommendedSleep = 8; // 8시간 권장
    const sleepTimeRatio = actualSleep / recommendedSleep;
    let timeScore = 0;

    if (sleepTimeRatio >= 0.9 && sleepTimeRatio <= 1.1) {
      // 7.2~8.8시간: 최고 점수
      timeScore = 30;
    } else if (sleepTimeRatio >= 0.8 && sleepTimeRatio <= 1.2) {
      // 6.4~9.6시간: 좋은 점수
      timeScore = 25;
    } else if (sleepTimeRatio >= 0.7 && sleepTimeRatio <= 1.3) {
      // 5.6~10.4시간: 보통 점수
      timeScore = 15;
    } else {
      // 그 외: 낮은 점수
      timeScore = Math.max(0, 30 - Math.abs(sleepTimeRatio - 1) * 30);
    }

    // 총합 (100점 만점)
    const totalScore = Math.round(efficiencyScore + stageScore + timeScore);

    return Math.min(100, Math.max(0, totalScore));
  };

  // 수면 단계별 색상 정의 - 깸 색상 업데이트
  const stageColors = {
    deep: "#4074D8", // 깊은잠 - 진한 파랑
    rem: "#9DB7EA", // 렘수면 - 연한 파랑
    light: "#F2F2F2", // 얕은잠 - 연한 회색
    awake: "#272638", // 깸 - 어두운 회색 (업데이트됨)
  };

  // sleepData가 있으면 수면 단계 차트, 없으면 기본 점수 차트
  if (sleepData && sleepData.deep !== undefined) {
    // 각 단계별 시간 (실제 데이터 사용)
    const deepTime = sleepData.deep || 0;
    const remTime = sleepData.rem || 0;
    const lightTime = sleepData.light || 0;
    const awakeTime = sleepData.awake || 0; // 수면 중 깬 시간

    // 총 수면 시간 (침대에 있던 시간)
    const totalSleepDuration = deepTime + remTime + lightTime + awakeTime;

    // 각 단계별 비율 계산 (총 수면 시간 기준)
    const deepRatio = deepTime / totalSleepDuration;
    const remRatio = remTime / totalSleepDuration;
    const lightRatio = lightTime / totalSleepDuration;
    const awakeRatio = awakeTime / totalSleepDuration;

    // 각 단계별 호 길이 계산
    const deepLength = circumference * deepRatio;
    const remLength = circumference * remRatio;
    const lightLength = circumference * lightRatio;
    const awakeLength = circumference * awakeRatio;

    // 누적 오프셋 계산 (시계 방향으로)
    let currentOffset = 0;

    return (
      <View style={styles.container}>
        <Svg width={size} height={size}>
          {/* 배경 원 제거 - 깸 부분이 완전히 투명하게 */}

          {/* 깊은잠 */}
          {deepLength > 0 && (
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={stageColors.deep}
              strokeWidth={strokeWidth}
              fill="none"
              strokeDasharray={`${deepLength} ${circumference}`}
              strokeDashoffset={-currentOffset}
              strokeLinecap="butt"
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
            />
          )}

          {/* 렘수면 */}
          {(() => {
            currentOffset += deepLength;
            return remLength > 0 ? (
              <Circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke={stageColors.rem}
                strokeWidth={strokeWidth}
                fill="none"
                strokeDasharray={`${remLength} ${circumference}`}
                strokeDashoffset={-currentOffset}
                strokeLinecap="butt"
                transform={`rotate(-90 ${size / 2} ${size / 2})`}
              />
            ) : null;
          })()}

          {/* 얕은잠 */}
          {(() => {
            currentOffset += remLength;
            return lightLength > 0 ? (
              <Circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke={stageColors.light}
                strokeWidth={strokeWidth}
                fill="none"
                strokeDasharray={`${lightLength} ${circumference}`}
                strokeDashoffset={-currentOffset}
                strokeLinecap="butt"
                transform={`rotate(-90 ${size / 2} ${size / 2})`}
              />
            ) : null;
          })()}

          {/* 깸 - 새로 추가된 부분 */}
          {(() => {
            currentOffset += lightLength;
            return awakeLength > 0 ? (
              <Circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke={stageColors.awake}
                strokeWidth={strokeWidth}
                fill="none"
                strokeDasharray={`${awakeLength} ${circumference}`}
                strokeDashoffset={-currentOffset}
                strokeLinecap="butt"
                transform={`rotate(-90 ${size / 2} ${size / 2})`}
              />
            ) : null;
          })()}
        </Svg>

        {/* 중앙 텍스트 - sleepReportStyles 사용 */}
        <View style={styles.textContainer}>
          <Text>
            <Text style={sleepReportStyles.scoreNumber}>
              {calculateSleepScore(sleepData)}
            </Text>
            <Text style={sleepReportStyles.scoreUnit}>점</Text>
          </Text>
        </View>
      </View>
    );
  }

  // 기본 점수 차트 (기존 로직)
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <View style={styles.container}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.surface}
          strokeWidth="8"
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.secondary}
          strokeWidth="8"
          fill="none"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={styles.textContainer}>
        <Text style={styles.score}>{score}</Text>
        <Text style={styles.label}>score</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  textContainer: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  score: {
    fontSize: 36,
    fontWeight: "bold",
    color: colors.text,
  },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});

export default CircularProgress;
