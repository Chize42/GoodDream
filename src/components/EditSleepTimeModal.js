// src/components/EditSleepTimeModal.js
import React, { useState } from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { colors, typography, spacing } from "../styles/globalStyles";

const EditSleepTimeModal = ({
  visible,
  onClose,
  initialBedTime,
  initialWakeTime,
  onSave,
  date,
}) => {
  const [bedTime, setBedTime] = useState(() => {
    const [hour, minute] = initialBedTime.split(":");
    const date = new Date();
    date.setHours(parseInt(hour), parseInt(minute), 0, 0);
    return date;
  });

  const [wakeTime, setWakeTime] = useState(() => {
    const [hour, minute] = initialWakeTime.split(":");
    const date = new Date();
    date.setHours(parseInt(hour), parseInt(minute), 0, 0);
    return date;
  });

  const [showBedTimePicker, setShowBedTimePicker] = useState(false);
  const [showWakeTimePicker, setShowWakeTimePicker] = useState(false);

  // 시간을 HH:MM 형식으로 변환
  const formatTime = (date) => {
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  // 시간을 12시간 형식으로 표시
  const formatTimeDisplay = (date) => {
    const hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const period = hours >= 12 ? "PM" : "AM";
    const displayHour = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    return `${displayHour}:${minutes} ${period}`;
  };

  // 수면 시간 계산
  const calculateSleepDuration = () => {
    let bedTimeMinutes = bedTime.getHours() * 60 + bedTime.getMinutes();
    let wakeTimeMinutes = wakeTime.getHours() * 60 + wakeTime.getMinutes();

    // 다음날 기상인 경우
    if (wakeTimeMinutes < bedTimeMinutes) {
      wakeTimeMinutes += 24 * 60;
    }

    const totalMinutes = wakeTimeMinutes - bedTimeMinutes;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return `${hours}시간 ${minutes}분`;
  };

  const handleSave = () => {
    const bedTimeStr = formatTime(bedTime);
    const wakeTimeStr = formatTime(wakeTime);

    // 수면 시간이 너무 짧거나 긴 경우 무시하고 넘어감
    const duration = calculateSleepDuration();
    const totalMinutes =
      wakeTime.getHours() * 60 +
      wakeTime.getMinutes() -
      (bedTime.getHours() * 60 + bedTime.getMinutes());
    const adjustedMinutes =
      totalMinutes < 0 ? totalMinutes + 24 * 60 : totalMinutes;

    if (adjustedMinutes < 180) {
      // 3시간 미만
      console.log("수면 시간이 너무 짧습니다:", adjustedMinutes, "분");
      return;
    }

    if (adjustedMinutes > 720) {
      // 12시간 초과
      console.log("수면 시간이 너무 깁니다:", adjustedMinutes, "분");
      return;
    }

    onSave(bedTimeStr, wakeTimeStr);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* 모달 헤더 */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>수면 시간 수정</Text>
            <TouchableOpacity onPress={handleSave}>
              <Text style={styles.saveButton}>저장</Text>
            </TouchableOpacity>
          </View>

          {/* 날짜 표시 */}
          <View style={styles.dateContainer}>
            <Text style={styles.dateText}>{date}</Text>
          </View>

          {/* 취침 시간 */}
          <View style={styles.timeSection}>
            <Text style={styles.timeLabel}>취침 시간</Text>
            <TouchableOpacity
              style={styles.timeButton}
              onPress={() => setShowBedTimePicker(true)}
            >
              <Text style={styles.timeText}>{formatTimeDisplay(bedTime)}</Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          </View>

          {/* 기상 시간 */}
          <View style={styles.timeSection}>
            <Text style={styles.timeLabel}>기상 시간</Text>
            <TouchableOpacity
              style={styles.timeButton}
              onPress={() => setShowWakeTimePicker(true)}
            >
              <Text style={styles.timeText}>{formatTimeDisplay(wakeTime)}</Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          </View>

          {/* 수면 시간 표시 */}
          <View style={styles.durationContainer}>
            <Text style={styles.durationLabel}>총 수면 시간</Text>
            <Text style={styles.durationText}>{calculateSleepDuration()}</Text>
          </View>

          {/* 취침 시간 피커 */}
          {showBedTimePicker && (
            <DateTimePicker
              value={bedTime}
              mode="time"
              display="spinner"
              onChange={(event, selectedTime) => {
                setShowBedTimePicker(false);
                if (selectedTime) {
                  setBedTime(selectedTime);
                }
              }}
            />
          )}

          {/* 기상 시간 피커 */}
          {showWakeTimePicker && (
            <DateTimePicker
              value={wakeTime}
              mode="time"
              display="spinner"
              onChange={(event, selectedTime) => {
                setShowWakeTimePicker(false);
                if (selectedTime) {
                  setWakeTime(selectedTime);
                }
              }}
            />
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    minHeight: 400,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.text,
    fontWeight: "600",
  },
  saveButton: {
    ...typography.body,
    color: colors.primary,
    fontWeight: "600",
  },
  dateContainer: {
    alignItems: "center",
    marginBottom: spacing.xxl,
  },
  dateText: {
    ...typography.body,
    color: colors.textSecondary,
    fontSize: 16,
  },
  timeSection: {
    marginBottom: spacing.xl,
  },
  timeLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    fontWeight: "500",
  },
  timeButton: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.lg,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  timeText: {
    ...typography.body,
    color: colors.text,
    fontSize: 18,
    fontWeight: "500",
  },
  durationContainer: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.lg,
    alignItems: "center",
    marginTop: spacing.lg,
  },
  durationLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  durationText: {
    ...typography.h3,
    color: colors.text,
    fontWeight: "bold",
  },
});

export default EditSleepTimeModal;
