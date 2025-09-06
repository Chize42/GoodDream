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

export default function AlarmScreen({ navigation, route }) {
  const [selectedTab, setSelectedTab] = useState("sleep");
  const [sleepAlarms, setSleepAlarms] = useState([
    {
      id: "1",
      time: "PM 10:30",
      enabled: true,
      days: ["수", "목", "금"],
      name: "평일 취침",
    },
    {
      id: "2",
      time: "PM 11:30",
      enabled: false,
      days: ["수"],
      name: "늦은 취침",
    },
  ]);
  const [wakeAlarms, setWakeAlarms] = useState([
    {
      id: "1",
      time: "AM 07:00",
      enabled: true,
      days: ["월", "화", "수", "목", "금"],
      name: "평일 기상",
    },
    {
      id: "2",
      time: "AM 08:30",
      enabled: false,
      days: ["토", "일"],
      name: "주말 늦잠",
    },
  ]);

  useEffect(() => {
    if (route.params?.deletedIds) {
      const { deletedIds, alarmType } = route.params;
      if (alarmType === "sleep") {
        setSleepAlarms((current) =>
          current.filter((alarm) => !deletedIds.includes(alarm.id))
        );
      } else {
        setWakeAlarms((current) =>
          current.filter((alarm) => !deletedIds.includes(alarm.id))
        );
      }
      navigation.setParams({ deletedIds: undefined, alarmType: undefined });
    }

    if (route.params?.newAlarm) {
      const { newAlarm } = route.params;
      const alarmToAdd = {
        ...newAlarm,
        id: Date.now().toString(),
        enabled: true,
      };

      if (alarmToAdd.type === "sleep") {
        setSleepAlarms((current) => [alarmToAdd, ...current]);
      } else {
        setWakeAlarms((current) => [alarmToAdd, ...current]);
      }
      navigation.setParams({ newAlarm: undefined });
    }
  }, [route.params?.deletedIds, route.params?.newAlarm]);

  const handleToggle = (id) => {
    if (selectedTab === "sleep") {
      setSleepAlarms((alarms) =>
        alarms.map((alarm) =>
          alarm.id === id ? { ...alarm, enabled: !alarm.enabled } : alarm
        )
      );
    } else {
      setWakeAlarms((alarms) =>
        alarms.map((alarm) =>
          alarm.id === id ? { ...alarm, enabled: !alarm.enabled } : alarm
        )
      );
    }
  };

  const renderAlarmItem = ({ item }) => (
    <View style={styles.alarmBox}>
      <View>
        <Text
          style={[styles.alarmTime, { color: item.enabled ? "white" : "#777" }]}
        >
          {item.time}
        </Text>
        <Text
          style={{ color: item.enabled ? "#7bb6ff" : "#444", marginTop: 3 }}
        >
          {item.enabled && item.name ? `${item.name} | ` : ""}
          {item.days.join(", ")}
        </Text>
      </View>
      <Switch
        trackColor={{ false: "#444", true: "#2196F3" }}
        thumbColor={item.enabled ? "#fff" : "#ccc"}
        value={item.enabled}
        onValueChange={() => handleToggle(item.id)}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate("Home")}>
          <Image
            source={{ uri: "https://i.ibb.co/Dg5C8MzW/Arrow.png" }}
            style={styles.icon}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>알람 설정</Text>
        <View style={styles.actionsRow}>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("AlarmMessages", {
                initialSleepAlarms: sleepAlarms,
                initialWakeAlarms: wakeAlarms,
              })
            }
          >
            <Image
              source={{
                uri: "https://i.ibb.co/zhDqv5hR/ic-baseline-delete.png",
              }}
              style={[styles.icon, { marginRight: 16 }]}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate("AddEditAlarm")}>
            <Image
              source={{ uri: "https://i.ibb.co/zTGMMC5s/ic-round-plus.png" }}
              style={styles.icon}
            />
          </TouchableOpacity>
        </View>
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
      <FlatList
        data={selectedTab === "sleep" ? sleepAlarms : wakeAlarms}
        keyExtractor={(item) => item.id}
        renderItem={renderAlarmItem}
        contentContainerStyle={{ paddingVertical: 14 }}
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
    marginLeft: 45,
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    width: 28,
    height: 28,
  },
  tabRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 15,
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
  alarmBox: {
    backgroundColor: "#232323",
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 18,
    justifyContent: "space-between",
  },
  alarmTime: {
    fontSize: 29,
    fontWeight: "600",
  },
});
