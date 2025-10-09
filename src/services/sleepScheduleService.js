// src/services/sleepScheduleService.js

import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "./firebase";
import {
  scheduleLocalNotifications,
  cancelScheduleNotifications,
  requestNotificationPermissions,
} from "./localNotificationService";

// 사용자별 스케줄 경로
const getUserSchedulesCollection = (userId) => {
  if (!userId) throw new Error("로그인이 필요합니다");
  return collection(db, "users", userId, "sleepSchedules");
};

// ✅ export 키워드 확인!
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
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
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

    if (newSchedule.enabled) {
      await scheduleLocalNotifications(newSchedule);
    }

    console.log("✅ 스케줄 저장 완료:", newSchedule.firebaseId);
    return newSchedule;
  } catch (error) {
    console.error("수면 스케줄 저장 실패:", error);
    throw error;
  }
};

// ✅ export 키워드 확인!
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
      updatedAt: new Date().toISOString(),
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
    await scheduleLocalNotifications(updatedSchedule);

    return updatedSchedule;
  } catch (error) {
    console.error("수면 스케줄 수정 실패:", error);
    throw error;
  }
};

export const deleteSleepSchedule = async (userId, scheduleId) => {
  try {
    if (!userId) throw new Error("사용자 ID가 필요합니다");

    const schedules = await getSleepSchedules(userId);
    const targetSchedule = schedules.find((s) => s.id === scheduleId);

    if (!targetSchedule) {
      throw new Error("삭제할 스케줄을 찾을 수 없습니다");
    }

    await cancelScheduleNotifications(scheduleId);

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

export const deleteSleepSchedules = async (userId, scheduleIds) => {
  try {
    if (!userId) throw new Error("사용자 ID가 필요합니다");

    const schedules = await getSleepSchedules(userId);
    const targetSchedules = schedules.filter((s) => scheduleIds.includes(s.id));

    if (targetSchedules.length === 0) {
      throw new Error("삭제할 스케줄을 찾을 수 없습니다");
    }

    for (const scheduleId of scheduleIds) {
      await cancelScheduleNotifications(scheduleId);
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

export const toggleScheduleEnabled = async (userId, scheduleId) => {
  try {
    if (!userId) throw new Error("사용자 ID가 필요합니다");

    const schedules = await getSleepSchedules(userId);
    const schedule = schedules.find((s) => s.id === scheduleId);

    if (!schedule) {
      throw new Error("스케줄을 찾을 수 없습니다");
    }

    const newEnabledState = !schedule.enabled;
    const updatedSchedule = await updateSleepSchedule(userId, scheduleId, {
      enabled: newEnabledState,
    });

    return updatedSchedule;
  } catch (error) {
    console.error("스케줄 토글 실패:", error);
    throw error;
  }
};

export const initializeNotificationPermissions = async () => {
  try {
    await requestNotificationPermissions();
    console.log("알림 권한 설정 완료");
    return true;
  } catch (error) {
    console.error("알림 권한 설정 실패:", error);
    throw error;
  }
};

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
