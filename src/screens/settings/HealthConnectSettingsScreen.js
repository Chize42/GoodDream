// src/screens/settings/HealthConnectSettingsScreen.js

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../contexts/AuthContext";
import { useSyncContext } from "../../contexts/SyncContext";
import {
  initializeHealthConnect,
  checkHealthConnectPermissions,
} from "../../services/healthConnectService";
import {
  getSdkStatus,
  SdkAvailabilityStatus,
} from "react-native-health-connect";

export default function HealthConnectSettingsScreen({ navigation }) {
  const { user } = useAuth();
  const { syncData, isSyncing, lastSyncTime } = useSyncContext();
  const [healthConnectStatus, setHealthConnectStatus] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    initializeAndCheck();
  }, []);

  // 👇 초기화 + 상태 확인
  const initializeAndCheck = async () => {
    if (Platform.OS !== "android") {
      setHealthConnectStatus("iOS는 지원하지 않습니다");
      setChecking(false);
      return;
    }

    // 👇 먼저 초기화
    await initializeHealthConnect();

    // 👇 그 다음 상태 확인
    await checkHealthConnectStatus();
  };

  // Health Connect 상태 확인 (SDK + 권한)
  const checkHealthConnectStatus = async () => {
    try {
      if (Platform.OS !== "android") {
        setHealthConnectStatus("iOS는 지원하지 않습니다");
        setChecking(false);
        return;
      }

      const status = await getSdkStatus();

      if (status === SdkAvailabilityStatus.SDK_AVAILABLE) {
        // 👇 SDK는 사용 가능하지만, 권한이 있는지 추가 확인
        const hasPermission = await checkHealthConnectPermissions();
        setHealthConnectStatus(
          hasPermission ? "정상 연결됨" : "권한 설정 필요"
        );
      } else if (status === SdkAvailabilityStatus.SDK_UNAVAILABLE) {
        setHealthConnectStatus("설치 필요");
      } else if (
        status ===
        SdkAvailabilityStatus.SDK_UNAVAILABLE_PROVIDER_UPDATE_REQUIRED
      ) {
        setHealthConnectStatus("업데이트 필요");
      } else {
        setHealthConnectStatus("사용 불가");
      }
    } catch (error) {
      console.error("상태 확인 오류:", error);
      setHealthConnectStatus("확인 실패");
    } finally {
      setChecking(false);
    }
  };

  // 👇 Health Connect 권한 설정 - 무조건 스토어로 이동
  const handlePermissionSettings = async () => {
    try {
      if (Platform.OS !== "android") {
        Alert.alert("안내", "Health Connect는 Android에서만 사용 가능합니다.");
        return;
      }

      Alert.alert(
        "Health Connect",
        "Health Connect 앱으로 이동합니다.\n\n앱이 설치되어 있지 않다면 Play 스토어에서 설치해주세요.",
        [
          { text: "취소", style: "cancel" },
          {
            text: "이동하기",
            onPress: async () => {
              try {
                // market:// 프로토콜로 Play 스토어 앱 직접 열기
                const marketUrl =
                  "market://details?id=com.google.android.apps.healthdata";
                const canOpen = await Linking.canOpenURL(marketUrl);

                if (canOpen) {
                  await Linking.openURL(marketUrl);
                } else {
                  // Play 스토어 앱이 없으면 웹 브라우저로
                  await Linking.openURL(
                    "https://play.google.com/store/apps/details?id=com.google.android.apps.healthdata"
                  );
                }
              } catch (error) {
                console.error("스토어 열기 오류:", error);
                Alert.alert("오류", "Play 스토어를 열 수 없습니다.");
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error("권한 설정 오류:", error);
      Alert.alert("오류", "오류가 발생했습니다.");
    }
  };

  const handleDataSync = (days) => {
    const daysText =
      days === 9999 ? "전체" : days === 180 ? "6개월" : days + "일";

    Alert.alert(
      "데이터 불러오기",
      `최근 ${daysText} 데이터를 가져오시겠습니까?${
        days >= 180 ? "\n\n⚠️ 시간이 다소 걸릴 수 있습니다." : ""
      }`,
      [
        { text: "취소", style: "cancel" },
        {
          text: "확인",
          onPress: () => performSync(days),
        },
      ]
    );
  };

  // 실제 동기화 수행
  const performSync = async (days) => {
    try {
      const result = await syncData(days);

      if (result.success) {
        Alert.alert(
          "동기화 완료",
          `${result.syncedCount}개의 수면 데이터를 가져왔습니다.\n${result.updatedCount}개의 데이터가 업데이트되었습니다.`,
          [
            {
              text: "확인",
              onPress: () => {
                navigation.goBack();
              },
            },
          ]
        );
      } else {
        Alert.alert(
          "동기화 실패",
          result.error || "알 수 없는 오류가 발생했습니다."
        );
      }
    } catch (error) {
      console.error("동기화 오류:", error);
      Alert.alert("오류", "동기화 중 오류가 발생했습니다.");
    }
  };

  // 마지막 동기화 시간 포맷팅
  const formatLastSyncTime = () => {
    if (!lastSyncTime) return "동기화 기록 없음";

    const now = new Date();
    const diff = Math.floor((now.getTime() - lastSyncTime.getTime()) / 1000);

    if (diff < 60) return "방금 전";
    if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;

    const days = Math.floor(diff / 86400);
    if (days === 1) return "어제";
    if (days < 7) return `${days}일 전`;

    return lastSyncTime.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text style={{ color: "#fff", fontSize: 16 }}>
            로그인이 필요합니다
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* 헤더 */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Health Connect</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* 상태 카드 */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Ionicons name="fitness" size={24} color="#4074D8" />
            <Text style={styles.statusTitle}>연결 상태</Text>
          </View>

          {checking ? (
            <ActivityIndicator color="#4074D8" style={{ marginVertical: 10 }} />
          ) : (
            <>
              <Text
                style={[
                  styles.statusText,
                  healthConnectStatus === "권한 설정 필요" && {
                    color: "#FF9800",
                  },
                ]}
              >
                {healthConnectStatus}
              </Text>
              {lastSyncTime && (
                <Text style={styles.lastSyncText}>
                  마지막 동기화: {formatLastSyncTime()}
                </Text>
              )}
            </>
          )}
        </View>

        {/* 권한 설정 섹션 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>권한 설정</Text>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={handlePermissionSettings}
          >
            <View style={styles.menuLeft}>
              <Ionicons
                name="shield-checkmark-outline"
                size={22}
                color="#fff"
              />
              <Text style={styles.menuText}>Health Connect 권한 설정</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#aaa" />
          </TouchableOpacity>

          <View style={styles.infoBox}>
            <Ionicons
              name="information-circle-outline"
              size={16}
              color="#aaa"
            />
            <Text style={styles.infoText}>
              수면 데이터를 가져오려면 Health Connect 권한이 필요합니다.
            </Text>
          </View>
        </View>

        {/* 데이터 불러오기 섹션 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>데이터 불러오기</Text>

          <TouchableOpacity
            style={styles.syncButton}
            onPress={() => handleDataSync(30)}
            disabled={isSyncing}
          >
            <View style={styles.syncButtonContent}>
              <Ionicons name="calendar-outline" size={20} color="#fff" />
              <View style={styles.syncButtonText}>
                <Text style={styles.syncButtonTitle}>최근 30일</Text>
                <Text style={styles.syncButtonSubtitle}>권장</Text>
              </View>
            </View>
            {isSyncing ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Ionicons name="download-outline" size={20} color="#fff" />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.syncButton}
            onPress={() => handleDataSync(180)}
            disabled={isSyncing}
          >
            <View style={styles.syncButtonContent}>
              <Ionicons name="time-outline" size={20} color="#fff" />
              <View style={styles.syncButtonText}>
                <Text style={styles.syncButtonTitle}>최근 6개월</Text>
                <Text style={styles.syncButtonSubtitle}>
                  시간이 다소 걸립니다
                </Text>
              </View>
            </View>
            {isSyncing ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Ionicons name="download-outline" size={20} color="#fff" />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.syncButton}
            onPress={() => handleDataSync(9999)}
            disabled={isSyncing}
          >
            <View style={styles.syncButtonContent}>
              <Ionicons name="albums-outline" size={20} color="#fff" />
              <View style={styles.syncButtonText}>
                <Text style={styles.syncButtonTitle}>전체 데이터</Text>
                <Text style={styles.syncButtonSubtitle}>최대 1년치 데이터</Text>
              </View>
            </View>
            {isSyncing ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Ionicons name="download-outline" size={20} color="#fff" />
            )}
          </TouchableOpacity>

          <View style={styles.warningBox}>
            <Ionicons name="warning-outline" size={16} color="#FF9800" />
            <Text style={styles.warningText}>
              대량의 데이터를 불러오면 시간이 오래 걸릴 수 있습니다.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  scroll: {
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#fff",
  },
  statusCard: {
    backgroundColor: "#1e1e1e",
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  statusHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginLeft: 8,
  },
  statusText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#4074D8",
    marginTop: 8,
  },
  lastSyncText: {
    fontSize: 14,
    color: "#aaa",
    marginTop: 8,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#1e1e1e",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  menuLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuText: {
    fontSize: 16,
    color: "#fff",
    marginLeft: 12,
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "rgba(64, 116, 216, 0.1)",
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: "#aaa",
    marginLeft: 8,
    lineHeight: 18,
  },
  syncButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#1e1e1e",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  syncButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  syncButtonText: {
    marginLeft: 12,
  },
  syncButtonTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  syncButtonSubtitle: {
    fontSize: 13,
    color: "#aaa",
    marginTop: 2,
  },
  warningBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "rgba(255, 152, 0, 0.1)",
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: "#FF9800",
    marginLeft: 8,

    lineHeight: 18,
  },
});
