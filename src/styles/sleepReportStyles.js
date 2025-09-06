// src/styles/sleepReportStyles.js
import { StyleSheet } from "react-native";
import { colors, spacing, typography } from "./globalStyles";

export const sleepReportStyles = StyleSheet.create({
  header: {
    paddingTop: 50,
    marginBottom: spacing.lg,
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.lg,
  },
  toggleContainer: {
    alignItems: "center",
    marginBottom: spacing.xxl,
  },
  toggleWrapper: {
    backgroundColor: colors.surface,
    borderRadius: 25,
    padding: spacing.xs,
    flexDirection: "row",
  },
  toggleButton: {
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.sm,
    borderRadius: 20,
  },
  activeToggle: {
    backgroundColor: colors.primary,
  },
  toggleText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  activeToggleText: {
    color: colors.text,
  },

  // 새로 추가된 박스 스타일들
  sleepTimeBox: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: spacing.lg,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  sleepScoreBox: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: spacing.lg,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  sleepStageBox: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: spacing.lg,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },

  sleepTime: {
    ...typography.body,
    fontSize: 18,
    marginBottom: 0,
  },
  sleepDuration: {
    ...typography.h2,
    marginBottom: spacing.sm,
  },
  moreButton: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  scoreContainer: {
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  stagesContainer: {
    marginBottom: spacing.lg,
  },
  stageRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  stageInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  stageDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: spacing.sm,
  },
  stageLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  stageValue: {
    ...typography.bodySmall,
    color: colors.text,
  },
  noDataContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xxxl * 1.5,
  },
  noDataText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
  },
  weekRangeContainer: {
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  weekRange: {
    ...typography.bodySmall,
    color: colors.text, // 흰글씨로 변경
    textAlign: "center",
  },
  weekAverageContainer: {
    flexDirection: "row",
    marginTop: spacing.md, // 날짜 범위와 평균 데이터 사이 간격
    // padding과 margin 제거 (박스에서 처리)
  },
  averageItem: {
    flex: 1,
    marginHorizontal: spacing.sm,
  },

  // 박스 내부의 주간 날짜 범위 스타일
  weekRangeInBox: {
    ...typography.bodySmall,
    color: colors.text,
    textAlign: "left",
    fontWeight: "500",
    marginLeft: spacing.sm, // 평균 데이터와 같은 시작점
  },
  averageItem: {
    flex: 1,
    marginHorizontal: spacing.sm,
  },
  averageLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  averageValue: {
    ...typography.h3,
    fontSize: 24, // 20에서 24로 증가
    fontWeight: "bold", // bold 추가
  },

  // Week 모드용 박스 스타일들
  weekAverageBox: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: spacing.lg,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  weekChartBox: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: spacing.lg,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  scoreNumber: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  scoreUnit: {
    fontSize: 16,
    fontWeight: "normal",
    color: "#FFFFFF",
  },
});
