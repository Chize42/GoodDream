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
import * as Notifications from "expo-notifications";
import {
  getSleepSchedules,
  deleteSleepSchedules,
  toggleScheduleEnabled as toggleScheduleEnabledService,
  saveSleepSchedule,
  updateSleepSchedule,
} from "../../services/sleepScheduleService";
import {
  sendTestNotification,
  getScheduledNotifications,
  cancelAllScheduleNotifications,
  requestNotificationPermissions,
} from "../../services/localNotificationService";
import { formatDaysString } from "../../utils/dayUtils";

const SleepScheduleScreen = ({ navigation, route }) => {
  const [isMainSleepEnabled, setIsMainSleepEnabled] = useState(true);
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [sleepSchedules, setSleepSchedules] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 임시 사용자 ID (실제 앱에서는 인증 시스템에서 가져와야 함)
  const userId = "user123";

  // 컴포넌트 마운트 시 데이터 로드 및 알림 설정
  useEffect(() => {
    loadSchedules();
    initializeNotifications();
  }, []);

  // 새로운 스케줄이나 편집된 스케줄이 있을 때 처리
  useEffect(() => {
    if (route.params?.newSchedule) {
      handleNewSchedule(route.params.newSchedule);
      navigation.setParams({ newSchedule: null });
    }
    if (route.params?.editedSchedule) {
      handleEditedSchedule(route.params.editedSchedule);
      navigation.setParams({ editedSchedule: null });
    }
  }, [route.params]);

  const loadSchedules = async () => {
    try {
      setIsLoading(true);
      const schedules = await getSleepSchedules(userId);
      setSleepSchedules(schedules);
    } catch (error) {
      Alert.alert("오류", "스케줄을 불러오는데 실패했습니다.");
      console.error("스케줄 로드 실패:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const initializeNotifications = async () => {
    try {
      // 현재 권한 상태 먼저 확인
      const { status } = await Notifications.getPermissionsAsync();
      console.log("현재 알림 권한 상태:", status);

      if (status !== "granted") {
        await requestNotificationPermissions();
      }

      console.log("알림 권한 확인 완료");
    } catch (error) {
      console.error("알림 권한 확인 실패:", error);
      Alert.alert("알림 설정", "알림 권한 설정에 실패했습니다.");
    }
  };

  const handleNewSchedule = async (newSchedule) => {
    try {
      const savedSchedule = await saveSleepSchedule(newSchedule, userId);
      setSleepSchedules((prev) => [savedSchedule, ...prev]);
      Alert.alert("성공", "스케줄이 저장되고 알림이 설정되었습니다!");
    } catch (error) {
      Alert.alert("오류", "스케줄 저장에 실패했습니다.");
      console.error("스케줄 저장 실패:", error);
    }
  };

  const handleEditedSchedule = async (editedSchedule) => {
    try {
      const updatedSchedule = await updateSleepSchedule(
        editedSchedule.id,
        editedSchedule,
        userId
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
      setIsLoading(true);

      await deleteSleepSchedules(selectedItems, userId);
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
        const updatedSchedule = await toggleScheduleEnabledService(id, userId);
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
  const handleMainSleepEnabledChange = async (value) => {
    try {
      setIsMainSleepEnabled(value);

      if (value) {
        // 메인 토글 켜기: 모든 스케줄 알림 재설정
        await setupNotifications(userId);
        Alert.alert("알림 활성화", "수면 스케줄 알림이 활성화되었습니다.");
      } else {
        // 메인 토글 끄기: 모든 알림 취소
        await cancelAllScheduleNotifications();
        Alert.alert("알림 비활성화", "모든 수면 알림이 비활성화되었습니다.");
      }
    } catch (error) {
      console.error("메인 토글 처리 실패:", error);
      Alert.alert("오류", "알림 설정 변경에 실패했습니다.");
      setIsMainSleepEnabled(!value); // 원래 상태로 되돌리기
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

  // 테스트 함수들
  const handleTestNotification = async () => {
    try {
      await sendTestNotification();
      Alert.alert("테스트", "2초 후 테스트 알림이 표시됩니다!");
    } catch (error) {
      Alert.alert("오류", "테스트 알림 전송에 실패했습니다.");
      console.error("테스트 알림 오류:", error);
    }
  };

  const checkScheduledNotifications = async () => {
    try {
      const notifications = await getScheduledNotifications();
      console.log("현재 스케줄된 알림들:", notifications);
      Alert.alert(
        "알림 확인",
        `현재 ${notifications.length}개의 알림이 스케줄되어 있습니다.`
      );
    } catch (error) {
      Alert.alert("오류", "알림 확인에 실패했습니다.");
      console.error("알림 확인 오류:", error);
    }
  };

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
            onPress={handleTestNotification}
            style={{ marginRight: 8, padding: 4 }}
          >
            <Text
              style={{ color: "#007AFF", fontSize: 10, textAlign: "center" }}
            >
              테스트
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={checkScheduledNotifications}
            style={{ marginRight: 8, padding: 4 }}
          >
            <Text
              style={{ color: "#007AFF", fontSize: 10, textAlign: "center" }}
            >
              확인
            </Text>
          </TouchableOpacity>
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
              /* 스케줄 아이템들 */
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
    padding: 8,
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
