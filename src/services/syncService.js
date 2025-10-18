// src/services/syncService.js
import { syncHealthConnectData } from "./healthConnectService";
import { saveSleepData, getSleepDataRange } from "./sleepService";

/**
 * Health Connect와 Firebase 데이터 병합
 *
 * 병합 규칙:
 * 1. Health Connect 데이터가 있으면 우선 사용
 * 2. 수동 입력 데이터는 보존 (source가 'manual'인 경우)
 * 3. 더미 데이터는 Health Connect 데이터로 덮어쓰기
 */
export const mergeSleepData = (firebaseData, healthConnectData) => {
  const mergedData = { ...firebaseData };

  Object.keys(healthConnectData).forEach((date) => {
    const fbData = firebaseData[date];
    const hcData = healthConnectData[date];

    // Firebase에 데이터가 없거나, 더미 데이터인 경우 Health Connect 데이터 사용
    if (!fbData || fbData.source !== "manual") {
      mergedData[date] = {
        ...hcData,
        source: "healthconnect",
        syncedAt: new Date().toISOString(),
      };
    }
    // 수동 입력 데이터는 보존하지만, 병합 옵션 제공 가능
    else if (fbData.source === "manual") {
      console.log(`📝 ${date}는 수동 입력 데이터로 보존`);
      // 선택적으로 Health Connect 데이터를 참고용으로 저장
      mergedData[date] = {
        ...fbData,
        healthConnectBackup: hcData,
      };
    }
  });

  return mergedData;
};

/**
 * Health Connect 데이터를 Firebase와 동기화
 */
export const syncWithFirebase = async (userId, startDate, endDate) => {
  try {
    console.log("🔄 Firebase 동기화 시작");

    // 1. Health Connect에서 데이터 가져오기
    const hcResult = await syncHealthConnectData(userId, startDate, endDate);

    if (!hcResult.success) {
      throw new Error(hcResult.error);
    }

    // 2. Firebase에서 기존 데이터 가져오기
    const firebaseData = await getSleepDataRange(userId, startDate, endDate);

    // 3. 데이터 병합
    const mergedData = mergeSleepData(firebaseData, hcResult.data);

    // 4. Firebase에 병합된 데이터 저장
    const savePromises = Object.entries(mergedData).map(([date, data]) => {
      // healthConnectBackup 필드는 저장에서 제외
      const { healthConnectBackup, ...dataToSave } = data;
      return saveSleepData(userId, date, dataToSave);
    });

    await Promise.all(savePromises);

    const syncedCount = Object.keys(hcResult.data).length;
    const updatedCount = Object.keys(mergedData).length;

    console.log(
      `✅ 동기화 완료: ${syncedCount}개 가져옴, ${updatedCount}개 업데이트`
    );

    return {
      success: true,
      syncedCount,
      updatedCount,
      data: mergedData,
    };
  } catch (error) {
    console.error("❌ Firebase 동기화 실패:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * 최근 7일 데이터 자동 동기화
 */
export const syncRecentData = async (userId) => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 7);

  const startDateStr = formatDateForSync(startDate);
  const endDateStr = formatDateForSync(endDate);

  return await syncWithFirebase(userId, startDateStr, endDateStr);
};

/**
 * 특정 기간 데이터 동기화
 */
export const syncDateRange = async (userId, days = 30) => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const startDateStr = formatDateForSync(startDate);
  const endDateStr = formatDateForSync(endDate);

  return await syncWithFirebase(userId, startDateStr, endDateStr);
};

/**
 * 날짜를 YYYY-MM-DD 형식으로 변환
 */
const formatDateForSync = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};
