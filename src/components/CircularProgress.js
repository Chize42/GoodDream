// src/components/CircularProgress.js
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { colors, typography } from "../styles/globalStyles";
import { sleepReportStyles } from "../styles/sleepReportStyles";

const CircularProgress = ({ score, sleepData, size = 160 }) => {
  const radius = (size - 40) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeWidth = 20;

  // 수면 점수 계산 함수 - 안전하게 수정
  // 수면 점수 계산 함수 - 개선 버전
  const calculateSleepScore = (sleepData) => {
    if (!sleepData) return 0;

    const {
      deep = 0,
      light = 0,
      rem = 0,
      awake = 0,
      actualSleep = 0,
      totalSleepDuration = 0,
      duration = 0, // 👈 Health Connect에서 오는 duration (분 단위)
    } = sleepData;

    // 👇 수면 시간 계산 (우선순위: actualSleep > totalSleepDuration > duration)
    let sleepHours = 0;
    if (actualSleep > 0) {
      sleepHours = actualSleep;
    } else if (totalSleepDuration > 0) {
      sleepHours = totalSleepDuration;
    } else if (duration > 0) {
      sleepHours = duration / 60; // 분을 시간으로 변환
    } else {
      return 0; // 아무 데이터도 없으면 0점
    }

    // 👇 상세 데이터가 있으면 정밀 계산
    if (deep > 0 || light > 0 || rem > 0) {
      // 1. 수면 효율 점수 (40점 만점)
      const sleepEfficiency = actualSleep / totalSleepDuration;
      let efficiencyScore = 0;
      if (sleepEfficiency >= 0.85) efficiencyScore = 40;
      else if (sleepEfficiency >= 0.75) efficiencyScore = 35;
      else if (sleepEfficiency >= 0.65) efficiencyScore = 25;
      else efficiencyScore = Math.max(0, sleepEfficiency * 40);

      // 2. 수면 단계 비율 점수 (30점 만점)
      const totalSleep = deep + light + rem;
      let stageScore = 0;

      if (totalSleep > 0) {
        const deepRatio = deep / totalSleep;
        const remRatio = rem / totalSleep;
        const lightRatio = light / totalSleep;

        const idealDeep = 0.2;
        const idealRem = 0.25;
        const idealLight = 0.55;

        const deepScore = Math.max(
          0,
          10 - Math.abs(deepRatio - idealDeep) * 50
        );
        const remScore = Math.max(0, 10 - Math.abs(remRatio - idealRem) * 40);
        const lightScore = Math.max(
          0,
          10 - Math.abs(lightRatio - idealLight) * 20
        );

        stageScore = deepScore + remScore + lightScore;
      }

      // 3. 권장 수면시간 대비 점수 (30점 만점)
      const recommendedSleep = 8;
      const sleepTimeRatio = actualSleep / recommendedSleep;
      let timeScore = 0;

      if (sleepTimeRatio >= 0.9 && sleepTimeRatio <= 1.1) {
        timeScore = 30;
      } else if (sleepTimeRatio >= 0.8 && sleepTimeRatio <= 1.2) {
        timeScore = 25;
      } else if (sleepTimeRatio >= 0.7 && sleepTimeRatio <= 1.3) {
        timeScore = 15;
      } else {
        timeScore = Math.max(0, 30 - Math.abs(sleepTimeRatio - 1) * 30);
      }

      const totalScore = Math.round(efficiencyScore + stageScore + timeScore);
      return Math.min(100, Math.max(0, totalScore));
    }

    // 👇 상세 데이터 없으면 수면 시간만으로 간단히 계산 (100점 만점)
    const recommendedSleep = 8; // 권장 수면 시간 8시간
    const sleepTimeRatio = sleepHours / recommendedSleep;

    let timeScore = 0;

    // 7~9시간: 80~100점
    if (sleepHours >= 7 && sleepHours <= 9) {
      // 8시간에 가까울수록 100점에 가까움
      const deviation = Math.abs(sleepHours - 8);
      timeScore = Math.round(100 - deviation * 10);
    }
    // 6~7시간 또는 9~10시간: 60~80점
    else if (sleepHours >= 6 && sleepHours <= 10) {
      const deviation = sleepHours < 7 ? 7 - sleepHours : sleepHours - 9;
      timeScore = Math.round(80 - deviation * 20);
    }
    // 5~6시간 또는 10~11시간: 40~60점
    else if (sleepHours >= 5 && sleepHours <= 11) {
      const deviation = sleepHours < 6 ? 6 - sleepHours : sleepHours - 10;
      timeScore = Math.round(60 - deviation * 20);
    }
    // 4~5시간 또는 11~12시간: 20~40점
    else if (sleepHours >= 4 && sleepHours <= 12) {
      const deviation = sleepHours < 5 ? 5 - sleepHours : sleepHours - 11;
      timeScore = Math.round(40 - deviation * 20);
    }
    // 4시간 미만 또는 12시간 초과: 0~20점
    else {
      const deviation = sleepHours < 4 ? 4 - sleepHours : sleepHours - 12;
      timeScore = Math.max(0, Math.round(20 - deviation * 5));
    }

    return Math.min(100, Math.max(0, timeScore));
  };

  const stageColors = {
    deep: "#4074D8",
    rem: "#9DB7EA",
    light: "#F2F2F2",
    awake: "#272638",
  };

  // sleepData가 있으면 수면 단계 차트
  if (
    sleepData &&
    (sleepData.deep !== undefined ||
      sleepData.light !== undefined ||
      sleepData.rem !== undefined)
  ) {
    const deepTime = sleepData.deep || 0;
    const remTime = sleepData.rem || 0;
    const lightTime = sleepData.light || 0;
    const awakeTime = sleepData.awake || 0;

    const totalSleepDuration = deepTime + remTime + lightTime + awakeTime;

    // 👇 totalSleepDuration이 0이면 기본 점수 차트 표시
    if (totalSleepDuration === 0) {
      const displayScore = calculateSleepScore(sleepData);
      const strokeDasharray = circumference;
      const strokeDashoffset =
        circumference - (displayScore / 100) * circumference;

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
            <Text>
              <Text style={sleepReportStyles.scoreNumber}>{displayScore}</Text>
              <Text style={sleepReportStyles.scoreUnit}>점</Text>
            </Text>
          </View>
        </View>
      );
    }

    // 각 단계별 비율 계산
    const deepRatio = deepTime / totalSleepDuration;
    const remRatio = remTime / totalSleepDuration;
    const lightRatio = lightTime / totalSleepDuration;
    const awakeRatio = awakeTime / totalSleepDuration;

    const deepLength = circumference * deepRatio;
    const remLength = circumference * remRatio;
    const lightLength = circumference * lightRatio;
    const awakeLength = circumference * awakeRatio;

    let currentOffset = 0;

    return (
      <View style={styles.container}>
        <Svg width={size} height={size}>
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

          {/* 깸 */}
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

  // 기본 점수 차트
  const displayScore = score || 0;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (displayScore / 100) * circumference;

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
        <Text>
          <Text style={sleepReportStyles.scoreNumber}>{displayScore}</Text>
          <Text style={sleepReportStyles.scoreUnit}>점</Text>
        </Text>
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
