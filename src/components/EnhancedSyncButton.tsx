// src/components/EnhancedSyncButton.jsx
import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ViewStyle,
} from "react-native";
import { useSyncContext } from "../contexts/SyncContext";

interface EnhancedSyncButtonProps {
  onSyncComplete?: (data: any) => void;
  style?: ViewStyle | ViewStyle[];
}

const EnhancedSyncButton: React.FC<EnhancedSyncButtonProps> = ({
  onSyncComplete,
  style,
}) => {
  const {
    isSyncing,
    lastSyncTime,
    syncError,
    isHealthConnectAvailable,
    syncData,
  } = useSyncContext();

  const handleSync = async (days) => {
    const result = await syncData(days);

    if (result.success) {
      Alert.alert(
        "✅ 동기화 완료",
        `${result.syncedCount}개의 수면 기록을 가져왔습니다.\n${result.updatedCount}개의 데이터가 업데이트되었습니다.`,
        [
          {
            text: "확인",
            onPress: () => {
              if (onSyncComplete) {
                onSyncComplete(result.data);
              }
            },
          },
        ]
      );
    } else {
      let errorMessage = result.error || "알 수 없는 오류가 발생했습니다.";

      if (errorMessage.includes("설치되지 않았습니다")) {
        errorMessage =
          "Health Connect 앱이 설치되지 않았습니다.\n\nGoogle Play에서 'Health Connect'를 검색하여 설치해주세요.";
      } else if (errorMessage.includes("권한")) {
        errorMessage =
          "Health Connect 접근 권한이 필요합니다.\n\n설정 > 앱 > 수면 트래커 > 권한에서 Health Connect 권한을 허용해주세요.";
      } else if (errorMessage.includes("업데이트")) {
        errorMessage =
          "Health Connect 업데이트가 필요합니다.\n\nGoogle Play에서 Health Connect를 최신 버전으로 업데이트해주세요.";
      }

      Alert.alert("❌ 동기화 실패", errorMessage);
    }
  };

  const showSyncOptions = () => {
    Alert.alert("Health Connect 동기화", "어떤 기간의 데이터를 가져올까요?", [
      {
        text: "최근 7일",
        onPress: () => handleSync(7),
      },
      {
        text: "최근 30일",
        onPress: () => handleSync(30),
      },
      {
        text: "최근 90일",
        onPress: () => handleSync(90),
      },
      {
        text: "취소",
        style: "cancel",
      },
    ]);
  };

  const showHealthConnectInfo = () => {
    Alert.alert(
      "Health Connect 정보",
      "Health Connect는 Google의 건강 데이터 통합 플랫폼입니다.\n\n" +
        "웨어러블 기기나 다른 건강 앱의 수면 데이터를 이 앱으로 가져올 수 있습니다.\n\n" +
        "사용하려면 먼저 Health Connect 앱을 설치해주세요.",
      [
        {
          text: "확인",
        },
      ]
    );
  };

  if (!isHealthConnectAvailable) {
    return (
      <View style={[styles.container, style]}>
        <TouchableOpacity
          style={[styles.button, styles.buttonDisabled]}
          onPress={showHealthConnectInfo}
        >
          <Text style={styles.icon}>ℹ️</Text>
          <Text style={styles.buttonText}>Health Connect (Android 전용)</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        style={[styles.button, isSyncing && styles.buttonDisabled]}
        onPress={showSyncOptions}
        disabled={isSyncing}
      >
        {isSyncing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color="#fff" size="small" />
            <Text style={styles.loadingText}>동기화 중...</Text>
          </View>
        ) : (
          <>
            <Text style={styles.icon}>🔄</Text>
            <Text style={styles.buttonText}>Health Connect 동기화</Text>
          </>
        )}
      </TouchableOpacity>

      {lastSyncTime && !syncError && (
        <Text style={styles.syncTimeText}>
          마지막 동기화: {formatSyncTime(lastSyncTime)}
        </Text>
      )}

      {syncError && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorText}>{syncError}</Text>
        </View>
      )}
    </View>
  );
};

const formatSyncTime = (date: Date) => {
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diff < 60) return "방금 전";
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;

  const days = Math.floor(diff / 86400);
  if (days === 1) return "어제";
  if (days < 7) return `${days}일 전`;

  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
    alignItems: "center",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#007AFF",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minWidth: 250,
  },
  buttonDisabled: {
    backgroundColor: "#A0A0A0",
    opacity: 0.7,
  },
  icon: {
    fontSize: 22,
    marginRight: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  loadingText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 10,
  },
  syncTimeText: {
    marginTop: 8,
    fontSize: 13,
    color: "#666",
    fontWeight: "500",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#FFE5E5",
    borderRadius: 8,
  },
  errorIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  errorText: {
    fontSize: 12,
    color: "#D32F2F",
    flex: 1,
  },
});

export default EnhancedSyncButton;
