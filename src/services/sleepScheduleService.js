// src/services/sleepScheduleService.js

import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import {
  subscribeToSchedule,
  unsubscribeFromSchedule,
} from "./firebaseMessagingService";

// 사용자별 스케줄 경로
const getUserSchedulesCollection = (userId) => {
  if (!userId) throw new Error("로그인이 필요합니다");
  return collection(db, "users", userId, "sleepSchedules");
};

// 스케줄 저장 함수
export const saveSleepSchedule = async (userId, scheduleData) => {
  try {
    console.log("📝 스케줄 저장 시작 - userId:", userId);
    console.log("📝 스케줄 데이터:", scheduleData);

    if (!userId) throw new Error("사용자 ID가 필요합니다");
    if (!scheduleData) throw new Error("스케줄 데이터가 필요합니다");

    let daysArray = scheduleData.days || [];

    if (typeof daysArray === "string") {
      daysArray = [daysArray];
    }

    if (!Array.isArray(daysArray)) {
      console.warn("⚠️ days가 배열이 아닙니다.");
      daysArray = [];
    }

    const newSchedule = {
      name: scheduleData.name || "새 스케줄",
      bedtime: scheduleData.bedtime,
      wakeup: scheduleData.wakeup,
      days: daysArray,
      id: scheduleData.id || Date.now().toString(),
      userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      enabled: scheduleData.enabled !== false,
      notifications: scheduleData.notifications || {
        bedtime: {
          enabled: true,
          title: "💤 잠자리에 들 시간입니다",
          body: `${scheduleData.name || "새 스케줄"} - 편안한 밤 되세요!`,
        },
        wakeup: {
          enabled: true,
          title: "🌅 좋은 아침입니다!",
          body: `${
            scheduleData.name || "새 스케줄"
          } - 상쾌한 하루를 시작하세요!`,
        },
      },
    };

    console.log("✅ 최종 스케줄 데이터:", newSchedule);

    const docRef = await addDoc(
      getUserSchedulesCollection(userId),
      newSchedule
    );
    newSchedule.firebaseId = docRef.id;

    // FCM 토픽 구독 (Firebase에서 알림을 보낼 때 사용)
    if (newSchedule.enabled) {
      await subscribeToSchedule(newSchedule.id);
    }

    console.log(
      "✅ 스케줄 저장 완료 - Firebase Functions가 알림을 자동으로 관리합니다"
    );
    return newSchedule;
  } catch (error) {
    console.error("수면 스케줄 저장 실패:", error);
    throw error;
  }
};

// 스케줄 목록 조회 함수
export const getSleepSchedules = async (userId) => {
  try {
    console.log("📖 스케줄 조회 시작 - userId:", userId);

    if (!userId) throw new Error("사용자 ID가 필요합니다");

    const querySnapshot = await getDocs(getUserSchedulesCollection(userId));
    const schedules = [];

    querySnapshot.forEach((doc) => {
      schedules.push({
        ...doc.data(),
        firebaseId: doc.id,
      });
    });

    console.log("✅ 스케줄 조회 완료:", schedules.length, "개");
    return schedules.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  } catch (error) {
    console.error("수면 스케줄 조회 실패:", error);
    throw error;
  }
};

// 스케줄 업데이트 함수
export const updateSleepSchedule = async (userId, scheduleId, updateData) => {
  try {
    if (!userId) throw new Error("사용자 ID가 필요합니다");

    const schedules = await getSleepSchedules(userId);
    const targetSchedule = schedules.find((s) => s.id === scheduleId);

    if (!targetSchedule || !targetSchedule.firebaseId) {
      throw new Error("수정할 스케줄을 찾을 수 없습니다");
    }

    const updatedData = {
      ...updateData,
      updatedAt: serverTimestamp(),
    };

    const scheduleRef = doc(
      db,
      "users",
      userId,
      "sleepSchedules",
      targetSchedule.firebaseId
    );
    await updateDoc(scheduleRef, updatedData);

    const updatedSchedule = { ...targetSchedule, ...updatedData };

    // FCM 토픽 구독 상태 업데이트
    if (updateData.hasOwnProperty("enabled")) {
      if (updateData.enabled) {
        await subscribeToSchedule(scheduleId);
      } else {
        await unsubscribeFromSchedule(scheduleId);
      }
    }

    return updatedSchedule;
  } catch (error) {
    console.error("수면 스케줄 수정 실패:", error);
    throw error;
  }
};

