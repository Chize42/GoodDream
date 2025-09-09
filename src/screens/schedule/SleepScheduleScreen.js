import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  Switch,
  FlatList,
  StyleSheet,
  Image,
} from "react-native";

export default function SleepScheduleScreen({ navigation, route }) {
  const [scheduleEnabled, setScheduleEnabled] = useState(true);
  const [schedules, setSchedules] = useState([
    {
      id: "1",
      name: "평일 수면",
      bedtime: "22:00",
      wakeup: "06:00",
      days: ["월", "화", "수", "목", "금"],
      enabled: true,
    },
    {
      id: "2",
      name: "주말 수면",
      bedtime: "00:00",
      wakeup: "08:00",
      days: ["토", "일"],
      enabled: false,
    },
  ]);

  useEffect(() => {
    if (route.params?.newSchedule) {
      const newSchedule = {
        ...route.params.newSchedule,
        id: Date.now().toString(),
        enabled: true,
      };
      setSchedules((prev) => [...prev, newSchedule]);
      navigation.setParams({ newSchedule: undefined });
    }

    if (route.params?.editedSchedule) {
      const { editedSchedule } = route.params;
      setSchedules((prev) =>
        prev.map((schedule) =>
          schedule.id === editedSchedule.id ? editedSchedule : schedule
        )
      );
      navigation.setParams({ editedSchedule: undefined });
    }
  }, [route.params]);

  const toggleSchedule = (id) => {
    setSchedules((prev) =>
      prev.map((schedule) =>
        schedule.id === id
          ? { ...schedule, enabled: !schedule.enabled }
          : schedule
      )
    );
  };

  const deleteSchedule = (id) => {
    setSchedules((prev) => prev.filter((schedule) => schedule.id !== id));
  };

  const renderScheduleItem = ({ item }) => (
    <View style={styles.scheduleCard}>
      <View style={styles.scheduleHeader}>
        <View style={styles.scheduleInfo}>
          <Text
            style={[
              styles.scheduleName,
              { color: item.enabled ? "#fff" : "#777" },
            ]}
          >
            {item.name}
          </Text>
          <Text
            style={[
              styles.scheduleDays,
              { color: item.enabled ? "#7bb6ff" : "#555" },
            ]}
          >
            {item.days.join(", ")}
          </Text>
        </View>
        <Switch
          trackColor={{ false: "#444", true: "#2196F3" }}
          thumbColor={item.enabled ? "#fff" : "#ccc"}
          value={item.enabled}
          onValueChange={() => toggleSchedule(item.id)}
        />
      </View>

      <View style={styles.timeContainer}>
        <View style={styles.timeItem}>
          <Image
            source={{ uri: "https://i.ibb.co/yhqBzQW/bed-icon.png" }}
            style={styles.timeIcon}
          />
          <Text style={styles.timeLabel}>BEDTIME</Text>
          <Text
            style={[
              styles.timeValue,
              { color: item.enabled ? "#fff" : "#777" },
            ]}
          >
            {item.bedtime}
          </Text>
        </View>

        <View style={styles.timeItem}>
          <Image
            source={{ uri: "https://i.ibb.co/rQYh2Mz/alarm-icon.png" }}
            style={styles.timeIcon}
          />
          <Text style={styles.timeLabel}>WAKE UP</Text>
          <Text
            style={[
              styles.timeValue,
              { color: item.enabled ? "#fff" : "#777" },
            ]}
          >
            {item.wakeup}
          </Text>
        </View>
      </View>

      <View style={styles.scheduleActions}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() =>
            navigation.navigate("AddSleepSchedule", { editSchedule: item })
          }
        >
          <Text style={styles.editButtonText}>편집</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => deleteSchedule(item.id)}
        >
          <Text style={styles.deleteButtonText}>삭제</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image
            source={{ uri: "https://i.ibb.co/Dg5C8MzW/Arrow.png" }}
            style={styles.headerIcon}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>수면 스케줄</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.mainToggle}>
        <View style={styles.toggleInfo}>
          <Text style={styles.toggleTitle}>수면 스케줄</Text>
          <Text style={styles.toggleSubtitle}>
            설정된 시간에 수면 알림을 받습니다
          </Text>
        </View>
        <Switch
          trackColor={{ false: "#444", true: "#2196F3" }}
          thumbColor={scheduleEnabled ? "#fff" : "#ccc"}
          value={scheduleEnabled}
          onValueChange={setScheduleEnabled}
        />
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>내 수면 스케줄</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate("AddSleepSchedule")}
        >
          <Image
            source={{ uri: "https://i.ibb.co/zTGMMC5s/ic-round-plus.png" }}
            style={styles.addIcon}
          />
        </TouchableOpacity>
      </View>

      <FlatList
        data={schedules}
        keyExtractor={(item) => item.id}
        renderItem={renderScheduleItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
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
    flex: 1,
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginRight: 24,
  },
  placeholder: {
    width: 24,
  },
  mainToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: "#1e1e1e",
    marginHorizontal: 20,
    borderRadius: 15,
    marginBottom: 30,
  },
  toggleInfo: {
    flex: 1,
  },
  toggleTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 5,
  },
  toggleSubtitle: {
    fontSize: 14,
    color: "#aaa",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  addButton: {
    backgroundColor: "#2196F3",
    borderRadius: 20,
    padding: 8,
  },
  addIcon: {
    width: 20,
    height: 20,
    tintColor: "#fff",
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  scheduleCard: {
    backgroundColor: "#1e1e1e",
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
  },
  scheduleHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  scheduleInfo: {
    flex: 1,
  },
  scheduleName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  scheduleDays: {
    fontSize: 14,
  },
  timeContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  timeItem: {
    alignItems: "center",
  },
  timeIcon: {
    width: 24,
    height: 24,
    tintColor: "#7bb6ff",
    marginBottom: 8,
  },
  timeLabel: {
    fontSize: 12,
    color: "#aaa",
    marginBottom: 5,
  },
  timeValue: {
    fontSize: 24,
    fontWeight: "bold",
  },
  scheduleActions: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  editButton: {
    backgroundColor: "#2196F3",
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 20,
  },
  editButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  deleteButton: {
    backgroundColor: "#ff4444",
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 20,
  },
  deleteButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
