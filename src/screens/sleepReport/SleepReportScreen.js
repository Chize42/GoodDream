// src/screens/SleepReportScreen.js - 수정된 버전
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

// 컴포넌트 import
import CustomCalendar from "../../components/CustomCalendar";
import CircularProgress from "../../components/CircularProgress";
import SleepStageChart from "../../components/SleepStageChart";
import WeekChart from "../../components/WeekChart";
// import FirebaseStatusBar from "../components/FirebaseStatusBar";
import SleepHeatmapChart from "../../components/SleepHeatmapChart";
import EditSleepTimeModal from "../../components/EditSleepTimeModal";

// 스타일 import
import {
  colors,
  globalStyles,
  typography,
  spacing,
} from "../../styles/globalStyles";
import { sleepReportStyles } from "../../styles/sleepReportStyles";

// Firebase 서비스 import
import {
  getSleepDataRange,
  uploadDummyData,
  addNewSleepData,
} from "../../services/sleepService";

const SleepReportScreen = ({ navigation, route }) => {
  // route에서 전달받은 날짜를 초기값으로 사용
  const getInitialDate = () => {
    if (route?.params?.initialDate) {
      return route.params.initialDate;
    }
    // 파라미터가 없으면 오늘 날짜 사용
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(today.getDate()).padStart(2, "0")}`;
  };

  const getInitialMonth = () => {
    const initialDate = getInitialDate();
    return initialDate.substring(0, 7) + "-01"; // YYYY-MM-01 형식
  };

  // State 관리 - 초기값을 오늘 날짜로 설정
  const [selectedDate, setSelectedDate] = useState(getInitialDate());
  const [currentMonth, setCurrentMonth] = useState(getInitialMonth());
  const [calendarViewMode, setCalendarViewMode] = useState("month");
  const [dataViewMode, setDataViewMode] = useState("day");
  const [isCalendarCollapsed, setIsCalendarCollapsed] = useState(false);
  const [sleepData, setSleepData] = useState({});
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);

  const currentSleepData = sleepData[selectedDate];

  // Firebase 데이터 로드
  const loadSleepData = async () => {
    try {
      setLoading(true);

      // 현재 월의 시작과 끝 계산
      const year = parseInt(currentMonth.substring(0, 4));
      const month = parseInt(currentMonth.substring(5, 7));

      // 기본 월 범위
      let startDate = `${year}-${String(month).padStart(2, "0")}-01`;
      let endDate = `${year}-${String(month).padStart(2, "0")}-31`;

      // 선택된 날짜의 주간 범위도 고려
      const selectedDateObj = new Date(selectedDate + "T00:00:00");
      const dayOfWeek = (selectedDateObj.getDay() + 6) % 7;

      const startOfWeek = new Date(selectedDateObj);
      startOfWeek.setDate(selectedDateObj.getDate() - dayOfWeek);

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);

      // 주간 범위가 현재 월을 벗어나면 범위 확장
      const weekStartStr = `${startOfWeek.getFullYear()}-${String(
        startOfWeek.getMonth() + 1
      ).padStart(2, "0")}-${String(startOfWeek.getDate()).padStart(2, "0")}`;
      const weekEndStr = `${endOfWeek.getFullYear()}-${String(
        endOfWeek.getMonth() + 1
      ).padStart(2, "0")}-${String(endOfWeek.getDate()).padStart(2, "0")}`;

      if (weekStartStr < startDate) {
        startDate = weekStartStr;
      }
      if (weekEndStr > endDate) {
        endDate = weekEndStr;
      }

      console.log("확장된 데이터 로드 범위:", {
        startDate,
        endDate,
        weekStartStr,
        weekEndStr,
      });

      const data = await getSleepDataRange(startDate, endDate);
      setSleepData(data);

      console.log("로드된 데이터 키:", Object.keys(data));
    } catch (err) {
      console.error("데이터 로드 오류:", err);
      Alert.alert(
        "데이터 로드 실패",
        "Firebase에서 데이터를 불러올 수 없습니다. 더미 데이터를 업로드하시겠습니까?",
        [
          { text: "취소", style: "cancel" },
          { text: "업로드", onPress: handleUploadDummyData },
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  // 더미 데이터 업로드
  const handleUploadDummyData = async () => {
    try {
      setLoading(true);
      await uploadDummyData();
      Alert.alert("성공!", "더미 데이터 업로드가 완료되었습니다.", [
        { text: "확인", onPress: () => loadSleepData() },
      ]);
    } catch (error) {
      Alert.alert("오류", "더미 데이터 업로드에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSleepData();
  }, [currentMonth, selectedDate]);
  useEffect(() => {
    if (route?.params?.initialDate) {
      const newDate = route.params.initialDate;
      const newMonth = newDate.substring(0, 7) + "-01";

      setSelectedDate(newDate);
      setCurrentMonth(newMonth);

      console.log("날짜 업데이트:", newDate, newMonth); // 디버깅용
    }
  }, [route?.params?.initialDate]);
  useEffect(() => {
    const checkAndUpdateToday = () => {
      const today = new Date();
      const todayString = `${today.getFullYear()}-${String(
        today.getMonth() + 1
      ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

      // 현재 선택된 날짜가 오늘이 아니고, 새로운 날이 되었다면 자동 업데이트
      if (selectedDate !== todayString) {
        const lastUpdate = new Date(selectedDate);
        const now = new Date();
      }
      // 날짜가 바뀌었는지 확인 (시간은 무시)
      if (lastUpdate.toDateString() !== now.toDateString()) {
        setSelectedDate(todayString);
        setCurrentMonth(todayString.substring(0, 7) + "-01");
        console.log("자동으로 오늘 날짜로 업데이트:", todayString);
      }
    };
  });

  // 유틸리티 함수들
  const formatTime = (timeStr) => {
    const [hour, minute] = timeStr.split(":");
    const hourInt = parseInt(hour);
    const period = hourInt >= 12 ? "PM" : "AM";
    const displayHour =
      hourInt === 0 ? 12 : hourInt > 12 ? hourInt - 12 : hourInt;
    return `${displayHour}:${minute} ${period}`;
  };

  const calculateSleepDuration = (bedTime, wakeTime) => {
    const [bedHour, bedMin] = bedTime.split(":").map(Number);
    const [wakeHour, wakeMin] = wakeTime.split(":").map(Number);

    let bedTimeMinutes = bedHour * 60 + bedMin;
    let wakeTimeMinutes = wakeHour * 60 + wakeMin;

    if (wakeTimeMinutes < bedTimeMinutes) {
      wakeTimeMinutes += 24 * 60;
    }

    const totalMinutes = wakeTimeMinutes - bedTimeMinutes;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return `총 ${hours}시간 ${minutes}분`;
  };

  const getWeekData = () => {
    const selectedDateObj = new Date(selectedDate + "T00:00:00");
    const dayOfWeek = (selectedDateObj.getDay() + 6) % 7;

    const startOfWeek = new Date(selectedDateObj);
    startOfWeek.setDate(selectedDateObj.getDate() - dayOfWeek);

    const weekData = [];
    const currentDate = new Date(startOfWeek);

    for (let i = 0; i < 7; i++) {
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, "0");
      const date = String(currentDate.getDate()).padStart(2, "0");
      const dateString = `${year}-${month}-${date}`;

      const dayData = sleepData[dateString];
      weekData.push({
        date: dateString,
        dayName: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i],
        data: dayData,
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return weekData;
  };

  const getWeeklyAverage = () => {
    const weekData = getWeekData();
    const validData = weekData.filter((day) => day.data).map((day) => day.data);
    if (validData.length === 0)
      return { score: 0, avgSleepHours: 0, avgSleepMinutes: 0 };

    const avgScore = Math.round(
      validData.reduce((sum, day) => sum + day.score, 0) / validData.length
    );
    const totalSleep =
      validData.reduce((sum, day) => {
        return sum + day.deep + day.light + day.rem;
      }, 0) / validData.length;

    return {
      score: avgScore,
      avgSleepHours: Math.floor(totalSleep),
      avgSleepMinutes: Math.round((totalSleep % 1) * 60),
    };
  };

  const getWeekDateRange = () => {
    const weekData = getWeekData();
    const startDate = new Date(weekData[0].date + "T00:00:00");
    const endDate = new Date(weekData[6].date + "T00:00:00");

    const formatDate = (date) => {
      return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(
        2,
        "0"
      )}.${String(date.getDate()).padStart(2, "0")}`;
    };

    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
  };

  // 수면 시간 저장 함수 추가
  const handleSaveSleepTime = async (newBedTime, newWakeTime) => {
    try {
      setLoading(true);

      // Firebase에 업데이트 (sleepService에 업데이트 함수가 있다면)
      // await updateSleepTime(selectedDate, newBedTime, newWakeTime);

      // 로컬 상태 업데이트
      setSleepData((prevData) => ({
        ...prevData,
        [selectedDate]: {
          ...prevData[selectedDate],
          bedTime: newBedTime,
          wakeTime: newWakeTime,
        },
      }));

      // 데이터 다시 로드 (선택사항)
      // await loadSleepData();
    } catch (error) {
      console.error("수면 시간 수정 오류:", error);
      Alert.alert("오류", "수면 시간 수정에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={globalStyles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 헤더 */}
        <View style={[globalStyles.header, sleepReportStyles.header]}>
          <TouchableOpacity onPress={() => navigation?.goBack()}>
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={globalStyles.headerTitle}>수면 리포트</Text>
          <TouchableOpacity
            onPress={() => {
              console.log("+ 버튼 클릭됨!");
              navigation.navigate("AddSleepData", {
                selectedDate: selectedDate, // 현재 선택된 날짜 전달
              });
            }}
          >
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* 달력 */}
        <CustomCalendar
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
          currentMonth={currentMonth}
          onMonthChange={setCurrentMonth}
          viewMode={calendarViewMode}
          onViewModeChange={setCalendarViewMode}
          isCollapsed={isCalendarCollapsed}
          sleepData={sleepData}
        />

        {/* Day/Week 토글 */}
        <View style={sleepReportStyles.toggleContainer}>
          <View style={sleepReportStyles.toggleWrapper}>
            {["day", "week"].map((mode) => (
              <TouchableOpacity
                key={mode}
                style={[
                  sleepReportStyles.toggleButton,
                  dataViewMode === mode && sleepReportStyles.activeToggle,
                ]}
                onPress={() => setDataViewMode(mode)}
              >
                <Text
                  style={[
                    sleepReportStyles.toggleText,
                    dataViewMode === mode && sleepReportStyles.activeToggleText,
                  ]}
                >
                  {mode === "day" ? "Day" : "Week"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 데이터 표시 영역 */}
        {dataViewMode === "day" ? (
          currentSleepData ? (
            <>
              {/* 수면 시간 박스 */}
              <View style={sleepReportStyles.sleepTimeBox}>
                <Text style={globalStyles.sectionLabel}>수면 시간</Text>
                <Text style={sleepReportStyles.sleepTime}>
                  {formatTime(currentSleepData.bedTime)} -{" "}
                  {formatTime(currentSleepData.wakeTime)}
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                  }}
                >
                  <Text
                    style={[
                      sleepReportStyles.sleepDuration,
                      { marginBottom: 0 },
                    ]}
                  >
                    {calculateSleepDuration(
                      currentSleepData.bedTime,
                      currentSleepData.wakeTime
                    )}
                  </Text>
                  <TouchableOpacity onPress={() => setShowEditModal(true)}>
                    <Text style={sleepReportStyles.moreButton}>수정하기 ›</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* 수면 점수 박스 */}
              <View style={sleepReportStyles.sleepScoreBox}>
                <Text style={globalStyles.sectionLabel}>수면 점수</Text>
                <View style={sleepReportStyles.scoreContainer}>
                  <CircularProgress
                    score={currentSleepData.score}
                    sleepData={currentSleepData}
                  />
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <TouchableOpacity
                    onPress={() =>
                      navigation.navigate("SleepDetail", {
                        sleepData: currentSleepData,
                        date: selectedDate,
                      })
                    }
                  >
                    <Text style={sleepReportStyles.moreButton}>더보기 ›</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* 수면 단계 박스 - 데이터 확인 후 조건부 렌더링 */}
              <View style={sleepReportStyles.sleepStageBox}>
                <Text style={globalStyles.sectionLabel}>수면 단계 비율</Text>
                {currentSleepData.deep !== undefined &&
                currentSleepData.light !== undefined &&
                currentSleepData.rem !== undefined &&
                (currentSleepData.deep > 0 ||
                  currentSleepData.light > 0 ||
                  currentSleepData.rem > 0) ? (
                  <SleepStageChart sleepData={currentSleepData} />
                ) : (
                  <View
                    style={{
                      alignItems: "center",
                      justifyContent: "center",
                      paddingVertical: 40,
                      paddingHorizontal: 20,
                    }}
                  >
                    <Ionicons
                      name="analytics-outline"
                      size={48}
                      color={colors.textMuted}
                    />
                    <Text
                      style={{
                        ...typography.body,
                        color: colors.textMuted,
                        textAlign: "center",
                        marginTop: 16,
                        marginBottom: 8,
                      }}
                    >
                      상세 데이터가 없습니다
                    </Text>
                    <Text
                      style={{
                        ...typography.caption,
                        color: colors.textMuted,
                        textAlign: "center",
                        lineHeight: 18,
                      }}
                    >
                      자세한 수면 단계 분석을 위해서는{"\n"}수면 추적 장치가
                      필요합니다
                    </Text>
                  </View>
                )}
              </View>
            </>
          ) : (
            <View style={sleepReportStyles.noDataContainer}>
              <Ionicons
                name="moon-outline"
                size={64}
                color={colors.textMuted}
              />
              <Text style={sleepReportStyles.noDataText}>
                선택한 날짜의 수면 데이터가 없습니다.
              </Text>
              <TouchableOpacity
                style={globalStyles.button}
                onPress={() => {
                  console.log("수면 기록하기 버튼 클릭됨!");
                  navigation.navigate("AddSleepData", {
                    selectedDate: selectedDate, // 선택된 날짜 전달
                  });
                }}
              >
                <Text style={globalStyles.buttonText}>수면 기록하기</Text>
              </TouchableOpacity>
            </View>
          )
        ) : (
          // 주간 데이터
          <>
            {/* 주간 평균 데이터 박스 (날짜 범위 포함) */}
            <View style={sleepReportStyles.weekAverageBox}>
              {/* 주간 날짜 범위 - 박스 내부 좌측정렬 */}
              <Text style={sleepReportStyles.weekRangeInBox}>
                {getWeekDateRange()}
              </Text>

              <View style={sleepReportStyles.weekAverageContainer}>
                <View style={sleepReportStyles.averageItem}>
                  <Text style={sleepReportStyles.averageLabel}>
                    평균 수면 효율
                  </Text>
                  <Text style={sleepReportStyles.averageValue}>
                    {getWeeklyAverage().score}%
                  </Text>
                </View>
                <View style={sleepReportStyles.averageItem}>
                  <Text style={sleepReportStyles.averageLabel}>
                    평균 수면 시간
                  </Text>
                  <Text style={sleepReportStyles.averageValue}>
                    {getWeeklyAverage().avgSleepHours}시간{" "}
                    {getWeeklyAverage().avgSleepMinutes}분
                  </Text>
                </View>
              </View>
            </View>

            {/* 주간 차트 박스 - 수면 효율 */}
            <View style={sleepReportStyles.weekChartBox}>
              <Text style={globalStyles.sectionLabel}>주간 수면 효율</Text>
              <WeekChart weekData={getWeekData()} />
            </View>

            {/* 수면 패턴 일관성 히트맵 - 새로 추가 */}
            <View style={sleepReportStyles.weekChartBox}>
              <Text style={globalStyles.sectionLabel}>수면 패턴 일관성</Text>
              <SleepHeatmapChart weekData={getWeekData()} />
            </View>
          </>
        )}
      </ScrollView>

      {/* 수면 시간 수정 모달 */}
      {showEditModal && currentSleepData && (
        <EditSleepTimeModal
          visible={showEditModal}
          onClose={() => setShowEditModal(false)}
          initialBedTime={currentSleepData.bedTime}
          initialWakeTime={currentSleepData.wakeTime}
          onSave={handleSaveSleepTime}
          date={selectedDate}
        />
      )}
    </View>
  );
};

export default SleepReportScreen;
