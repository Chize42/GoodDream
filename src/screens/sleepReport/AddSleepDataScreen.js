// src/screens/AddSleepDataScreen.js
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Platform } from "react-native";
import { useAuth } from "../../contexts/AuthContext";

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
  const { user } = useAuth();

  // route에서 전달받은 날짜를 초기값으로 사용
  const getInitialDate = () => {
    if (route?.params?.selectedDate) {
      return route.params.selectedDate;
    }
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(today.getDate()).padStart(2, "0")}`;
  };

  const [selectedDate, setSelectedDate] = useState(getInitialDate());
  const [bedTime, setBedTime] = useState("23:00");
  const [wakeTime, setWakeTime] = useState("07:00");
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

  // 수면 시간(분) 계산 함수
  const calculateSleepDurationMinutes = () => {
    try {
      const [bedHour, bedMin] = bedTime.split(":").map(Number);
      const [wakeHour, wakeMin] = wakeTime.split(":").map(Number);

      let bedTimeMinutes = bedHour * 60 + bedMin;
      let wakeTimeMinutes = wakeHour * 60 + wakeMin;

      if (wakeTimeMinutes <= bedTimeMinutes) {
        wakeTimeMinutes += 24 * 60;
      }

      return wakeTimeMinutes - bedTimeMinutes;
    } catch (error) {
      return 0;
    }
  };

  // 수면 지속시간 표시용
  const calculateSleepDuration = () => {
    try {
      const totalMinutes = calculateSleepDurationMinutes();

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

  // 수면 점수 자동 계산 함수
  const calculateSleepScore = (durationMinutes) => {
    const sleepHours = durationMinutes / 60;
    let score = 0;

    // 7~9시간: 80~100점
    if (sleepHours >= 7 && sleepHours <= 9) {
      const deviation = Math.abs(sleepHours - 8);
      score = Math.round(100 - deviation * 10);
    }
    // 6~7시간 또는 9~10시간: 60~80점
    else if (sleepHours >= 6 && sleepHours <= 10) {
      const deviation = sleepHours < 7 ? 7 - sleepHours : sleepHours - 9;
      score = Math.round(80 - deviation * 20);
    }
    // 5~6시간 또는 10~11시간: 40~60점
    else if (sleepHours >= 5 && sleepHours <= 11) {
      const deviation = sleepHours < 6 ? 6 - sleepHours : sleepHours - 10;
      score = Math.round(60 - deviation * 20);
    }
    // 4~5시간 또는 11~12시간: 20~40점
    else if (sleepHours >= 4 && sleepHours <= 12) {
      const deviation = sleepHours < 5 ? 5 - sleepHours : sleepHours - 11;
      score = Math.round(40 - deviation * 20);
    }
    // 4시간 미만 또는 12시간 초과: 0~20점
    else {
      const deviation = sleepHours < 4 ? 4 - sleepHours : sleepHours - 12;
      score = Math.max(0, Math.round(20 - deviation * 5));
    }

    return Math.min(100, Math.max(0, score));
  };

  // ✅ 데이터 존재 여부를 정확히 체크하는 함수
  const hasValidSleepData = (data) => {
    if (!data) return false;
    if (typeof data !== "object") return false;
    if (Object.keys(data).length === 0) return false;

    // bedTime과 wakeTime이 모두 있어야 유효한 데이터로 간주
    return !!(data.bedTime && data.wakeTime);
  };

  // 데이터 저장 함수
  const handleSaveSleepData = async () => {
    try {
      if (!user?.uid) {
        Alert.alert("오류", "로그인이 필요합니다.");
        return;
      }

      setLoading(true);

      console.log("데이터 확인 중:", { userId: user.uid, date: selectedDate });

      // ✅ getSleepData는 { success, data } 형태로 반환
      const result = await getSleepData(user.uid, selectedDate);

      console.log("가져온 결과:", result);

      // ✅ result.data로 접근
      const existingData = result?.data;

      console.log("실제 데이터:", existingData);
      console.log("데이터 타입:", typeof existingData);
      console.log(
        "데이터 키:",
        existingData ? Object.keys(existingData) : "없음"
      );

      // ✅ 유효한 데이터가 있는지 정확히 체크
      if (hasValidSleepData(existingData)) {
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
        console.log("새 데이터 저장 시작");
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
      if (!user?.uid) {
        Alert.alert("오류", "로그인이 필요합니다.");
        return;
      }

      setLoading(true);

      const durationMinutes = calculateSleepDurationMinutes();

      // ✅ saveSleepData는 (userId, sleepData) 형태로 호출
      // date를 sleepData 안에 포함
      const basicSleepData = {
        date: selectedDate, // ✅ date 필드 추가
        bedTime,
        wakeTime,
        duration: durationMinutes,
        isManualEntry: true,
        source: "manual",
        lastModified: new Date().toISOString(),
      };

      console.log("저장할 데이터:", basicSleepData);

      // ✅ (userId, sleepData) 형태로 호출
      await saveSleepData(user.uid, basicSleepData);

      console.log("저장 완료!");

      Alert.alert("저장 완료!", "수면 데이터가 성공적으로 저장되었습니다.", [
        {
          text: "확인",
          onPress: () => {
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
      Alert.alert("오류", `수면 데이터 저장에 실패했습니다.\n${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <View style={globalStyles.container}>
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text style={{ color: colors.textMuted, fontSize: 16 }}>
            로그인이 필요합니다
          </Text>
        </View>
      </View>
    );
  }

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

          {/* 예상 수면 점수 표시 */}
          <View style={[styles.durationContainer, { marginTop: spacing.md }]}>
            <Text style={styles.durationLabel}>예상 수면 점수</Text>
            <Text style={styles.durationText}>
              {calculateSleepScore(calculateSleepDurationMinutes())}점
            </Text>
            <Text
              style={[
                styles.durationLabel,
                { marginTop: spacing.xs, fontSize: 12 },
              ]}
            >
              수면 시간을 기준으로 자동 계산됩니다
            </Text>
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

      {/* DateTimePicker들 */}
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
};

export default AddSleepDataScreen;
