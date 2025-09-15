// src/services/sleepScheduleService.js
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { db } from "./firebase"; // Firebase 설정 파일 import

const STORAGE_KEY = "@sleep_schedules";

// 로컬 스토리지 키
const getStorageKey = (userId) => `${STORAGE_KEY}_${userId || "guest"}`;

// Firebase 컬렉션 참조
const getSchedulesCollection = () => collection(db, "sleepSchedules");

/**
 * 수면 스케줄 저장 (Firebase + AsyncStorage)
 */
export const saveSleepSchedule = async (scheduleData, userId = null) => {
  try {
    const newSchedule = {
      ...scheduleData,
      id: scheduleData.id || Date.now().toString(),
      userId: userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      enabled: scheduleData.enabled !== false, // 기본값 true
    };

    // Firebase에 저장
    if (userId) {
      try {
        const docRef = await addDoc(getSchedulesCollection(), newSchedule);
        newSchedule.firebaseId = docRef.id;
      } catch (firebaseError) {
        console.warn("Firebase 저장 실패, 로컬에만 저장:", firebaseError);
      }
    }

    // AsyncStorage에 저장
    const existingSchedules = await getSleepSchedules(userId);
    const updatedSchedules = [...existingSchedules, newSchedule];
    await AsyncStorage.setItem(
      getStorageKey(userId),
      JSON.stringify(updatedSchedules)
    );

    return newSchedule;
  } catch (error) {
    console.error("수면 스케줄 저장 실패:", error);
    throw error;
  }
};

/**
 * 수면 스케줄 수정
 */
export const updateSleepSchedule = async (
  scheduleId,
  updateData,
  userId = null
) => {
  try {
    const existingSchedules = await getSleepSchedules(userId);
    const scheduleIndex = existingSchedules.findIndex(
      (s) => s.id === scheduleId
    );

    if (scheduleIndex === -1) {
      throw new Error("수정할 스케줄을 찾을 수 없습니다.");
    }

    const updatedSchedule = {
      ...existingSchedules[scheduleIndex],
      ...updateData,
      updatedAt: new Date().toISOString(),
    };

    // Firebase 업데이트
    if (userId && updatedSchedule.firebaseId) {
      try {
        const scheduleRef = doc(
          db,
          "sleepSchedules",
          updatedSchedule.firebaseId
        );
        await updateDoc(scheduleRef, {
          ...updateData,
          updatedAt: updatedSchedule.updatedAt,
        });
      } catch (firebaseError) {
        console.warn("Firebase 업데이트 실패:", firebaseError);
      }
    }

    // AsyncStorage 업데이트
    existingSchedules[scheduleIndex] = updatedSchedule;
    await AsyncStorage.setItem(
      getStorageKey(userId),
      JSON.stringify(existingSchedules)
    );

    return updatedSchedule;
  } catch (error) {
    console.error("수면 스케줄 수정 실패:", error);
    throw error;
  }
};

/**
 * 수면 스케줄 삭제
 */
export const deleteSleepSchedule = async (scheduleId, userId = null) => {
  try {
    const existingSchedules = await getSleepSchedules(userId);
    const scheduleToDelete = existingSchedules.find((s) => s.id === scheduleId);

    if (!scheduleToDelete) {
      throw new Error("삭제할 스케줄을 찾을 수 없습니다.");
    }

    // Firebase 삭제
    if (userId && scheduleToDelete.firebaseId) {
      try {
        const scheduleRef = doc(
          db,
          "sleepSchedules",
          scheduleToDelete.firebaseId
        );
        await deleteDoc(scheduleRef);
      } catch (firebaseError) {
        console.warn("Firebase 삭제 실패:", firebaseError);
      }
    }

    // AsyncStorage 업데이트
    const updatedSchedules = existingSchedules.filter(
      (s) => s.id !== scheduleId
    );
    await AsyncStorage.setItem(
      getStorageKey(userId),
      JSON.stringify(updatedSchedules)
    );

    return true;
  } catch (error) {
    console.error("수면 스케줄 삭제 실패:", error);
    throw error;
  }
};

/**
 * 여러 스케줄 한번에 삭제
 */
