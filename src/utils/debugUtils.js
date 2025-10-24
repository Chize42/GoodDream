// src/utils/debugUtils.js
import { Platform } from "react-native";
import { getSdkStatus, readRecords } from "react-native-health-connect";
import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Health Connect 상태 전체 진단
 */
export const diagnoseHealthConnect = async () => {
  const report = {
    timestamp: new Date().toISOString(),
    platform: Platform.OS,
    checks: {},
    errors: [],
  };

  try {
    // 1. 플랫폼 체크
    report.checks.platform = {
      isAndroid: Platform.OS === "android",
      version: Platform.Version,
    };

    if (Platform.OS !== "android") {
      report.errors.push("Health Connect는 Android 전용입니다");
      return report;
    }

    // 2. SDK 상태 체크
    try {
      const sdkStatus = await getSdkStatus();
      report.checks.sdkStatus = sdkStatus;

      if (sdkStatus === 1) {
        report.checks.sdkStatusMessage = "SDK 사용 가능";
      } else if (sdkStatus === 2) {
        report.errors.push("Health Connect가 설치되지 않았습니다");
      } else if (sdkStatus === 3) {
        report.errors.push("Health Connect 업데이트가 필요합니다");
      }
    } catch (error) {
      report.errors.push(`SDK 상태 확인 실패: ${error.message}`);
    }

    // 3. 데이터 읽기 테스트
    try {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const testRead = await readRecords("SleepSession", {
        timeRangeFilter: {
          operator: "between",
          startTime: yesterday.toISOString(),
          endTime: new Date().toISOString(),
        },
      });

      report.checks.dataAccess = {
        canRead: true,
        recordsFound: testRead.records.length,
      };
    } catch (error) {
      report.checks.dataAccess = {
        canRead: false,
        error: error.message,
      };

      if (error.message.includes("permission")) {
        report.errors.push("권한이 없습니다");
      }
    }

    // 4. 저장된 설정 확인
    try {
      const autoSync = await AsyncStorage.getItem("autoSync_enabled");
      const lastSync = await AsyncStorage.getItem("lastSyncTime");

      report.checks.settings = {
        autoSyncEnabled: autoSync === "true",
        lastSyncTime: lastSync,
      };
    } catch (error) {
      report.errors.push(`설정 읽기 실패: ${error.message}`);
    }
  } catch (error) {
    report.errors.push(`진단 중 오류: ${error.message}`);
  }

  return report;
};

/**
 * 진단 결과를 사용자 친화적인 메시지로 변환
 */
export const formatDiagnosticReport = (report) => {
  let message = "=== Health Connect 진단 보고서 ===\n\n";

  message += `시간: ${new Date(report.timestamp).toLocaleString("ko-KR")}\n`;
  message += `플랫폼: ${report.platform}\n\n`;

  if (report.checks.platform) {
    message += `✅ Android ${report.checks.platform.version}\n`;
  }

  if (report.checks.sdkStatus) {
    if (report.checks.sdkStatus === 1) {
      message += `✅ Health Connect SDK 정상\n`;
    } else {
      message += `❌ Health Connect SDK 문제 (상태: ${report.checks.sdkStatus})\n`;
    }
  }

  if (report.checks.dataAccess) {
    if (report.checks.dataAccess.canRead) {
      message += `✅ 데이터 읽기 가능 (${report.checks.dataAccess.recordsFound}개 레코드 발견)\n`;
    } else {
      message += `❌ 데이터 읽기 불가: ${report.checks.dataAccess.error}\n`;
    }
  }

  if (report.checks.settings) {
    message += `\n[설정]\n`;
    message += `자동 동기화: ${
      report.checks.settings.autoSyncEnabled ? "활성화" : "비활성화"
    }\n`;
    if (report.checks.settings.lastSyncTime) {
      message += `마지막 동기화: ${report.checks.settings.lastSyncTime}\n`;
    }
  }

  if (report.errors.length > 0) {
    message += `\n[오류]\n`;
    report.errors.forEach((error, index) => {
      message += `${index + 1}. ${error}\n`;
    });
  }

  return message;
};

