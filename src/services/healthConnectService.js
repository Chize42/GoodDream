// src/services/healthConnectService.js
import {
  initialize,
  requestPermission,
  readRecords,
  getSdkStatus,
  SdkAvailabilityStatus,
} from "react-native-health-connect";

// Health Connect 초기화
export const initializeHealthConnect = async () => {
  try {
    const isInitialized = await initialize();
    if (!isInitialized) {
      return { success: false, error: "Health Connect 초기화 실패" };
    }
    return { success: true };
  } catch (error) {
    console.error("Health Connect 초기화 오류:", error);
    return { success: false, error: error.message };
  }
};

// Health Connect 권한 요청
export const requestHealthConnectPermissions = async () => {
  try {
    console.log("🔐 권한 요청 시작");

    const permissions = [{ accessType: "read", recordType: "SleepSession" }];

    console.log("📋 요청할 권한:", JSON.stringify(permissions));

    const granted = await requestPermission(permissions);
    console.log("✅ 권한 요청 완료, 결과:", granted);

    if (!granted) {
      console.warn("⚠️ 사용자가 권한을 거부했습니다");
      return false;
    }

    return true;
  } catch (error) {
    console.error("❌ 권한 요청 실패:", error);
    return false;
  }
};

// 수면 데이터 가져오기 (수면 단계 포함)
export const syncHealthConnectData = async (userId, startDate, endDate) => {
  try {
    console.log("📥 수면 데이터 가져오기 시작");
    console.log("📅 기간:", startDate, "~", endDate);
    console.log("👤 User ID:", userId);

    const startTime = new Date(startDate + "T00:00:00Z").toISOString();
    const endTime = new Date(endDate + "T23:59:59Z").toISOString();

    console.log("🕐 조회 시간:", startTime, "~", endTime);

    // 수면 세션 데이터 가져오기
    const sleepResult = await readRecords("SleepSession", {
      timeRangeFilter: {
        operator: "between",
        startTime: startTime,
        endTime: endTime,
      },
    });

    console.log("📊 조회된 수면 세션:", sleepResult.records?.length || 0);

    if (!sleepResult.records || sleepResult.records.length === 0) {
      console.log("ℹ️ 수면 데이터가 없습니다");
      return { success: true, data: [], count: 0 };
    }

    // 첫 번째 레코드의 구조 확인
    console.log(
      "🔍 첫 번째 수면 세션 구조:",
      JSON.stringify(sleepResult.records[0], null, 2)
    );

    // 수면 세션 데이터 변환
    const sleepDataArray = sleepResult.records.map((session) => {
      const sessionStart = new Date(session.startTime);
      const sessionEnd = new Date(session.endTime);

      const durationMinutes = Math.round(
        (sessionEnd.getTime() - sessionStart.getTime()) / (1000 * 60)
      );

      // 한국 시간으로 변환 (UTC+9)
      const bedDateKR = new Date(sessionStart.getTime() + 9 * 60 * 60 * 1000);
      const wakeDateKR = new Date(sessionEnd.getTime() + 9 * 60 * 60 * 1000);

      // 수면 날짜는 취침 시간 기준 (오전 6시 이전이면 전날)
      let sleepDate = new Date(bedDateKR);
      const bedHour = bedDateKR.getUTCHours();

      if (bedHour < 6) {
        sleepDate.setUTCDate(sleepDate.getUTCDate() - 1);
      }

      const dateStr = sleepDate.toISOString().split("T")[0];
      const bedTimeStr = bedDateKR.toISOString().slice(11, 16);
      const wakeTimeStr = wakeDateKR.toISOString().slice(11, 16);

      console.log(`⏰ 시간 변환:`, {
        원본_취침: session.startTime,
        원본_기상: session.endTime,
        한국_취침: bedDateKR.toISOString(),
        한국_기상: wakeDateKR.toISOString(),
        최종_날짜: dateStr,
        최종_취침시간: bedTimeStr,
        최종_기상시간: wakeTimeStr,
      });

      let deepMinutes = 0;
      let lightMinutes = 0;
      let remMinutes = 0;
      let awakeMinutes = 0;

      if (session.stages && Array.isArray(session.stages)) {
        console.log(
          `📊 세션 ${dateStr}의 수면 단계 개수:`,
          session.stages.length
        );

        session.stages.forEach((stage) => {
          const stageStart = new Date(stage.startTime);
          const stageEnd = new Date(stage.endTime);
          const stageDuration = Math.round(
            (stageEnd.getTime() - stageStart.getTime()) / (1000 * 60)
          );

          switch (stage.stage) {
            case 5:
              deepMinutes += stageDuration;
              break;
            case 4:
              lightMinutes += stageDuration;
              break;
            case 6:
              remMinutes += stageDuration;
              break;
            case 1:
            case 7:
              awakeMinutes += stageDuration;
              break;
            case 2:
            case 8:
              lightMinutes += stageDuration;
              break;
            default:
              console.log("알 수 없는 수면 단계:", stage.stage);
          }
        });

        console.log(`💤 ${dateStr} 수면 단계 (분):`, {
          deep: deepMinutes,
          light: lightMinutes,
          rem: remMinutes,
          awake: awakeMinutes,
        });
      } else {
        console.log(`ℹ️ ${dateStr}: 수면 단계 데이터가 없습니다`);
      }

      const deepHours = deepMinutes / 60;
      const lightHours = lightMinutes / 60;
      const remHours = remMinutes / 60;
      const awakeHours = awakeMinutes / 60;

      const result = {
        date: dateStr,
        duration: durationMinutes,
        bedTime: bedTimeStr,
        wakeTime: wakeTimeStr,
        bedTimeISO: session.startTime,
        wakeTimeISO: session.endTime,
        recordId: session.metadata?.id || `hc_${Date.now()}_${Math.random()}`,
        source: "healthconnect",
      };

      if (deepHours > 0) result.deep = deepHours;
      if (lightHours > 0) result.light = lightHours;
      if (remHours > 0) result.rem = remHours;
      if (awakeHours > 0) result.awake = awakeHours;

      console.log(`✅ ${dateStr} 최종 데이터:`, result);

      return result;
    });

    console.log("✅ 변환 완료:", sleepDataArray.length, "개");
    return {
      success: true,
      data: sleepDataArray,
      count: sleepDataArray.length,
    };
  } catch (error) {
    console.error("❌ Health Connect 데이터 조회 실패:", error);
    console.error("에러 상세:", error.message, error.stack);
    return { success: false, error: error.message, data: [] };
  }
};

// SDK 상태 확인
export const checkHealthConnectAvailability = async () => {
  try {
    const status = await getSdkStatus();
    return {
      available: status === SdkAvailabilityStatus.SDK_AVAILABLE,
      status: status,
    };
  } catch (error) {
    console.error("Health Connect 상태 확인 실패:", error);
    return { available: false, status: null };
  }
};
