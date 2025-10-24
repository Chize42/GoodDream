// src/services/syncService.js
import {
  syncHealthConnectData,
  initializeHealthConnect,
} from "./healthConnectService";
import { saveSleepData } from "./sleepService";

export const syncDateRange = async (userId, days = 30) => {
  try {
    console.log(`🔄 동기화 시작 - User ID: ${userId}, Days: ${days}`);

    // 👇 Health Connect 초기화
    const initResult = await initializeHealthConnect();
    if (!initResult.success) {
      console.error("❌ Health Connect 초기화 실패:", initResult.error);
      return { success: false, error: initResult.error };
    }
    console.log("✅ Health Connect 초기화 완료");

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);

    const startDateStr = startDate.toISOString().split("T")[0];
    const endDateStr = endDate.toISOString().split("T")[0];

    console.log(`📅 동기화 범위: ${startDateStr} ~ ${endDateStr}`);

    const result = await syncHealthConnectData(
      userId,
      startDateStr,
      endDateStr
    );
    console.log("📊 Health Connect 결과:", result);

    if (!result.success) {
      console.error("❌ Health Connect 조회 실패:", result.error);
      return result;
    }

    if (result.data.length === 0) {
      console.log("ℹ️ 동기화할 데이터가 없습니다");
      return {
        success: true,
        syncedCount: 0,
        updatedCount: 0,
        message: "동기화할 데이터가 없습니다",
      };
    }

    let syncedCount = 0;
    let updatedCount = 0;

    for (const sleepRecord of result.data) {
      try {
        console.log(`💾 저장 중: ${sleepRecord.date}`);
        const saveResult = await saveSleepData(userId, sleepRecord);

        if (saveResult.success) {
          if (saveResult.updated) {
            updatedCount++;
          } else {
            syncedCount++;
          }
        }
      } catch (error) {
        console.error(`❌ ${sleepRecord.date} 저장 실패:`, error);
      }
    }

    console.log(
      `✅ 동기화 완료 - 신규: ${syncedCount}, 업데이트: ${updatedCount}`
    );

    return {
      success: true,
      syncedCount,
      updatedCount,
      totalRecords: result.data.length,
    };
  } catch (error) {
    console.error("❌ Firebase 동기화 실패:", error);
    return { success: false, error: error.message };
  }
};
