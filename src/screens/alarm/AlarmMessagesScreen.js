import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Image,
} from "react-native";

export default function AlarmMessagesScreen({ route, navigation }) {
  const { initialSleepAlarms, initialWakeAlarms } = route.params;
  const [selectedTab, setSelectedTab] = useState("sleep");
  const [checkedIds, setCheckedIds] = useState([]);

  const handleCheck = (id) => {
    setCheckedIds((prev) =>
      prev.includes(id)
        ? prev.filter((checkedId) => checkedId !== id)
        : [...prev, id]
    );
  };

  const handleDelete = () => {
    navigation.navigate("Alarm", {
      deletedIds: checkedIds,
      alarmType: selectedTab,
    });
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  const alarms =
    selectedTab === "sleep" ? initialSleepAlarms : initialWakeAlarms;

  const renderAlarmItem = ({ item }) => {
    const checked = checkedIds.includes(item.id);
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        style={[styles.alarmBox, checked && styles.alarmBoxChecked]}
        onPress={() => handleCheck(item.id)}
      >
        <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
          {checked && (
            <Image
              source={{
                uri: "https://i.ibb.co/5XmtK1qF/iconamoon-check-bold.png",
              }}
              style={{ width: 24, height: 24 }}
            />
          )}
        </View>
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text
            style={[
              styles.alarmTime,
              { color: item.enabled ? "white" : "#777" },
            ]}
          >
            {item.time}
          </Text>
          <Text
            style={{ color: item.enabled ? "#7bb6ff" : "#444", marginTop: 3 }}
          >
            {item.days.join(", ")}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.navigate("Alarm")}>
            <Image
              source={{ uri: "https://i.ibb.co/Dg5C8MzW/Arrow.png" }}
              style={styles.icon}
            />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>알람 삭제</Text>
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
      </View>
      <FlatList
        data={alarms}
        renderItem={renderAlarmItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingVertical: 14, paddingBottom: 100 }}
      />
      <View style={styles.bottomRow}>
        <TouchableOpacity style={styles.bottomBtn} onPress={handleCancel}>
          <Text style={styles.bottomBtnText}>취소</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomBtn} onPress={handleDelete}>
          <Text style={[styles.bottomBtnText, { color: "#FF5454" }]}>삭제</Text>
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
    borderWidth: 2,
    borderColor: "transparent",
  },
  alarmBoxChecked: {
    borderColor: "#347CFF",
  },
  alarmTime: {
    fontSize: 29,
    fontWeight: "600",
  },
  checkbox: {
    width: 25,
    height: 25,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#d3d3d3",
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: {
    borderColor: "#347CFF",
    backgroundColor: "#347CFF",
  },
  bottomRow: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 36,
    paddingBottom: 24,
    paddingTop: 12,
    backgroundColor: "#111",
  },
  bottomBtn: {
    flex: 1,
    alignItems: "center",
  },
  bottomBtnText: {
    color: "#fff",
    fontSize: 19,
    fontWeight: "bold",
    letterSpacing: 2,
  },
});
