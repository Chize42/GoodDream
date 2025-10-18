// src/contexts/SyncContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "./AuthContext";
import { syncDateRange } from "../services/syncService";
import { Platform } from "react-native";

const SyncContext = createContext();

export const useSyncContext = () => {
  const context = useContext(SyncContext);
  if (!context) {
    throw new Error("useSyncContext must be used within SyncProvider");
  }
  return context;
};

export const SyncProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [syncError, setSyncError] = useState(null);
  const [isHealthConnectAvailable, setIsHealthConnectAvailable] =
    useState(false);

  // 마지막 동기화 시간 불러오기
  useEffect(() => {
    loadLastSyncTime();
    checkHealthConnectAvailability();
  }, [currentUser]);

  const loadLastSyncTime = async () => {
    try {
      if (currentUser?.uid) {
        const lastSync = await AsyncStorage.getItem(
          `lastSync_${currentUser.uid}`
        );
        if (lastSync) {
          setLastSyncTime(new Date(lastSync));
        }
      }
    } catch (error) {
      console.error("마지막 동기화 시간 로드 실패:", error);
    }
  };

  const checkHealthConnectAvailability = () => {
    setIsHealthConnectAvailable(Platform.OS === "android");
  };

  const syncData = async (days = 7) => {
    if (!currentUser?.uid) {
      setSyncError("로그인이 필요합니다");
      return { success: false, error: "로그인이 필요합니다" };
    }

    if (!isHealthConnectAvailable) {
      setSyncError("Health Connect는 Android에서만 사용 가능합니다");
      return { success: false, error: "Android 전용 기능입니다" };
    }

    setIsSyncing(true);
    setSyncError(null);

    try {
      const result = await syncDateRange(currentUser.uid, days);

      if (result.success) {
        const now = new Date();
        setLastSyncTime(now);
        await AsyncStorage.setItem(
          `lastSync_${currentUser.uid}`,
          now.toISOString()
        );
        return result;
      } else {
        setSyncError(result.error);
        return result;
      }
    } catch (error) {
      console.error("동기화 오류:", error);
      setSyncError(error.message);
      return { success: false, error: error.message };
    } finally {
      setIsSyncing(false);
    }
  };

  // 자동 동기화 (선택사항)
  const autoSync = async () => {
    if (!lastSyncTime) {
      // 첫 동기화
      return await syncData(30);
    }

    const hoursSinceLastSync = (new Date() - lastSyncTime) / (1000 * 60 * 60);

    // 24시간 이상 지났으면 자동 동기화
    if (hoursSinceLastSync >= 24) {
      console.log("🔄 24시간 경과, 자동 동기화 시작");
      return await syncData(7);
    }

    return { success: true, message: "최근에 동기화됨" };
  };

  const clearSyncData = async () => {
    try {
      if (currentUser?.uid) {
        await AsyncStorage.removeItem(`lastSync_${currentUser.uid}`);
      }
      setLastSyncTime(null);
      setSyncError(null);
    } catch (error) {
      console.error("동기화 데이터 삭제 실패:", error);
    }
  };

  const value = {
    isSyncing,
    lastSyncTime,
    syncError,
    isHealthConnectAvailable,
    syncData,
    autoSync,
    clearSyncData,
  };

  return <SyncContext.Provider value={value}>{children}</SyncContext.Provider>;
};

export default SyncContext;