/**
 * 수면 데이터 샘플 로깅
 */
export const logSleepDataSample = async (days = 3) => {
  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    console.log(`\n=== 수면 데이터 샘플 (최근 ${days}일) ===`);
    console.log(
      `조회 범위: ${startDate.toISOString()} ~ ${endDate.toISOString()}\n`
    );

    const sessions = await readRecords("SleepSession", {
      timeRangeFilter: {
        operator: "between",
        startTime: startDate.toISOString(),
        endTime: endDate.toISOString(),
      },
    });

    const stages = await readRecords("SleepStage", {
      timeRangeFilter: {
        operator: "between",
        startTime: startDate.toISOString(),
        endTime: endDate.toISOString(),
      },
    });

    console.log(`📊 Sleep Sessions: ${sessions.records.length}개`);
    sessions.records.forEach((session, index) => {
      console.log(`\n[세션 ${index + 1}]`);
      console.log(
        `  시작: ${new Date(session.startTime).toLocaleString("ko-KR")}`
      );
      console.log(
        `  종료: ${new Date(session.endTime).toLocaleString("ko-KR")}`
      );
      console.log(
        `  시간: ${(
          (new Date(session.endTime) - new Date(session.startTime)) /
          (1000 * 60 * 60)
        ).toFixed(2)}시간`
      );
      console.log(`  메타데이터:`, session.metadata);
    });

    console.log(`\n📊 Sleep Stages: ${stages.records.length}개`);
    const stageNames = {
      1: "깨어있음 (AWAKE)",
      2: "수면 중 (SLEEPING)",
      3: "침대 밖 (OUT_OF_BED)",
      4: "얕은 수면 (LIGHT)",
      5: "깊은 수면 (DEEP)",
      6: "REM 수면 (REM)",
    };

    const stageCounts = {};
    stages.records.forEach((stage) => {
      const stageName =
        stageNames[stage.stage] || `알 수 없음 (${stage.stage})`;
      stageCounts[stageName] = (stageCounts[stageName] || 0) + 1;
    });

    console.log("\n단계별 카운트:");
    Object.entries(stageCounts).forEach(([stage, count]) => {
      console.log(`  ${stage}: ${count}개`);
    });

    return { sessions: sessions.records, stages: stages.records };
  } catch (error) {
    console.error("❌ 샘플 로깅 실패:", error);
    throw error;
  }
};

/**
 * Firebase 데이터와 Health Connect 데이터 비교
 */
export const compareDataSources = async (userId, date) => {
  try {
    const { getSleepData } = require("../services/sleepService");
    const {
      fetchSleepSessions,
      fetchSleepStages,
    } = require("../services/healthConnectService");

    console.log(`\n=== 데이터 소스 비교 (${date}) ===\n`);

    // Firebase 데이터
    const firebaseData = await getSleepData(userId, date);
    console.log("📱 Firebase 데이터:");
    console.log(JSON.stringify(firebaseData, null, 2));

    // Health Connect 데이터
    const startTime = new Date(date);
    const endTime = new Date(date);
    endTime.setDate(endTime.getDate() + 1);

    const hcSessions = await fetchSleepSessions(
      startTime.toISOString(),
      endTime.toISOString()
    );
    const hcStages = await fetchSleepStages(
      startTime.toISOString(),
      endTime.toISOString()
    );

    console.log("\n🏥 Health Connect 데이터:");
    console.log(`세션: ${hcSessions.length}개`);
    console.log(`단계: ${hcStages.length}개`);

    if (hcSessions.length > 0) {
      console.log("\n첫 번째 세션:");
      console.log(JSON.stringify(hcSessions[0], null, 2));
    }

    // 비교 결과
    console.log("\n📊 비교 결과:");
    if (!firebaseData) {
      console.log("⚠️ Firebase에 데이터 없음");
    } else if (firebaseData.source === "healthconnect") {
      console.log("✅ Firebase 데이터가 Health Connect에서 동기화됨");
    } else if (firebaseData.source === "manual") {
      console.log("📝 Firebase 데이터가 수동 입력됨");
    } else {
      console.log("🔧 Firebase 데이터가 더미 데이터");
    }

    if (hcSessions.length === 0) {
      console.log("⚠️ Health Connect에 데이터 없음");
    }

    return {
      firebase: firebaseData,
      healthConnect: {
        sessions: hcSessions,
        stages: hcStages,
      },
    };
  } catch (error) {
    console.error("❌ 비교 실패:", error);
    throw error;
  }
};

