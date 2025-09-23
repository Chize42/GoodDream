import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
} from "firebase/firestore";
import { db } from "./firebase";
import {
  scheduleLocalNotifications,
  cancelScheduleNotifications,
  requestNotificationPermissions,
} from "./localNotificationService";

// Firebase 컬렉션 참조
const getSchedulesCollection = () => collection(db, "sleepSchedules");

/**
 * 수면 스케줄 저장 (Firebase + 로컬 알림)
 */
export const saveSleepSchedule = async (scheduleData, userId = null) => {
  try {
    if (!userId) {
      throw new Error("사용자 ID가 필요합니다.");
    }

    const newSchedule = {
      ...scheduleData,
      id: scheduleData.id || Date.now().toString(),
      userId: userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      enabled: scheduleData.enabled !== false,

      // 기본 알림 설정 추가 (없으면)
      notifications: scheduleData.notifications || {
        bedtime: {
          enabled: true,
          title: "💤 잠자리에 들 시간입니다",
          body: `${scheduleData.name} - 편안한 밤 되세요!`,
        },
        wakeup: {
          enabled: true,
          title: "🌅 좋은 아침입니다!",
          body: `${scheduleData.name} - 상쾌한 하루를 시작하세요!`,
        },
      },
    };

    // Firebase에 저장
    const docRef = await addDoc(getSchedulesCollection(), newSchedule);
    newSchedule.firebaseId = docRef.id;

    // 로컬 알림 등록
    if (newSchedule.enabled) {
      await scheduleLocalNotifications(newSchedule);
    }

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
    if (!userId) {
      throw new Error("사용자 ID가 필요합니다.");
    }

    const schedules = await getSleepSchedules(userId);
    const targetSchedule = schedules.find((s) => s.id === scheduleId);

    if (!targetSchedule) {
      throw new Error("수정할 스케줄을 찾을 수 없습니다.");
    }

    if (!targetSchedule.firebaseId) {
      throw new Error("Firebase ID가 없어 수정할 수 없습니다.");
    }

    const updatedData = {
      ...updateData,
      updatedAt: new Date().toISOString(),
    };

    const scheduleRef = doc(db, "sleepSchedules", targetSchedule.firebaseId);
    await updateDoc(scheduleRef, updatedData);

    const updatedSchedule = { ...targetSchedule, ...updatedData };

    // 로컬 알림 재설정
    await scheduleLocalNotifications(updatedSchedule);

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
    if (!userId) {
      throw new Error("사용자 ID가 필요합니다.");
    }

    const schedules = await getSleepSchedules(userId);
    const targetSchedule = schedules.find((s) => s.id === scheduleId);

    if (!targetSchedule) {
      throw new Error("삭제할 스케줄을 찾을 수 없습니다.");
    }

    // 로컬 알림 취소
    await cancelScheduleNotifications(scheduleId);

    // Firebase 삭제
    if (targetSchedule.firebaseId) {
      const scheduleRef = doc(db, "sleepSchedules", targetSchedule.firebaseId);
      await deleteDoc(scheduleRef);
    }

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
    if (!userId) {
      throw new Error("사용자 ID가 필요합니다.");
    }

    const schedules = await getSleepSchedules(userId);
    const targetSchedules = schedules.filter((s) => scheduleIds.includes(s.id));

    if (targetSchedules.length === 0) {
      throw new Error("삭제할 스케줄을 찾을 수 없습니다.");
    }

    // 로컬 알림 취소
    for (const scheduleId of scheduleIds) {
      await cancelScheduleNotifications(scheduleId);
    }

    // Firebase 삭제
    const deletePromises = targetSchedules
      .filter((schedule) => schedule.firebaseId)
      .map((schedule) => {
        const scheduleRef = doc(db, "sleepSchedules", schedule.firebaseId);
        return deleteDoc(scheduleRef);
      });

    await Promise.all(deletePromises);
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
    if (!userId) {
      throw new Error("사용자 ID가 필요합니다.");
    }

    const q = query(getSchedulesCollection(), where("userId", "==", userId));

    const querySnapshot = await getDocs(q);
    const firebaseSchedules = [];

    querySnapshot.forEach((doc) => {
      firebaseSchedules.push({
        ...doc.data(),
        firebaseId: doc.id,
      });
    });

    const sortedSchedules = firebaseSchedules.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    return sortedSchedules;
  } catch (error) {
    console.error("수면 스케줄 조회 실패:", error);
    throw error;
  }
};

/**
 * 스케줄 활성화/비활성화 토글
 */
export const toggleScheduleEnabled = async (scheduleId, userId = null) => {
  try {
    if (!userId) {
      throw new Error("사용자 ID가 필요합니다.");
    }

    const schedules = await getSleepSchedules(userId);
    const schedule = schedules.find((s) => s.id === scheduleId);

    if (!schedule) {
      throw new Error("스케줄을 찾을 수 없습니다.");
    }

    const newEnabledState = !schedule.enabled;

    const updatedSchedule = await updateSleepSchedule(
      scheduleId,
      { enabled: newEnabledState },
      userId
    );

    return updatedSchedule;
  } catch (error) {
    console.error("스케줄 토글 실패:", error);
    throw error;
  }
};

/**
 * 알림 권한 설정 함수 (단순화됨)
 */
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

export const getActiveSchedulesForDay = async (dayOfWeek, userId = null) => {
  try {
    if (!userId) {
      throw new Error("사용자 ID가 필요합니다.");
    }

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
