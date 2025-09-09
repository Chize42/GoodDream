import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  TextInput,
  Alert,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

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
  const isEditing = !!editSchedule;

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
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image
            source={{ uri: "https://i.ibb.co/Dg5C8MzW/Arrow.png" }}
            style={styles.headerIcon}
          />
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
            placeholderTextColor="#666"
          />
        </View>

        {/* 요일 선택 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>활성 요일</Text>
          <View style={styles.daysContainer}>
            {DAYS.map((day) => (
              <TouchableOpacity
                key={day.key}
                style={[
                  styles.dayButton,
                  selectedDays.includes(day.label) && styles.dayButtonActive,
                ]}
                onPress={() => toggleDay(day.label)}
              >
                <Text
                  style={[
                    styles.dayButtonText,
                    selectedDays.includes(day.label) &&
                      styles.dayButtonTextActive,
                  ]}
                >
                  {day.label}
                </Text>
              </TouchableOpacity>
            ))}
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
                <Image
                  source={{ uri: "https://i.ibb.co/yhqBzQW/bed-icon.png" }}
                  style={styles.timeIcon}
                />
                <View>
                  <Text style={styles.timeLabel}>취침 시간</Text>
                  <Text style={styles.timeValue}>{formatTime(bedtime)}</Text>
                </View>
              </View>
              <Image
                source={{ uri: "https://i.ibb.co/60229hwt/Arrow.png" }}
                style={styles.arrowIcon}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.timeButton}
              onPress={() => setShowWakeupPicker(true)}
            >
              <View style={styles.timeInfo}>
                <Image
                  source={{ uri: "https://i.ibb.co/rQYh2Mz/alarm-icon.png" }}
                  style={styles.timeIcon}
                />
                <View>
                  <Text style={styles.timeLabel}>기상 시간</Text>
                  <Text style={styles.timeValue}>{formatTime(wakeupTime)}</Text>
                </View>
              </View>
              <Image
                source={{ uri: "https://i.ibb.co/60229hwt/Arrow.png" }}
                style={styles.arrowIcon}
              />
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
    backgroundColor: "#111",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  headerIcon: {
    width: 24,
    height: 24,
    tintColor: "#fff",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  saveButton: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2196F3",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 15,
  },
  nameInput: {
    backgroundColor: "#1e1e1e",
    borderRadius: 10,
    paddingHorizontal: 15,
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
    backgroundColor: "#1e1e1e",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  dayButtonActive: {
    backgroundColor: "#2196F3",
    borderColor: "#2196F3",
  },
  dayButtonText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#aaa",
  },
  dayButtonTextActive: {
    color: "#fff",
  },
  timeSection: {
    gap: 15,
  },
  timeButton: {
    backgroundColor: "#1e1e1e",
    borderRadius: 15,
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
    width: 24,
    height: 24,
    tintColor: "#7bb6ff",
    marginRight: 15,
  },
  timeLabel: {
    fontSize: 14,
    color: "#aaa",
    marginBottom: 5,
  },
  timeValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  arrowIcon: {
    width: 20,
    height: 20,
    tintColor: "#aaa",
  },
  sleepDurationCard: {
    backgroundColor: "#1e1e1e",
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
    marginTop: 20,
  },
  sleepDurationLabel: {
    fontSize: 14,
    color: "#aaa",
    marginBottom: 5,
  },
  sleepDurationValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#7bb6ff",
  },
});