/**
 * 동기화 성능 측정
 */
export const measureSyncPerformance = async (userId, days = 7) => {
  const startTime = Date.now();
  const metrics = {
    startTime: new Date(startTime).toISOString(),
    steps: [],
  };

  try {
    const { syncDateRange } = require("../services/syncService");

    // 1. 데이터 가져오기
    const fetchStart = Date.now();
    const result = await syncDateRange(userId, days);
    const fetchDuration = Date.now() - fetchStart;

    metrics.steps.push({
      step: "데이터 동기화",
      duration: fetchDuration,
      success: result.success,
      recordCount: result.syncedCount || 0,
    });

    // 총 시간
    metrics.totalDuration = Date.now() - startTime;
    metrics.endTime = new Date().toISOString();

    console.log("\n=== 동기화 성능 측정 ===");
    console.log(`총 소요 시간: ${metrics.totalDuration}ms`);
    console.log(`동기화된 레코드: ${result.syncedCount || 0}개`);
    console.log(
      `평균 처리 시간: ${(
        metrics.totalDuration / (result.syncedCount || 1)
      ).toFixed(2)}ms/레코드`
    );

    return metrics;
  } catch (error) {
    metrics.error = error.message;
    metrics.totalDuration = Date.now() - startTime;
    console.error("❌ 성능 측정 실패:", error);
    return metrics;
  }
};

/**
 * Health Connect 데이터 무결성 검사
 */
export const validateHealthConnectData = (sessions, stages) => {
  const issues = [];

  // 1. 세션 검증
  sessions.forEach((session, index) => {
    const start = new Date(session.startTime);
    const end = new Date(session.endTime);

    if (end <= start) {
      issues.push(`세션 ${index + 1}: 종료 시간이 시작 시간보다 빠름`);
    }

    const duration = (end - start) / (1000 * 60 * 60);
    if (duration > 24) {
      issues.push(
        `세션 ${index + 1}: 수면 시간이 24시간 초과 (${duration.toFixed(
          2
        )}시간)`
      );
    }

    if (duration < 0.5) {
      issues.push(
        `세션 ${index + 1}: 수면 시간이 너무 짧음 (${duration.toFixed(2)}시간)`
      );
    }
  });

  // 2. 단계 검증
  const validStages = [1, 2, 3, 4, 5, 6];
  stages.forEach((stage, index) => {
    if (!validStages.includes(stage.stage)) {
      issues.push(`단계 ${index + 1}: 잘못된 단계 값 (${stage.stage})`);
    }

    const start = new Date(stage.startTime);
    const end = new Date(stage.endTime);

    if (end <= start) {
      issues.push(`단계 ${index + 1}: 종료 시간이 시작 시간보다 빠름`);
    }
  });

  // 3. 세션과 단계 일치 여부
  if (sessions.length > 0 && stages.length === 0) {
    issues.push("경고: 수면 세션은 있지만 단계 데이터가 없음");
  }

  console.log("\n=== 데이터 무결성 검사 ===");
  if (issues.length === 0) {
    console.log("✅ 모든 데이터가 정상입니다");
  } else {
    console.log(`⚠️ ${issues.length}개의 문제 발견:`);
    issues.forEach((issue, index) => {
      console.log(`${index + 1}. ${issue}`);
    });
  }

  return {
    isValid: issues.length === 0,
    issues,
    sessionCount: sessions.length,
    stageCount: stages.length,
  };
};

export default {
  diagnoseHealthConnect,
  formatDiagnosticReport,
  logSleepDataSample,
  compareDataSources,
  measureSyncPerformance,
  validateHealthConnectData,
};
