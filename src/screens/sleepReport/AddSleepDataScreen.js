// src/screens/AddSleepDataScreen.js
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Platform } from "react-native";

// 스타일 import
import {
  colors,
  globalStyles,
  typography,
  spacing,
} from "../../styles/globalStyles";

// Firebase 서비스 import
import { saveSleepData, getSleepData } from "../../services/sleepService";

const AddSleepDataScreen = ({ navigation, route }) => {
  // route에서 전달받은 날짜를 초기값으로 사용
  const getInitialDate = () => {
    if (route?.params?.selectedDate) {
      return route.params.selectedDate;
    }
    // 파라미터가 없으면 오늘 날짜 사용
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(today.getDate()).padStart(2, "0")}`;
  };

  const [selectedDate, setSelectedDate] = useState(getInitialDate());
  const [bedTime, setBedTime] = useState("23:00");
  const [wakeTime, setWakeTime] = useState("07:00");
  const [sleepScore, setSleepScore] = useState("75");
  const [loading, setLoading] = useState(false);

  // DateTimePicker 상태
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showBedTimePicker, setShowBedTimePicker] = useState(false);
  const [showWakeTimePicker, setShowWakeTimePicker] = useState(false);

  // 시간 포맷팅 함수
  const formatTime = (timeStr) => {
    const [hour, minute] = timeStr.split(":");
    const hourInt = parseInt(hour);
    const period = hourInt >= 12 ? "PM" : "AM";
    const displayHour =
      hourInt === 0 ? 12 : hourInt > 12 ? hourInt - 12 : hourInt;
    return `${displayHour}:${minute} ${period}`;
  };

  // 날짜 포맷팅 함수 (표시용)
  const formatDateForDisplay = (dateStr) => {
    try {
      const [year, month, day] = dateStr.split("-").map(Number);
      return `${year}년 ${month}월 ${day}일`;
    } catch (error) {
      return dateStr;
    }
  };

  // 24시간 형식으로 변환
  const formatTo24Hour = (date) => {
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  // 날짜를 YYYY-MM-DD 형식으로 변환
  const formatToDateString = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // DateTimePicker 핸들러들
  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      setSelectedDate(formatToDateString(selectedDate));
    }
  };

  const onBedTimeChange = (event, selectedTime) => {
    setShowBedTimePicker(Platform.OS === "ios");
    if (selectedTime) {
      setBedTime(formatTo24Hour(selectedTime));
    }
  };

  const onWakeTimeChange = (event, selectedTime) => {
    setShowWakeTimePicker(Platform.OS === "ios");
    if (selectedTime) {
      setWakeTime(formatTo24Hour(selectedTime));
    }
  };

  // 수면 지속시간 계산
  const calculateSleepDuration = () => {
    try {
      const [bedHour, bedMin] = bedTime.split(":").map(Number);
      const [wakeHour, wakeMin] = wakeTime.split(":").map(Number);

      let bedTimeMinutes = bedHour * 60 + bedMin;
      let wakeTimeMinutes = wakeHour * 60 + wakeMin;

      // 다음날 기상인 경우
      if (wakeTimeMinutes <= bedTimeMinutes) {
        wakeTimeMinutes += 24 * 60;
      }

      const totalMinutes = wakeTimeMinutes - bedTimeMinutes;

      if (totalMinutes <= 0) {
        return "0시간 0분";
      }

      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;

      return `${hours}시간 ${minutes}분`;
    } catch (error) {
      return "계산 오류";
    }
  };

  // 데이터 저장 함수
  const handleSaveSleepData = async () => {
    try {
      // 유효성 검사
      const score = parseInt(sleepScore);
      if (isNaN(score) || score < 0 || score > 100) {
        Alert.alert("오류", "수면 점수는 0~100 사이의 숫자여야 합니다.");
        return;
      }

      setLoading(true);

      // 기존 데이터가 있는지 확인
      const existingData = await getSleepData(selectedDate);

      if (existingData) {
        // 기존 데이터가 있는 경우 경고 메시지
        setLoading(false);
        Alert.alert(
          "(주의) 기존 데이터가 존재합니다",
          `${selectedDate}에 이미 수면 데이터가 있습니다.\n새로운 데이터로 덮어쓰시겠습니까?`,
          [
            {
              text: "취소",
              style: "cancel",
            },
            {
              text: "저장",
              onPress: () => saveData(),
            },
          ]
        );
      } else {
        // 기존 데이터가 없는 경우 바로 저장
        await saveData();
      }
    } catch (error) {
      console.error("데이터 저장 준비 오류:", error);
      Alert.alert("오류", "데이터를 확인하는 중 오류가 발생했습니다.");
      setLoading(false);
    }
  };

  // 실제 저장 함수
  const saveData = async () => {
    try {
      setLoading(true);

      // 기본 수면 데이터만 저장 (수면 단계 정보 없음)
      const basicSleepData = {
        bedTime,
        wakeTime,
        score: parseInt(sleepScore),
        // 수면 단계 데이터는 포함하지 않음
        isManualEntry: true, // 직접 입력 표시
        lastModified: new Date().toISOString(),
      };

      // Firebase에 저장
      await saveSleepData(selectedDate, basicSleepData);

      Alert.alert("저장 완료!", "수면 데이터가 성공적으로 저장되었습니다.", [
        {
          text: "확인",
          onPress: () => {
            // 수면 리포트 화면으로 돌아가면서 저장된 날짜로 이동
            navigation.reset({
              index: 0,
              routes: [
                {
                  name: "SleepReport",
                  params: { initialDate: selectedDate, refresh: true },
                },
              ],
            });
          },
        },
      ]);
    } catch (error) {
      console.error("수면 데이터 저장 오류:", error);
      Alert.alert("오류", "수면 데이터 저장에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={globalStyles.container}>
      {/* 헤더 */}
      <View style={[globalStyles.header, { paddingTop: 50 }]}>
        <TouchableOpacity onPress={() => navigation?.goBack()}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={globalStyles.headerTitle}>수면 기록하기</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <View style={{ padding: spacing.lg }}>
          {/* 날짜 선택 */}
          <View style={styles.inputSection}>
            <Text style={styles.sectionTitle}>날짜</Text>
            <TouchableOpacity
              style={styles.inputButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.inputText}>
                {formatDateForDisplay(selectedDate)}
              </Text>
              <Ionicons
                name="calendar-outline"
                size={20}
                color={colors.primary}
              />
            </TouchableOpacity>
          </View>

          {/* 취침 시간 */}
          <View style={styles.inputSection}>
            <Text style={styles.sectionTitle}>취침 시간</Text>
            <TouchableOpacity
              style={styles.inputButton}
              onPress={() => setShowBedTimePicker(true)}
            >
              <Text style={styles.inputText}>{formatTime(bedTime)}</Text>
              <Ionicons name="time-outline" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {/* 기상 시간 */}
          <View style={styles.inputSection}>
            <Text style={styles.sectionTitle}>기상 시간</Text>
            <TouchableOpacity
              style={styles.inputButton}
              onPress={() => setShowWakeTimePicker(true)}
            >
              <Text style={styles.inputText}>{formatTime(wakeTime)}</Text>
              <Ionicons name="time-outline" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {/* 수면 지속시간 표시 */}
          <View style={styles.durationContainer}>
            <Text style={styles.durationLabel}>수면 지속시간</Text>
            <Text style={styles.durationText}>{calculateSleepDuration()}</Text>
          </View>

          {/* 수면 점수 */}
          <View style={styles.inputSection}>
            <Text style={styles.sectionTitle}>수면 점수 (0-100)</Text>
            <TextInput
              style={styles.scoreInput}
              value={sleepScore}
              onChangeText={setSleepScore}
              placeholder="75"
              placeholderTextColor={colors.textMuted}
              keyboardType="numeric"
              maxLength={3}
            />
          </View>

          {/* 저장 버튼 */}
          <TouchableOpacity
            style={[
              globalStyles.button,
              {
                marginTop: spacing.xl,
                opacity: loading ? 0.7 : 1,
              },
            ]}
            onPress={handleSaveSleepData}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={globalStyles.buttonText}>수면 데이터 저장</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* DateTimePicker들 - 기본 시스템 피커 사용 */}
      {showDatePicker && (
        <DateTimePicker
          testID="datePicker"
          value={new Date(selectedDate + "T00:00:00")}
          mode="date"
          display="default"
          onChange={onDateChange}
        />
      )}

      {showBedTimePicker && (
        <DateTimePicker
          testID="bedTimePicker"
          value={new Date(`2000-01-01T${bedTime}:00`)}
          mode="time"
          is24Hour={false}
          display="default"
          onChange={onBedTimeChange}
        />
      )}

      {showWakeTimePicker && (
        <DateTimePicker
          testID="wakeTimePicker"
          value={new Date(`2000-01-01T${wakeTime}:00`)}
          mode="time"
          is24Hour={false}
          display="default"
          onChange={onWakeTimeChange}
        />
      )}
    </View>
  );
};

const styles = {
  inputSection: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.h3,
    marginBottom: spacing.sm,
  },
  inputButton: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: spacing.lg,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.surface,
  },
  inputText: {
    ...typography.body,
    color: colors.text,
  },
  durationContainer: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    alignItems: "center",
  },
  durationLabel: {
    ...typography.caption,
    marginBottom: spacing.xs,
  },
  durationText: {
    ...typography.h3,
    color: colors.primary,
  },
  scoreInput: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: spacing.lg,
    ...typography.body,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.surface,
  },
};

export default AddSleepDataScreen;
