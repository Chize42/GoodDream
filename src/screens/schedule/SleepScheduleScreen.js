// src/screens/schedule/SleepScheduleScreen.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  SafeAreaView,
  StatusBar,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../contexts/AuthContext";
import {
  getSleepSchedules,
  deleteSleepSchedules,
  toggleScheduleEnabled as toggleScheduleEnabledService,
  saveSleepSchedule,
  updateSleepSchedule,
} from "../../services/sleepScheduleService";
import {
  requestFCMPermissions,
  getFCMToken,
  saveFCMTokenToFirestore,
} from "../../services/firebaseMessagingService";
import { formatDaysString } from "../../utils/dayUtils";

const SleepScheduleScreen = ({ navigation, route }) => {
  const { user } = useAuth();

  const [isMainSleepEnabled, setIsMainSleepEnabled] = useState(true);
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [sleepSchedules, setSleepSchedules] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 컴포넌트 마운트 시 데이터 로드 및 알림 설정
  useEffect(() => {
    if (user?.uid) {
      loadSchedules();
      initializeNotifications();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  // 새로운 스케줄이나 편집된 스케줄이 있을 때 처리
  useEffect(() => {
    const handleParams = async () => {
      if (route.params?.newSchedule) {
        const newSchedule = route.params.newSchedule;
        navigation.setParams({ newSchedule: null });
        await handleNewSchedule(newSchedule);
      }

      if (route.params?.editedSchedule) {
        const editedSchedule = route.params.editedSchedule;
        navigation.setParams({ editedSchedule: null });
        await handleEditedSchedule(editedSchedule);
      }
    };

    handleParams();
  }, [route.params]);

  const loadSchedules = async () => {
    try {
      if (!user?.uid) {
        console.log("❌ 사용자 정보 없음");
        return;
      }

      setIsLoading(true);
      console.log("📖 스케줄 로드 시작:", user.uid);
      const schedules = await getSleepSchedules(user.uid);
      setSleepSchedules(schedules);
      console.log("✅ 스케줄 로드 완료:", schedules.length);
    } catch (error) {
      Alert.alert("오류", "스케줄을 불러오는데 실패했습니다.");
      console.error("스케줄 로드 실패:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ FCM 초기화 함수
  const initializeNotifications = async () => {
    try {
      // FCM 권한 요청
      const granted = await requestFCMPermissions();

      if (!granted) {
        console.log("❌ FCM 권한 거부됨");
        Alert.alert("알림 설정", "알림 권한이 필요합니다.");
        return;
      }

      // FCM 토큰 가져오기 및 저장
      const fcmToken = await getFCMToken();
      if (fcmToken && user?.uid) {
        await saveFCMTokenToFirestore(user.uid, fcmToken);
        console.log("✅ FCM 초기화 완료");
      }
    } catch (error) {
      console.error("❌ FCM 초기화 실패:", error);
      Alert.alert("알림 설정", "알림 권한 설정에 실패했습니다.");
    }
  };

  const handleNewSchedule = async (newSchedule) => {
    try {
      if (!user?.uid) {
        Alert.alert("오류", "로그인이 필요합니다");
        return;
      }

      console.log("📝 새 스케줄 저장 시작");
      console.log("👤 userId:", user.uid);
      console.log("📋 scheduleData:", newSchedule);

      const savedSchedule = await saveSleepSchedule(user.uid, newSchedule);

      console.log("✅ 저장된 스케줄:", savedSchedule);

      // 중복 제거 후 추가
      setSleepSchedules((prev) => {
        const filtered = prev.filter((s) => s.id !== savedSchedule.id);
        return [savedSchedule, ...filtered];
      });

      Alert.alert("성공", "스케줄이 저장되고 알림이 설정되었습니다!");
    } catch (error) {
      Alert.alert("오류", "스케줄 저장에 실패했습니다.");
      console.error("스케줄 저장 실패:", error);
    }
  };

  const handleEditedSchedule = async (editedSchedule) => {
    try {
      if (!user?.uid) {
        Alert.alert("오류", "로그인이 필요합니다");
        return;
      }

      const updatedSchedule = await updateSleepSchedule(
        user.uid,
        editedSchedule.id,
        editedSchedule
      );
      setSleepSchedules((prev) =>
        prev.map((schedule) =>
          schedule.id === editedSchedule.id ? updatedSchedule : schedule
        )
      );
      Alert.alert("성공", "스케줄이 수정되고 알림이 재설정되었습니다!");
    } catch (error) {
      Alert.alert("오류", "스케줄 수정에 실패했습니다.");
      console.error("스케줄 수정 실패:", error);
    }
  };

  const toggleDeleteMode = () => {
    setIsDeleteMode(!isDeleteMode);
    setSelectedItems([]);
  };

  const toggleItemSelection = (id) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter((item) => item !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };

  const deleteSelectedItems = async () => {
    try {
      if (!user?.uid) {
        Alert.alert("오류", "로그인이 필요합니다");
        return;
      }

      setIsLoading(true);

      await deleteSleepSchedules(user.uid, selectedItems);
      setSleepSchedules(
        sleepSchedules.filter(
          (schedule) => !selectedItems.includes(schedule.id)
        )
      );
      setSelectedItems([]);

      if (
        sleepSchedules.filter(
          (schedule) => !selectedItems.includes(schedule.id)
        ).length === 0
      ) {
        setIsDeleteMode(false);
      }

      Alert.alert("성공", "선택한 스케줄이 삭제되고 알림이 취소되었습니다.");
    } catch (error) {
      Alert.alert("오류", "스케줄 삭제에 실패했습니다.");
      console.error("스케줄 삭제 실패:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleScheduleEnabled = async (id) => {
    if (!isDeleteMode) {
      try {
        if (!user?.uid) {
          Alert.alert("오류", "로그인이 필요합니다");
          return;
        }

        const updatedSchedule = await toggleScheduleEnabledService(
          user.uid,
          id
        );
        setSleepSchedules(
          sleepSchedules.map((schedule) =>
            schedule.id === id ? updatedSchedule : schedule
          )
        );

        const statusText = updatedSchedule.enabled ? "활성화" : "비활성화";
        Alert.alert("알림", `스케줄이 ${statusText}되었습니다.`);
      } catch (error) {
        Alert.alert("오류", "스케줄 설정 변경에 실패했습니다.");
        console.error("스케줄 토글 실패:", error);
      }
    }
  };

  // ✅ 메인 토글 - FCM 방식으로 수정
  const handleMainSleepEnabledChange = async (value) => {
    try {
      setIsMainSleepEnabled(value);

      if (value) {
        // 알림 활성화 - FCM 권한 재확인
        const granted = await requestFCMPermissions();
        if (granted) {
          Alert.alert("알림 활성화", "수면 스케줄 알림이 활성화되었습니다.");
        } else {
          Alert.alert("오류", "알림 권한이 필요합니다.");
          setIsMainSleepEnabled(false);
        }
      } else {
        // 알림 비활성화 - FCM에서는 서버가 알림 관리하므로 안내만
        Alert.alert(
          "알림 비활성화",
          "수면 알림이 비활성화되었습니다.\n개별 스케줄을 끄거나 삭제하여 관리할 수 있습니다."
        );
      }
    } catch (error) {
      console.error("메인 토글 처리 실패:", error);
      Alert.alert("오류", "알림 설정 변경에 실패했습니다.");
      setIsMainSleepEnabled(!value);
    }
  };

  const getItemStyle = (id) => {
    if (!isDeleteMode) return styles.scheduleItem;

    if (selectedItems.includes(id)) {
      return [styles.scheduleItem, styles.selectedItem];
    } else {
      return [styles.scheduleItem, styles.selectableItem];
    }
  };

  const handleSchedulePress = (schedule) => {
    if (!isDeleteMode && isMainSleepEnabled) {
      navigation.navigate("AddSleepSchedule", {
        editSchedule: schedule,
        existingSchedules: sleepSchedules,
      });
    }
  };

  const handleAddSchedule = () => {
    if (!isMainSleepEnabled) {
      Alert.alert("알림", "먼저 수면 스케줄을 활성화해주세요.");
      return;
    }

    navigation.navigate("AddSleepSchedule", {
      existingSchedules: sleepSchedules,
    });
  };

  // 로그인 안 된 경우 처리
  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View
          style={[
            styles.content,
            { justifyContent: "center", alignItems: "center" },
          ]}
        >
          <Text style={{ color: "#9ca3af", fontSize: 16 }}>
            로그인이 필요합니다
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#181820" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate("Home")}
        >
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>수면 스케줄</Text>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={toggleDeleteMode}
          >
            <Ionicons
              name="trash-outline"
              size={24}
              color={isDeleteMode ? "#007AFF" : "#fff"}
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.content}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>스케줄을 불러오는 중...</Text>
          </View>
        ) : (
          <>
            {/* 수면 스케줄 메인 토글 */}
            <View style={styles.mainToggleContainer}>
              <View>
                <Text style={styles.mainToggleTitle}>수면 스케줄</Text>
                <Text style={styles.mainToggleSubtitle}>
                  설정된 시간에 수면 알림을 받습니다
                </Text>
              </View>
              <Switch
                value={isMainSleepEnabled}
                onValueChange={handleMainSleepEnabledChange}
                trackColor={{ false: "#3A3A3C", true: "#007AFF" }}
                thumbColor="#fff"
              />
            </View>

            {/* 내 수면 스케줄 섹션 */}
            <Text
              style={[
                styles.sectionTitle,
                !isMainSleepEnabled && styles.disabledText,
              ]}
            >
              내 수면 스케줄
            </Text>

            {sleepSchedules.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  등록된 수면 스케줄이 없습니다.
                </Text>
                <Text style={styles.emptySubText}>
                  새 스케줄을 추가해보세요.
                </Text>
              </View>
            ) : (
              sleepSchedules.map((schedule) => (
                <TouchableOpacity
                  key={schedule.id}
                  style={[
                    getItemStyle(schedule.id),
                    !isMainSleepEnabled && styles.disabledScheduleItem,
                  ]}
                  onPress={() => {
                    if (isDeleteMode && isMainSleepEnabled) {
                      toggleItemSelection(schedule.id);
                    } else if (!isDeleteMode && isMainSleepEnabled) {
                      handleSchedulePress(schedule);
                    }
                  }}
                  activeOpacity={
                    (isDeleteMode && isMainSleepEnabled) ||
                    (!isDeleteMode && isMainSleepEnabled)
                      ? 0.7
                      : 1
                  }
                  disabled={!isMainSleepEnabled}
                >
                  <View style={styles.scheduleHeader}>
                    <View>
                      <Text
                        style={[
                          styles.scheduleName,
                          !isMainSleepEnabled && styles.disabledText,
                        ]}
                      >
                        {schedule.name}
                      </Text>
                      <Text
                        style={[
                          styles.scheduleSubtitle,
                          !isMainSleepEnabled && styles.disabledSubtitle,
                        ]}
                      >
                        {formatDaysString(schedule.days)}
                      </Text>
                    </View>
                    {!isDeleteMode && (
                      <Switch
                        value={isMainSleepEnabled && schedule.enabled}
                        onValueChange={() =>
                          handleToggleScheduleEnabled(schedule.id)
                        }
                        trackColor={{
                          false: isMainSleepEnabled ? "#3A3A3C" : "#2A2A2A",
                          true: "#007AFF",
                        }}
                        thumbColor={isMainSleepEnabled ? "#fff" : "#666"}
                        disabled={!isMainSleepEnabled}
                      />
                    )}
                  </View>

                  <View style={styles.timeContainer}>
                    <View style={styles.timeSection}>
                      <Text
                        style={[
                          styles.timeLabel,
                          !isMainSleepEnabled && styles.disabledText,
                        ]}
                      >
                        BEDTIME
                      </Text>
                      <Text
                        style={[
                          styles.timeValue,
                          !isMainSleepEnabled && styles.disabledText,
                        ]}
                      >
                        {schedule.bedtime}
                      </Text>
                    </View>
                    <View style={styles.timeSection}>
                      <Text
                        style={[
                          styles.timeLabel,
                          !isMainSleepEnabled && styles.disabledText,
                        ]}
                      >
                        WAKE UP
                      </Text>
                      <Text
                        style={[
                          styles.timeValue,
                          !isMainSleepEnabled && styles.disabledText,
                        ]}
                      >
                        {schedule.wakeup}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            )}

            {/* 추가 버튼 */}
            {!isDeleteMode && isMainSleepEnabled && (
              <TouchableOpacity
                style={styles.addButton}
                onPress={handleAddSchedule}
              >
                <Ionicons name="add" size={24} color="#007AFF" />
              </TouchableOpacity>
            )}
          </>
        )}
      </View>

      {/* 삭제 모드일 때 하단 버튼들 */}
      {isDeleteMode && (
        <View style={styles.bottomButtons}>
          <TouchableOpacity
            style={styles.bottomButton}
            onPress={() => setIsDeleteMode(false)}
          >
            <Text style={styles.bottomButtonText}>취소</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.bottomButton,
              selectedItems.length > 0 && styles.deleteButtonActive,
            ]}
            onPress={deleteSelectedItems}
            disabled={selectedItems.length === 0}
          >
            <Text
              style={[
                styles.bottomButtonText,
                selectedItems.length > 0 && styles.deleteButtonTextActive,
              ]}
            >
              삭제
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

// styles는 동일
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
    paddingTop: 8,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
  deleteButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  mainToggleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: "#3A3A3C",
    marginBottom: 24,
  },
  mainToggleTitle: {
    fontSize: 18,
    fontWeight: "500",
    color: "#fff",
    marginBottom: 4,
  },
  mainToggleSubtitle: {
    fontSize: 14,
    color: "#9ca3af",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#fff",
    marginBottom: 16,
  },
  scheduleItem: {
    backgroundColor: "#2a2d47",
    borderRadius: 16,
    padding: 21,
    marginBottom: 12,
  },
  selectableItem: {
    borderWidth: 1,
    borderColor: "#fff",
  },
  selectedItem: {
    borderWidth: 2,
    borderColor: "#007AFF",
  },
  scheduleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  scheduleName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#fff",
    marginBottom: 2,
  },
  scheduleSubtitle: {
    fontSize: 14,
    color: "#007AFF",
  },
  timeContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 20,
  },
  timeSection: {
    alignItems: "center",
  },
  timeLabel: {
    fontSize: 12,
    color: "#9ca3af",
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  timeValue: {
    fontSize: 32,
    fontWeight: "300",
    color: "#fff",
  },
  addButton: {
    backgroundColor: "#2a2d47",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    marginBottom: 12,
  },
  bottomButtons: {
    flexDirection: "row",
    borderTopWidth: 0.5,
    borderTopColor: "#3A3A3C",
  },
  bottomButton: {
    flex: 1,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  bottomButtonText: {
    fontSize: 16,
    color: "#007AFF",
  },
  deleteButtonActive: {
    backgroundColor: "#FF3B30",
  },
  deleteButtonTextActive: {
    color: "#fff",
    fontWeight: "600",
  },
  disabledScheduleItem: {
    backgroundColor: "#1a1a1a",
    opacity: 0.6,
  },
  disabledText: {
    color: "#666",
  },
  disabledSubtitle: {
    color: "#444",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#9ca3af",
    fontSize: 16,
    marginTop: 16,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    color: "#9ca3af",
    fontSize: 16,
    marginBottom: 8,
  },
  emptySubText: {
    color: "#666",
    fontSize: 14,
  },
});
export default SleepScheduleScreen;
