// src/components/SleepFeedback.js
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors } from "../styles/globalStyles";

const SleepFeedback = ({ sleepData }) => {
  // 수면 데이터 기반 피드백 생성 함수
  const generateSleepFeedback = (sleepData) => {
    if (!sleepData)
      return { emoji: "😴", feedback: "수면 데이터가 부족합니다." };

    const { deep, light, rem, awake, actualSleep, totalSleepDuration } =
      sleepData;
    const sleepEfficiency = actualSleep / totalSleepDuration;
    const totalSleep = deep + light + rem;

    // 각 지표별 분석
    const deepRatio = deep / totalSleep;
    const remRatio = rem / totalSleep;
    const lightRatio = light / totalSleep;
    const awakeRatio = awake / totalSleepDuration;

    const sleepTimeRatio = actualSleep / 8; // 8시간 기준

    // 피드백 우선순위 결정
    let feedback = "";
    let emoji = "";

    // 1. 수면 효율이 낮은 경우 (최우선)
    if (sleepEfficiency < 0.65) {
      emoji = "😪";
      feedback =
        "오늘 밤엔 조금 뒤척이셨나봐요. 잠들기 전 스마트폰은 멀리 두고, 조명을 은은하게 해보시는 건 어떨까요?";
    }
    // 2. 깊은잠이 부족한 경우
    else if (deepRatio < 0.15) {
      emoji = "🌙";
      feedback =
        "깊은 잠이 조금 아쉬웠어요. 저녁 늦게 카페인은 피하시고, 가벼운 운동으로 몸을 풀어봅시다.";
    }
    // 3. 렘수면이 부족한 경우
    else if (remRatio < 0.2) {
      emoji = "✨";
      feedback =
        "렘수면 시간이 적었네요. 스트레스받을 일이 있으셨나요? 규칙적인 수면 패턴이 도움이 될 거예요.";
    }
    // 4. 너무 많이 깬 경우
    else if (awakeRatio > 0.15) {
      emoji = "🌛";
      feedback =
        "중간에 자주 깨셨군요. 침실이 너무 덥거나 시끄럽진 않았나요? 온도를 18-22도로 맞춰보세요.";
    }
    // 5. 수면 시간이 부족한 경우
    else if (sleepTimeRatio < 0.75) {
      emoji = "⏰";
      feedback =
        "조금 더 일찍 잠자리에 들어보시는 건 어떨까요? 최소 7시간은 주무셔야 몸이 회복돼요.";
    }
    // 6. 수면 시간이 과도한 경우
    else if (sleepTimeRatio > 1.25) {
      emoji = "😊";
      feedback =
        "푹 주무셨네요! 다만 너무 오래 자면 오히려 피곤할 수 있으니, 8-9시간 정도가 딱 좋아요.";
    }
    // 7. 얕은잠이 너무 많은 경우
    else if (lightRatio > 0.65) {
      emoji = "💤";
      feedback =
        "얕은 잠이 좀 많으셨어요. 자기 전에 따뜻한 차 한 잔이나 책 읽기는 어떠세요?";
    }
    // 8. 전반적으로 좋은 경우
    else if (
      sleepEfficiency >= 0.85 &&
      sleepTimeRatio >= 0.9 &&
      sleepTimeRatio <= 1.1
    ) {
      emoji = "🎉";
      feedback =
        "와! 정말 좋은 수면이었어요. 이런 패턴을 계속 유지하시면 최고예요!";
    }
    // 9. 보통인 경우
    else {
      emoji = "🌟";
      feedback =
        "나쁘지 않은 잠이었어요. 매일 같은 시간에 자고 일어나는 루틴을 만들어보세요!";
    }

    return { emoji, feedback };
  };

  const sleepFeedback = generateSleepFeedback(sleepData);

  return (
    <View style={styles.feedbackContainer}>
      <View style={styles.feedbackIcon}>
        <Text style={styles.feedbackEmoji}>{sleepFeedback.emoji}</Text>
      </View>
      <View style={styles.feedbackContent}>
        <Text style={styles.feedbackTitle}>수면 분석 결과</Text>
        <Text style={styles.feedbackText}>{sleepFeedback.feedback}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  feedbackContainer: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 30,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  feedbackIcon: {
    marginRight: 16,
    marginTop: 4,
  },
  feedbackEmoji: {
    fontSize: 32,
  },
  feedbackContent: {
    flex: 1,
  },
  feedbackTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  feedbackText: {
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
  },
});

export default SleepFeedback;
