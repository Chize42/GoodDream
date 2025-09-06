import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Switch,
  StyleSheet,
  Platform,
  Image,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

const WEEK_DAYS = ["일", "월", "화", "수", "목", "금", "토"];

export default function AddEditAlarmScreen({ navigation, route }) {
  const [selectedTab, setSelectedTab] = useState("sleep");
  const [time, setTime] = useState(new Date(2020, 1, 1, 22, 30));
  const [showPicker, setShowPicker] = useState(false);
  const [selectedDays, setSelectedDays] = useState([]);
  const [alarmName, setAlarmName] = useState("");
  const [sound, setSound] = useState("Good Morning");
  const [repeat, setRepeat] = useState(false);
  const [vibrate, setVibrate] = useState(true);

  const handleSave = () => {
    const formattedTime = time.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    const formattedDays = selectedDays
      .sort((a, b) => a - b)
      .map((dayIndex) => WEEK_DAYS[dayIndex]);
    const newAlarmData = {
      type: selectedTab,
      time: formattedTime,
      days: formattedDays,
      name: alarmName,
      sound: sound,
      repeat: repeat,
      vibrate: vibrate,
    };
    navigation.navigate("Alarm", { newAlarm: newAlarmData });
  };

  const toggleDay = (idx) => {
    setSelectedDays((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  const goToSelectSound = () => {
    navigation.navigate("SelectSound", { current: sound });
  };

  useEffect(() => {
    if (route.params?.selectedSound) {
      setSound(route.params.selectedSound);
    }
  }, [route.params?.selectedSound]);

  const onChangeTime = (event, selectedDate) => {
    if (Platform.OS === "android") {
      setShowPicker(false);
    }

    if (selectedDate) {
      setTime(selectedDate);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate("Alarm")}>
          <Image
            source={{ uri: "https://i.ibb.co/Dg5C8MzW/Arrow.png" }}
            style={styles.icon}
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>알람 설정</Text>
        <View style={styles.headerRightPlaceholder} />
      </View>
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[
            styles.tabBtnS,
            selectedTab === "sleep" && styles.tabBtnActive,
          ]}
          onPress={() => setSelectedTab("sleep")}
        >
          <Text
            style={[
              styles.tabText,
              selectedTab === "sleep" && styles.tabTextActive,
            ]}
          >
            취침 시간
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabBtnA,
            selectedTab === "wake" && styles.tabBtnActive,
          ]}
          onPress={() => setSelectedTab("wake")}
        >
          <Text
            style={[
              styles.tabText,
              selectedTab === "wake" && styles.tabTextActive,
            ]}
          >
            기상 시간
          </Text>
        </TouchableOpacity>
      </View>

      {Platform.OS === "ios" ? (
        <DateTimePicker
          value={time}
          mode="time"
          display="spinner"
          onChange={onChangeTime}
          themeVariant="dark"
        />
      ) : (
        <>
          <TouchableOpacity
            style={styles.timeBox}
            onPress={() => setShowPicker(true)}
          >
            <Text style={styles.timeText}>
              {time.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })}
            </Text>
          </TouchableOpacity>
          {showPicker && (
            <DateTimePicker
              value={time}
              mode="time"
              display="spinner"
              onChange={onChangeTime}
            />
          )}
        </>
      )}

      <View style={styles.box}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 14,
          }}
        >
          {WEEK_DAYS.map((w, i) => (
            <TouchableOpacity
              key={w}
              style={[
                styles.dayBtn,
                selectedDays.includes(i) && styles.dayBtnSelected,
              ]}
              onPress={() => toggleDay(i)}
            >
              <Text
                style={{
                  color: selectedDays.includes(i) ? "#111" : "#fff",
                  fontSize: 16,
                  fontWeight: "bold",
                }}
              >
                {w}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <TextInput
          style={styles.input}
          value={alarmName}
          onChangeText={setAlarmName}
          placeholder="알람 이름"
          placeholderTextColor="#888"
        />
        <View style={styles.optionRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>알림음</Text>
            <TouchableOpacity onPress={goToSelectSound}>
              <Text style={styles.optionSelect}>{sound}</Text>
            </TouchableOpacity>
          </View>
          <Switch
            value={!!sound}
            onValueChange={(v) => setSound(v ? sound : "")}
            trackColor={{ false: "#444", true: "#2196F3" }}
            thumbColor={"#fff"}
          />
        </View>
        <View style={styles.separator} />
        <View style={styles.optionRow}>
          <Text style={styles.label}>반복</Text>
          <Switch
            value={repeat}
            onValueChange={setRepeat}
            trackColor={{ false: "#444", true: "#2196F3" }}
            thumbColor={"#fff"}
          />
        </View>
        <View style={styles.separator} />
        <View style={styles.optionRow}>
          <Text style={styles.label}>진동</Text>
          <Switch
            value={vibrate}
            onValueChange={setVibrate}
            trackColor={{ false: "#444", true: "#2196F3" }}
            thumbColor={"#fff"}
          />
        </View>
        <View style={styles.separator} />
      </View>

      <View style={styles.bottomRow}>
        <TouchableOpacity
          style={styles.bottomBtn}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.bottomBtnText}>취소</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomBtn} onPress={handleSave}>
          <Text style={[styles.bottomBtnText, { color: "#347CFF" }]}>저장</Text>
        </TouchableOpacity>
      </View>
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
    paddingHorizontal: 12,
    paddingTop: 20,
    backgroundColor: "#111",
  },
  headerTitle: {
    flex: 1,
    fontSize: 22,
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
  },
  headerRightPlaceholder: {
    width: 28,
  },
  icon: {
    width: 28,
    height: 28,
  },
  tabRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 12,
  },
  tabBtnA: {
    paddingVertical: 9,
    paddingHorizontal: 32,
    backgroundColor: "#4074D8",
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
  },
  tabBtnS: {
    paddingVertical: 9,
    paddingHorizontal: 32,
    backgroundColor: "#4074D8",
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
  },
  tabBtnActive: {
    backgroundColor: "#fff",
  },
  tabText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "bold",
  },
  tabTextActive: {
    color: "#347CFF",
  },
  timeBox: {
    marginVertical: 10,
    paddingVertical: 20,
  },
  timeText: {
    fontSize: 44,
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
    letterSpacing: 4,
  },
  box: {
    backgroundColor: "#222",
    borderRadius: 18,
    marginHorizontal: 22,
    marginTop: 18,
    padding: 18,
  },
  dayBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1.5,
    borderColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  dayBtnSelected: {
    backgroundColor: "#fff",
  },
  input: {
    borderBottomWidth: 1,
    borderColor: "#666",
    color: "#fff",
    fontSize: 16,
    paddingBottom: 6,
    marginBottom: 8,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
  },
  label: {
    color: "#fff",
    fontSize: 16,
  },
  optionSelect: {
    color: "#347CFF",
    fontSize: 14,
    marginTop: 4,
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 36,
    marginBottom: 24,
    marginTop: "auto",
  },
  bottomBtn: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
  },
  bottomBtnText: {
    color: "#fff",
    fontSize: 19,
    fontWeight: "bold",
    letterSpacing: 2,
  },
  separator: {
    height: 0.5,
    backgroundColor: "#666",
  },
});
