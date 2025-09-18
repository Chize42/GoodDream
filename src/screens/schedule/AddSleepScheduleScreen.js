import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  getSleepSchedules,
  saveSleepSchedule,
  updateSleepSchedule,
} from "../../services/sleepScheduleService";

const DAYS = [
  { key: "M", label: "월", full: "월요일" },
  { key: "T", label: "화", full: "화요일" },
  { key: "W", label: "수", full: "수요일" },
  { key: "T2", label: "목", full: "목요일" },
  { key: "F", label: "금", full: "금요일" },
  { key: "S", label: "토", full: "토요일" },
  { key: "S2", label: "일", full: "일요일" },
];

export default function AddSleepScheduleScreen({ navigation, route }) {
  const editSchedule = route.params?.editSchedule;
  const existingSchedules = route.params?.existingSchedules || []; // 기존 스케줄들
  const isEditing = !!editSchedule;

  // 기존 스케줄들에서 사용 중인 요일들 추출
  const getUsedDays = () => {
    const usedDays = new Set();
    existingSchedules.forEach((schedule) => {
      if (schedule.id !== editSchedule?.id) {
        // 편집 중인 스케줄은 제외
        if (schedule.days) {
          schedule.days.forEach((day) => usedDays.add(day));
        }
      }
    });
    return Array.from(usedDays);
  };

  const usedDays = getUsedDays();

  const [scheduleName, setScheduleName] = useState(
    editSchedule?.name || "새 스케줄"
  );
  const [bedtime, setBedtime] = useState(
    editSchedule
      ? new Date(`2000-01-01T${editSchedule.bedtime}:00`)
      : new Date(2000, 0, 1, 22, 0)
  );
  const [wakeupTime, setWakeupTime] = useState(
    editSchedule
      ? new Date(`2000-01-01T${editSchedule.wakeup}:00`)
      : new Date(2000, 0, 1, 6, 0)
  );
  const [selectedDays, setSelectedDays] = useState(editSchedule?.days || []);
  const [showBedtimePicker, setShowBedtimePicker] = useState(false);
  const [showWakeupPicker, setShowWakeupPicker] = useState(false);

  const toggleDay = (day) => {
    // 이미 사용 중인 요일은 선택할 수 없음
    if (usedDays.includes(day) && !selectedDays.includes(day)) {
      Alert.alert("알림", `${day}요일은 이미 다른 스케줄에서 사용 중입니다.`);
      return;
    }

    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const calculateSleepDuration = () => {
    let bedHour = bedtime.getHours();
    let bedMinute = bedtime.getMinutes();
    let wakeHour = wakeupTime.getHours();
    let wakeMinute = wakeupTime.getMinutes();

    // 다음날 기상하는 경우 계산
    if (
      wakeHour < bedHour ||
      (wakeHour === bedHour && wakeMinute <= bedMinute)
    ) {
      wakeHour += 24;
    }

    const totalMinutes =
      wakeHour * 60 + wakeMinute - (bedHour * 60 + bedMinute);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return `${hours}시간 ${minutes}분`;
  };

  const handleSave = () => {
    if (selectedDays.length === 0) {
      Alert.alert("알림", "최소 하나의 요일을 선택해주세요.");
      return;
    }

    const schedule = {
      id: editSchedule?.id,
      name: scheduleName,
      bedtime: formatTime(bedtime),
      wakeup: formatTime(wakeupTime),
      days: selectedDays,
    };

    if (isEditing) {
      navigation.navigate("SleepSchedule", { editedSchedule: schedule });
    } else {
      navigation.navigate("SleepSchedule", { newSchedule: schedule });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate('SleepSchedule')}
        >
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEditing ? "스케줄 편집" : "스케줄 추가"}
        </Text>
        <TouchableOpacity onPress={handleSave}>
          <Text style={styles.saveButton}>저장</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* 스케줄 이름 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>스케줄 이름</Text>
          <TextInput
            style={styles.nameInput}
            value={scheduleName}
            onChangeText={setScheduleName}
            placeholder="스케줄 이름을 입력하세요"
            placeholderTextColor="#9ca3af"
          />
        </View>

        {/* 요일 선택 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>활성 요일</Text>
          <View style={styles.daysContainer}>
            {DAYS.map((day) => {
              const isSelected = selectedDays.includes(day.label);
              const isAlreadyUsed = usedDays.includes(day.label);

              return (
                <TouchableOpacity
                  key={day.key}
                  style={[
                    styles.dayButton,
                    isSelected && styles.dayButtonActive,
                    isAlreadyUsed && !isSelected && styles.dayButtonUsed,
                  ]}
                  onPress={() => toggleDay(day.label)}
                >
                  <Text
                    style={[
                      styles.dayButtonText,
                      isSelected && styles.dayButtonTextActive,
                      isAlreadyUsed && !isSelected && styles.dayButtonTextUsed,
                    ]}
                  >
                    {day.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* 수면 시간 설정 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>수면 및 기상 시간</Text>

          <View style={styles.timeSection}>
            <TouchableOpacity
              style={styles.timeButton}
              onPress={() => setShowBedtimePicker(true)}
            >
              <View style={styles.timeInfo}>
                <Ionicons
                  name="bed-outline"
                  size={24}
                  color="#007AFF"
                  style={styles.timeIcon}
                />
                <View>
                  <Text style={styles.timeLabel}>취침 시간</Text>
                  <Text style={styles.timeValue}>{formatTime(bedtime)}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.timeButton}
              onPress={() => setShowWakeupPicker(true)}
            >
              <View style={styles.timeInfo}>
                <Ionicons
                  name="alarm-outline"
                  size={24}
                  color="#007AFF"
                  style={styles.timeIcon}
                />
                <View>
                  <Text style={styles.timeLabel}>기상 시간</Text>
                  <Text style={styles.timeValue}>{formatTime(wakeupTime)}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>
          </View>
        </View>

        {/* 수면 시간 정보 */}
        <View style={styles.sleepDurationCard}>
          <Text style={styles.sleepDurationLabel}>총 수면 시간</Text>
          <Text style={styles.sleepDurationValue}>
            {calculateSleepDuration()}
          </Text>
        </View>
      </View>

      {/* 시간 선택기 */}
      {showBedtimePicker && (
        <DateTimePicker
          value={bedtime}
          mode="time"
          is24Hour={true}
          onChange={(event, selectedTime) => {
            setShowBedtimePicker(false);
            if (selectedTime) setBedtime(selectedTime);
          }}
        />
      )}

      {showWakeupPicker && (
        <DateTimePicker
          value={wakeupTime}
          mode="time"
          is24Hour={true}
          onChange={(event, selectedTime) => {
            setShowWakeupPicker(false);
            if (selectedTime) setWakeupTime(selectedTime);
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#181820",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: "#3A3A3C",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
  saveButton: {
    fontSize: 16,
    fontWeight: "500",
    color: "#007AFF",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 15,
  },
  nameInput: {
    backgroundColor: "#2a2d47",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 15,
    fontSize: 16,
    color: "#fff",
  },
  daysContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dayButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#2a2d47",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "transparent",
  },
  dayButtonActive: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
    borderWidth: 2,
  },
  dayButtonUsed: {
    backgroundColor: "#2a2d47",
    borderColor: "#007AFF",
    borderWidth: 2,
  },
  dayButtonDisabled: {
    backgroundColor: "#1a1a1a",
    borderColor: "#007AFF",
    borderWidth: 2,
    opacity: 0.5,
  },
  dayButtonTextUsed: {
    color: "#007AFF",
  },
  dayButtonTextDisabled: {
    color: "#666",
  },
  dayButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#9ca3af",
  },
  dayButtonTextActive: {
    color: "#fff",
  },
  timeSection: {
    gap: 15,
  },
  timeButton: {
    backgroundColor: "#2a2d47",
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  timeInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  timeIcon: {
    marginRight: 15,
  },
  timeLabel: {
    fontSize: 14,
    color: "#9ca3af",
    marginBottom: 5,
  },
  timeValue: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
  sleepDurationCard: {
    backgroundColor: "#2a2d47",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    marginTop: 20,
  },
  sleepDurationLabel: {
    fontSize: 14,
    color: "#9ca3af",
    marginBottom: 5,
  },
  sleepDurationValue: {
    fontSize: 24,
    fontWeight: "600",
    color: "#007AFF",
  },
});