// 스케줄 삭제 함수
export const deleteSleepSchedule = async (userId, scheduleId) => {
  try {
    if (!userId) throw new Error("사용자 ID가 필요합니다");

    const schedules = await getSleepSchedules(userId);
    const targetSchedule = schedules.find((s) => s.id === scheduleId);

    if (!targetSchedule) {
      throw new Error("삭제할 스케줄을 찾을 수 없습니다");
    }

    // FCM 토픽 구독 해제
    await unsubscribeFromSchedule(scheduleId);

    if (targetSchedule.firebaseId) {
      const scheduleRef = doc(
        db,
        "users",
        userId,
        "sleepSchedules",
        targetSchedule.firebaseId
      );
      await deleteDoc(scheduleRef);
    }

    return true;
  } catch (error) {
    console.error("수면 스케줄 삭제 실패:", error);
    throw error;
  }
};

// 여러 스케줄 일괄 삭제
export const deleteSleepSchedules = async (userId, scheduleIds) => {
  try {
    if (!userId) throw new Error("사용자 ID가 필요합니다");

    const schedules = await getSleepSchedules(userId);
    const targetSchedules = schedules.filter((s) => scheduleIds.includes(s.id));

    if (targetSchedules.length === 0) {
      throw new Error("삭제할 스케줄을 찾을 수 없습니다");
    }

    // FCM 토픽 구독 해제
    for (const scheduleId of scheduleIds) {
      await unsubscribeFromSchedule(scheduleId);
    }

    const deletePromises = targetSchedules
      .filter((schedule) => schedule.firebaseId)
      .map((schedule) => {
        const scheduleRef = doc(
          db,
          "users",
          userId,
          "sleepSchedules",
          schedule.firebaseId
        );
        return deleteDoc(scheduleRef);
      });

    await Promise.all(deletePromises);
    return true;
  } catch (error) {
    console.error("수면 스케줄 일괄 삭제 실패:", error);
    throw error;
  }
};

// 스케줄 활성화/비활성화 토글

export const toggleScheduleEnabled = async (
  userId,
  scheduleId,
  forceValue = null
) => {
  try {
    if (!userId) throw new Error("사용자 ID가 필요합니다");

    // 먼저 스케줄 목록에서 찾기
    const schedules = await getSleepSchedules(userId);
    const targetSchedule = schedules.find((s) => s.id === scheduleId);

    if (!targetSchedule || !targetSchedule.firebaseId) {
      throw new Error("스케줄을 찾을 수 없습니다");
    }

    // firebaseId로 문서 참조
    const scheduleRef = doc(
      db,
      "users",
      userId,
      "sleepSchedules",
      targetSchedule.firebaseId
    );

    const newEnabledValue =
      forceValue !== null ? forceValue : !targetSchedule.enabled;

    await updateDoc(scheduleRef, {
      enabled: newEnabledValue,
      updatedAt: serverTimestamp(),
    });

    // FCM 토픽 구독 상태 업데이트
    if (newEnabledValue) {
      await subscribeToSchedule(scheduleId);
    } else {
      await unsubscribeFromSchedule(scheduleId);
    }

    return { ...targetSchedule, enabled: newEnabledValue };
  } catch (error) {
    console.error("스케줄 토글 실패:", error);
    throw error;
  }
};
// 특정 요일의 활성화된 스케줄 조회
export const getActiveSchedulesForDay = async (userId, dayOfWeek) => {
  try {
    if (!userId) throw new Error("사용자 ID가 필요합니다");

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