export const deleteSleepSchedules = async (scheduleIds, userId = null) => {
  try {
    const existingSchedules = await getSleepSchedules(userId);
    const schedulesToDelete = existingSchedules.filter((s) =>
      scheduleIds.includes(s.id)
    );

    // Firebase 삭제
    if (userId) {
      const deletePromises = schedulesToDelete
        .filter((schedule) => schedule.firebaseId)
        .map((schedule) => {
          try {
            const scheduleRef = doc(db, "sleepSchedules", schedule.firebaseId);
            return deleteDoc(scheduleRef);
          } catch (error) {
            console.warn("Firebase 삭제 실패:", error);
            return Promise.resolve();
          }
        });

      await Promise.allSettled(deletePromises);
    }

    // AsyncStorage 업데이트
    const updatedSchedules = existingSchedules.filter(
      (s) => !scheduleIds.includes(s.id)
    );
    await AsyncStorage.setItem(
      getStorageKey(userId),
      JSON.stringify(updatedSchedules)
    );

    return true;
  } catch (error) {
    console.error("수면 스케줄 일괄 삭제 실패:", error);
    throw error;
  }
};

/**
 * 수면 스케줄 조회
 */
export const getSleepSchedules = async (userId = null) => {
  try {
    // AsyncStorage에서 먼저 조회
    const localData = await AsyncStorage.getItem(getStorageKey(userId));
    let localSchedules = localData ? JSON.parse(localData) : [];

    // Firebase에서 조회 (온라인인 경우)
    if (userId) {
      try {
        const q = query(
          getSchedulesCollection(),
          where("userId", "==", userId),
          orderBy("createdAt", "desc")
        );
        const querySnapshot = await getDocs(q);
        const firebaseSchedules = [];

        querySnapshot.forEach((doc) => {
          firebaseSchedules.push({
            ...doc.data(),
            firebaseId: doc.id,
          });
        });

        // Firebase와 로컬 데이터 동기화
        const syncedSchedules = syncSchedules(
          localSchedules,
          firebaseSchedules
        );

        // 동기화된 데이터를 로컬에 저장
        await AsyncStorage.setItem(
          getStorageKey(userId),
          JSON.stringify(syncedSchedules)
        );

        return syncedSchedules;
      } catch (firebaseError) {
        console.warn("Firebase 조회 실패, 로컬 데이터 사용:", firebaseError);
        return localSchedules;
      }
    }

    return localSchedules;
  } catch (error) {
    console.error("수면 스케줄 조회 실패:", error);
    return [];
  }
};

/**
 * 스케줄 활성화/비활성화 토글
 */
export const toggleScheduleEnabled = async (scheduleId, userId = null) => {
  try {
    const existingSchedules = await getSleepSchedules(userId);
    const schedule = existingSchedules.find((s) => s.id === scheduleId);

    if (!schedule) {
      throw new Error("스케줄을 찾을 수 없습니다.");
    }

    return await updateSleepSchedule(
      scheduleId,
      { enabled: !schedule.enabled },
      userId
    );
  } catch (error) {
    console.error("스케줄 토글 실패:", error);
    throw error;
  }
};

/**
 * Firebase와 로컬 데이터 동기화 로직
 */
const syncSchedules = (localSchedules, firebaseSchedules) => {
  const syncedMap = new Map();

  // Firebase 데이터를 우선으로 함
  firebaseSchedules.forEach((schedule) => {
    syncedMap.set(schedule.id, schedule);
  });

  // 로컬에만 있는 데이터 추가 (Firebase에 아직 업로드되지 않은 데이터)
  localSchedules.forEach((schedule) => {
    if (!syncedMap.has(schedule.id)) {
      syncedMap.set(schedule.id, schedule);
    }
  });

  return Array.from(syncedMap.values()).sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
};

/**
 * 로컬 스토리지 클리어 (개발/디버깅용)
 */
export const clearLocalSchedules = async (userId = null) => {
  try {
    await AsyncStorage.removeItem(getStorageKey(userId));
    console.log("로컬 스케줄 데이터 삭제됨");
  } catch (error) {
    console.error("로컬 데이터 삭제 실패:", error);
  }
};

/**
 * 특정 요일에 활성화된 스케줄 조회
 */
export const getActiveSchedulesForDay = async (dayOfWeek, userId = null) => {
  try {
    const schedules = await getSleepSchedules(userId);
    return schedules.filter(
      (schedule) =>
        schedule.enabled && schedule.days && schedule.days.includes(dayOfWeek)
    );
  } catch (error) {
    console.error("요일별 스케줄 조회 실패:", error);
    return [];
  }
};
