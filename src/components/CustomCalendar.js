// src/components/CustomCalendar.js
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const CustomCalendar = ({
  selectedDate,
  onDateSelect,
  currentMonth,
  onMonthChange,
  viewMode = "month",
  onViewModeChange,
  isCollapsed = false,
  sleepData = {},
}) => {
  // 선택된 날짜를 포맷팅하는 함수
  const formatSelectedDate = (dateString) => {
    try {
      const date = new Date(dateString + "T00:00:00");
      const year = String(date.getFullYear()).slice(2);
      const month = date.getMonth() + 1;
      const day = date.getDate();
      return `${year}년${month}월${day}일`;
    } catch (error) {
      return "25년5월14일";
    }
  };

  // 이전 주로 이동
  const goToPreviousWeek = () => {
    const currentDate = new Date(selectedDate + "T00:00:00");
    const previousWeek = new Date(currentDate);
    previousWeek.setDate(currentDate.getDate() - 7);

    const newDateString = `${previousWeek.getFullYear()}-${String(
      previousWeek.getMonth() + 1
    ).padStart(2, "0")}-${String(previousWeek.getDate()).padStart(2, "0")}`;

    onDateSelect(newDateString);

    const newMonth = `${previousWeek.getFullYear()}-${String(
      previousWeek.getMonth() + 1
    ).padStart(2, "0")}-01`;
    if (newMonth !== currentMonth) {
      onMonthChange(newMonth);
    }
  };

  // 다음 주로 이동
  const goToNextWeek = () => {
    const currentDate = new Date(selectedDate + "T00:00:00");
    const nextWeek = new Date(currentDate);
    nextWeek.setDate(currentDate.getDate() + 7);

    const newDateString = `${nextWeek.getFullYear()}-${String(
      nextWeek.getMonth() + 1
    ).padStart(2, "0")}-${String(nextWeek.getDate()).padStart(2, "0")}`;

    onDateSelect(newDateString);

    const newMonth = `${nextWeek.getFullYear()}-${String(
      nextWeek.getMonth() + 1
    ).padStart(2, "0")}-01`;
    if (newMonth !== currentMonth) {
      onMonthChange(newMonth);
    }
  };

  // 이전 달로 이동
  const goToPreviousMonth = () => {
    const date = new Date(currentMonth);
    date.setMonth(date.getMonth() - 1);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const newMonth = `${year}-${month}-01`;

    onMonthChange(newMonth);

    const selectedDateObj = new Date(selectedDate + "T00:00:00");
    const selectedDay = selectedDateObj.getDate();
    const newSelectedDate = `${year}-${month}-${String(selectedDay).padStart(
      2,
      "0"
    )}`;

    const newDate = new Date(newSelectedDate + "T00:00:00");
    if (newDate.getMonth() === date.getMonth()) {
      onDateSelect(newSelectedDate);
    } else {
      const lastDay = new Date(year, date.getMonth() + 1, 0).getDate();
      const lastDateOfMonth = `${year}-${month}-${String(lastDay).padStart(
        2,
        "0"
      )}`;
      onDateSelect(lastDateOfMonth);
    }
  };

  // 다음 달로 이동
  const goToNextMonth = () => {
    const date = new Date(currentMonth);
    date.setMonth(date.getMonth() + 1);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const newMonth = `${year}-${month}-01`;

    onMonthChange(newMonth);

    const selectedDateObj = new Date(selectedDate + "T00:00:00");
    const selectedDay = selectedDateObj.getDate();
    const newSelectedDate = `${year}-${month}-${String(selectedDay).padStart(
      2,
      "0"
    )}`;

    const newDate = new Date(newSelectedDate + "T00:00:00");
    if (newDate.getMonth() === date.getMonth()) {
      onDateSelect(newSelectedDate);
    } else {
      const lastDay = new Date(year, date.getMonth() + 1, 0).getDate();
      const lastDateOfMonth = `${year}-${month}-${String(lastDay).padStart(
        2,
        "0"
      )}`;
      onDateSelect(lastDateOfMonth);
    }
  };

  // 통합 이전 버튼 핸들러
  const handlePreviousClick = () => {
    if (viewMode === "week") {
      goToPreviousWeek();
    } else {
      goToPreviousMonth();
    }
  };

  // 통합 다음 버튼 핸들러
  const handleNextClick = () => {
    if (viewMode === "week") {
      goToNextWeek();
    } else {
      goToNextMonth();
    }
  };

  // 달력 데이터 생성
  const getCalendarData = () => {
    const year = parseInt(currentMonth.substring(0, 4));
    const month = parseInt(currentMonth.substring(5, 7));

    const todayObj = new Date();
    const todayString = `${todayObj.getFullYear()}-${String(
      todayObj.getMonth() + 1
    ).padStart(2, "0")}-${String(todayObj.getDate()).padStart(2, "0")}`;

    const firstDay = new Date(year, month - 1, 1);
    const startDate = new Date(firstDay);
    const dayOfWeek = (firstDay.getDay() + 6) % 7;
    startDate.setDate(firstDay.getDate() - dayOfWeek);

    const weeks = [];
    const currentDate = new Date(startDate);

    for (let week = 0; week < 6; week++) {
      const days = [];
      for (let day = 0; day < 7; day++) {
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, "0");
        const date = String(currentDate.getDate()).padStart(2, "0");
        const dateString = `${year}-${month}-${date}`;

        const isCurrentMonth = currentDate.getMonth() === firstDay.getMonth();
        const isToday = dateString === todayString;
        const isSelected = dateString === selectedDate;
        const hasSleepData = sleepData[dateString];

        days.push({
          date: currentDate.getDate(),
          dateString: dateString,
          isCurrentMonth: isCurrentMonth,
          isToday: isToday,
          isSelected: isSelected,
          hasSleepData: hasSleepData,
        });

        currentDate.setDate(currentDate.getDate() + 1);
      }
      weeks.push(days);
    }

    return weeks;
  };

  // 주간 데이터 생성
  const getWeekData = () => {
    const selectedDateObj = new Date(selectedDate + "T00:00:00");
    const dayOfWeek = (selectedDateObj.getDay() + 6) % 7;

    const todayObj = new Date();
    const todayString = `${todayObj.getFullYear()}-${String(
      todayObj.getMonth() + 1
    ).padStart(2, "0")}-${String(todayObj.getDate()).padStart(2, "0")}`;

    const startOfWeek = new Date(selectedDateObj);
    startOfWeek.setDate(selectedDateObj.getDate() - dayOfWeek);

    const days = [];
    const currentDate = new Date(startOfWeek);

    for (let i = 0; i < 7; i++) {
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, "0");
      const date = String(currentDate.getDate()).padStart(2, "0");
      const dateString = `${year}-${month}-${date}`;

      const isToday = dateString === todayString;
      const isSelected = dateString === selectedDate;
      const hasSleepData = sleepData[dateString];

      days.push({
        date: currentDate.getDate(),
        dateString: dateString,
        isCurrentMonth: true,
        isToday: isToday,
        isSelected: isSelected,
        hasSleepData: hasSleepData,
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return [days];
  };

  // 날짜 클릭 핸들러
  const onDatePress = (day) => {
    onDateSelect(day.dateString);

    if (!day.isCurrentMonth) {
      const clickedDate = new Date(day.dateString + "T00:00:00");
      const year = clickedDate.getFullYear();
      const month = String(clickedDate.getMonth() + 1).padStart(2, "0");
      const newMonth = `${year}-${month}-01`;
      onMonthChange(newMonth);
    }
  };

  const weekDays = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
  const calendarData = viewMode === "month" ? getCalendarData() : getWeekData();

  return (
    <View style={styles.container}>
      {/* 달력 헤더 */}
      <View style={styles.header}>
        <Text style={styles.headerText}>
          {formatSelectedDate(selectedDate)}
        </Text>
        <View style={styles.controls}>
          <TouchableOpacity
            style={styles.arrowButton}
            onPress={handlePreviousClick}
          >
            <Ionicons name="chevron-back" size={24} color="#4074D8" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.arrowButton}
            onPress={handleNextClick}
          >
            <Ionicons name="chevron-forward" size={24} color="#4074D8" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.toggleButton}
            onPress={() =>
              onViewModeChange(viewMode === "month" ? "week" : "month")
            }
          >
            <Ionicons name="calendar-outline" size={16} color="#9CA3AF" />
          </TouchableOpacity>
        </View>
      </View>

      {!isCollapsed && (
        <>
          {/* 요일 헤더 */}
          <View style={styles.weekHeader}>
            {weekDays.map((day, index) => (
              <Text key={index} style={styles.weekDay}>
                {day}
              </Text>
            ))}
          </View>

          {/* 달력 본체 */}
          <View style={styles.calendarBody}>
            {calendarData.map((week, weekIndex) => (
              <View key={weekIndex} style={styles.weekRow}>
                {week.map((day, dayIndex) => (
                  <TouchableOpacity
                    key={dayIndex}
                    style={styles.dayButton}
                    onPress={() => onDatePress(day)}
                  >
                    <View
                      style={[
                        styles.dayContainer,
                        day.hasSleepData &&
                          day.isSelected &&
                          styles.selectedDay,
                        day.isToday && !day.isSelected && styles.todayDay,
                      ]}
                    >
                      <Text
                        style={[
                          styles.dayText,
                          !day.isCurrentMonth && styles.otherMonthText,
                          day.isSelected && styles.selectedDayText,
                          day.isToday && !day.isSelected && styles.todayText,
                          day.hasSleepData &&
                            !day.isSelected &&
                            !day.isToday &&
                            styles.hasSleepDataText, // 👈 이거만 추가
                        ]}
                      >
                        {day.date}
                      </Text>
                      {/* 👇 작은 점 제거 */}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </View>
        </>
      )}
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    backgroundColor: "transparent",
    borderRadius: 15,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
  },
  headerText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
  },
  arrowButton: {
    paddingHorizontal: 8,
    paddingVertical: 8,
    marginHorizontal: 4,
  },
  toggleButton: {
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  weekHeader: {
    flexDirection: "row",
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  weekDay: {
    flex: 1,
    textAlign: "center",
    color: "#9CA3AF",
    fontSize: 14,
    paddingVertical: 5,
  },
  calendarBody: {
    paddingHorizontal: 12,
  },
  weekRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  dayButton: {
    flex: 1,
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  dayContainer: {
    width: 34,
    height: 34, // 👈 33 → 32로 변경 (정사각형)
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  hasSleepDataText: {
    color: "#4074D8",
    fontWeight: "500",
  },
  selectedDay: {
    borderRadius: 16,
    backgroundColor: "#4074D8",
    width: 32,
    height: 32,
  },
  todayDay: {
    borderWidth: 1,
    borderRadius: 16,
    borderColor: "#4074D8",
    backgroundColor: "transparent",
    width: 32,
    height: 32,
  },
  dayText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
  },
  otherMonthText: {
    color: "#4B5563",
  },
  selectedDayText: {
    color: "#fff",
    fontWeight: "600",
  },
  todayText: {
    color: "#4074D8",
    fontWeight: "500",
  },
});

export default CustomCalendar;
