// src/services/healthConnectService.js
import {
  initialize,
  requestPermission,
  readRecords,
  SdkAvailabilityStatus,
  getSdkStatus,
} from "react-native-health-connect";
import { Platform } from "react-native";

/**
 * Health Connect 초기화 및 사용 가능 여부 확인
 */
export const initializeHealthConnect = async () => {
  try {
    if (Platform.OS !== "android") {
      throw new Error("Health Connect는 Android에서만 사용 가능합니다");
    }

    const isInitialized = await initialize();
    console.log("🏥 Health Connect 초기화:", isInitialized);

    const status = await getSdkStatus();
    console.log("📊 SDK 상태:", status);

    if (status === SdkAvailabilityStatus.SDK_UNAVAILABLE) {
      throw new Error("Health Connect가 설치되지 않았습니다");
    }

    if (
      status === SdkAvailabilityStatus.SDK_UNAVAILABLE_PROVIDER_UPDATE_REQUIRED
    ) {
      throw new Error("Health Connect 업데이트가 필요합니다");
    }

    return { success: true, status };
  } catch (error) {
    console.error("❌ Health Connect 초기화 실패:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Health Connect 권한 요청
 */
export const requestHealthConnectPermissions = async () => {
  try {
    const permissions = [
      { accessType: "read", recordType: "SleepSession" },
      { accessType: "read", recordType: "SleepStage" },
    ];

    const granted = await requestPermission(permissions);
    console.log("🔐 권한 요청 결과:", granted);

    return granted;
  } catch (error) {
    console.error("❌ 권한 요청 실패:", error);
    throw error;
  }
};

/**
 * 수면 세션 데이터 가져오기
 */
export const fetchSleepSessions = async (startDate, endDate) => {
  try {
    console.log(`📥 수면 세션 가져오기: ${startDate} ~ ${endDate}`);

    const startTime = new Date(startDate).toISOString();
    const endTime = new Date(endDate).toISOString();

    const sleepSessions = await readRecords("SleepSession", {
      timeRangeFilter: {
        operator: "between",
        startTime,
        endTime,
      },
    });

    console.log(`✅ ${sleepSessions.records.length}개 세션 가져옴`);
    return sleepSessions.records;
  } catch (error) {
    console.error("❌ 수면 세션 가져오기 실패:", error);
    throw error;
  }
};

/**
 * 수면 단계 데이터 가져오기
 */
export const fetchSleepStages = async (startDate, endDate) => {
  try {
    console.log(`📥 수면 단계 가져오기: ${startDate} ~ ${endDate}`);

    const startTime = new Date(startDate).toISOString();
    const endTime = new Date(endDate).toISOString();

    const sleepStages = await readRecords("SleepStage", {
      timeRangeFilter: {
        operator: "between",
        startTime,
        endTime,
      },
    });

    console.log(`✅ ${sleepStages.records.length}개 단계 가져옴`);
    return sleepStages.records;
  } catch (error) {
    console.error("❌ 수면 단계 가져오기 실패:", error);
    throw error;
  }
};

/**
 * Health Connect 데이터를 앱 형식으로 변환
 */
export const convertHealthConnectToAppFormat = (sessions, stages) => {
  try {
    const sleepDataByDate = {};

    sessions.forEach((session) => {
      const startTime = new Date(session.startTime);
      const endTime = new Date(session.endTime);
      const dateKey = formatDate(startTime);

      // 수면 시간 계산
      const bedTime = formatTime(startTime);
      const wakeTime = formatTime(endTime);
      const totalMinutes = (endTime - startTime) / (1000 * 60);
      const totalHours = totalMinutes / 60;

      // 해당 세션의 수면 단계 필터링
      const sessionStages = stages.filter((stage) => {
        const stageTime = new Date(stage.startTime);
        return stageTime >= startTime && stageTime <= endTime;
      });

      // 수면 단계별 시간 계산
      const stageDurations = calculateStageDurations(sessionStages);

      // 수면 점수 계산
      const score = calculateSleepScore(stageDurations, totalHours);

      sleepDataByDate[dateKey] = {
        bedTime,
        wakeTime,
        deep: stageDurations.deep,
        light: stageDurations.light,
        rem: stageDurations.rem,
        awake: stageDurations.awake,
        actualSleep:
          stageDurations.deep + stageDurations.light + stageDurations.rem,
        totalSleepDuration: Math.round(totalHours * 10) / 10,
        score,
        source: "healthconnect", // 데이터 출처 표시
      };
    });

    return sleepDataByDate;
  } catch (error) {
    console.error("❌ 데이터 변환 실패:", error);
    throw error;
  }
};

/**
 * 수면 단계별 시간 계산
 */
const calculateStageDurations = (stages) => {
  const durations = {
    deep: 0,
    light: 0,
    rem: 0,
    awake: 0,
  };

  stages.forEach((stage) => {
    const startTime = new Date(stage.startTime);
    const endTime = new Date(stage.endTime);
    const durationHours = (endTime - startTime) / (1000 * 60 * 60);

    // Health Connect 단계 타입을 앱 형식으로 매핑
    switch (stage.stage) {
      case 1: // AWAKE
        durations.awake += durationHours;
        break;
      case 2: // SLEEPING (일반 수면)
        durations.light += durationHours;
        break;
      case 3: // OUT_OF_BED
        durations.awake += durationHours;
        break;
      case 4: // LIGHT
        durations.light += durationHours;
        break;
      case 5: // DEEP
        durations.deep += durationHours;
        break;
      case 6: // REM
        durations.rem += durationHours;
        break;
      default:
        durations.light += durationHours;
    }
  });

  return {
    deep: Math.round(durations.deep * 10) / 10,
    light: Math.round(durations.light * 10) / 10,
    rem: Math.round(durations.rem * 10) / 10,
    awake: Math.round(durations.awake * 10) / 10,
  };
};

/**
 * 수면 점수 계산 (0-100)
 */
const calculateSleepScore = (durations, totalHours) => {
  let score = 0;

  // 총 수면 시간 점수 (40점)
  if (totalHours >= 7 && totalHours <= 9) {
    score += 40;
  } else if (totalHours >= 6 && totalHours < 7) {
    score += 30;
  } else if (totalHours >= 5 && totalHours < 6) {
    score += 20;
  } else {
    score += 10;
  }

  // 깊은 수면 점수 (30점)
  const deepPercentage = (durations.deep / totalHours) * 100;
  if (deepPercentage >= 15 && deepPercentage <= 25) {
    score += 30;
  } else if (deepPercentage >= 10 && deepPercentage < 15) {
    score += 20;
  } else {
    score += 10;
  }

  // REM 수면 점수 (20점)
  const remPercentage = (durations.rem / totalHours) * 100;
  if (remPercentage >= 20 && remPercentage <= 25) {
    score += 20;
  } else if (remPercentage >= 15 && remPercentage < 20) {
    score += 15;
  } else {
    score += 10;
  }

  // 중간에 깬 시간 점수 (10점) - 적을수록 좋음
  const awakePercentage = (durations.awake / totalHours) * 100;
  if (awakePercentage < 5) {
    score += 10;
  } else if (awakePercentage < 10) {
    score += 5;
  }

  return Math.min(100, Math.max(0, score));
};

/**
 * 날짜를 YYYY-MM-DD 형식으로 변환
 */
const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**
 * 시간을 HH:MM 형식으로 변환
 */
const formatTime = (date) => {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
};

/**
 * 전체 동기화 프로세스
 */
export const syncHealthConnectData = async (userId, startDate, endDate) => {
  try {
    console.log("🔄 Health Connect 동기화 시작");

    // 1. 초기화 확인
    const initResult = await initializeHealthConnect();
    if (!initResult.success) {
      throw new Error(initResult.error);
    }

    // 2. 권한 확인
    const hasPermission = await requestHealthConnectPermissions();
    if (!hasPermission) {
      throw new Error("Health Connect 권한이 필요합니다");
    }

    // 3. 데이터 가져오기
    const [sessions, stages] = await Promise.all([
      fetchSleepSessions(startDate, endDate),
      fetchSleepStages(startDate, endDate),
    ]);

    // 4. 데이터 변환
    const convertedData = convertHealthConnectToAppFormat(sessions, stages);

    console.log(`✅ ${Object.keys(convertedData).length}일치 데이터 변환 완료`);

    return {
      success: true,
      data: convertedData,
      count: Object.keys(convertedData).length,
    };
  } catch (error) {
    console.error("❌ 동기화 실패:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};
