// src/services/initializeData.js
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

const TEST_USER_ID = "user123";

// 확장된 더미 데이터 (3개월치)
const generateDummyData = () => {
  const data = {};
  const startDate = new Date("2025-03-01");
  const endDate = new Date("2025-05-31");

  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    const dateString = `${currentDate.getFullYear()}-${String(
      currentDate.getMonth() + 1
    ).padStart(2, "0")}-${String(currentDate.getDate()).padStart(2, "0")}`;

    // 랜덤하지만 현실적인 수면 데이터 생성
    const baseScore = 75 + Math.random() * 20; // 75-95 사이
    const sleepDuration = 6.5 + Math.random() * 2; // 6.5-8.5시간

    // 주말에는 조금 더 늦게 자고 늦게 일어나기
    const isWeekend = currentDate.getDay() === 0 || currentDate.getDay() === 6;
    const bedHour = isWeekend
      ? 23 + Math.random() * 2
      : 22 + Math.random() * 1.5;
    const bedMinute = Math.floor(Math.random() * 60);

    const bedTime = `${String(Math.floor(bedHour)).padStart(2, "0")}:${String(
      bedMinute
    ).padStart(2, "0")}`;

    // 기상 시간 계산
    const totalBedMinutes = Math.floor(bedHour) * 60 + bedMinute;
    const sleepMinutes = sleepDuration * 60;
    const wakeMinutes = (totalBedMinutes + sleepMinutes) % (24 * 60);
    const wakeHour = Math.floor(wakeMinutes / 60);
    const wakeMin = wakeMinutes % 60;

    const wakeTime = `${String(wakeHour).padStart(2, "0")}:${String(
      Math.floor(wakeMin)
    ).padStart(2, "0")}`;

    // 수면 단계 계산 (현실적인 비율, 깸 시간 포함)
    const baseDeep = sleepDuration * 0.18; // 18% 깊은잠
    const baseRem = sleepDuration * 0.13; // 13% 렘수면
    const baseLight = sleepDuration * 0.58; // 58% 얕은잠
    const baseAwake = sleepDuration * 0.11; // 11% 깸 (불면증 고려)

    // 개인차와 일간 변동 추가
    const deep = Math.round((baseDeep + (Math.random() - 0.5) * 0.8) * 10) / 10;
    const rem = Math.round((baseRem + (Math.random() - 0.5) * 0.5) * 10) / 10;
    const light =
      Math.round((baseLight + (Math.random() - 0.5) * 0.7) * 10) / 10;
    const awakeInSleep =
      Math.round((baseAwake + (Math.random() - 0.5) * 0.6) * 10) / 10;

    // 실제 수면 시간들 조정 (총합이 sleepDuration과 맞도록)
    const totalCalculated = deep + rem + light + awakeInSleep;
    const adjustmentFactor = sleepDuration / totalCalculated;

    const adjustedDeep = Math.max(
      0.3,
      Math.round(deep * adjustmentFactor * 10) / 10
    );
    const adjustedRem = Math.max(
      0.2,
      Math.round(rem * adjustmentFactor * 10) / 10
    );
    const adjustedLight = Math.max(
      1.5,
      Math.round(light * adjustmentFactor * 10) / 10
    );
    const adjustedAwake = Math.max(
      0.2,
      Math.round(awakeInSleep * adjustmentFactor * 10) / 10
    );

    // 실제 수면 시간 계산 (깸 제외)
    const actualSleep =
      Math.round((adjustedDeep + adjustedRem + adjustedLight) * 10) / 10;

    data[dateString] = {
      bedTime,
      wakeTime,
      score: Math.round(baseScore),
      deep: adjustedDeep,
      light: adjustedLight,
      rem: adjustedRem,
      awake: adjustedAwake, // 수면 중 깨어있는 시간
      actualSleep: actualSleep, // 실제 수면 시간 (깸 제외)
      totalSleepDuration: Math.round(sleepDuration * 10) / 10, // 총 침대에 있던 시간
    };

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return data;
};

// 특별한 패턴의 데이터 추가 (불면증, 스트레스, 여행, 병가 등)
const addSpecialPatterns = (data) => {
  // 심한 불면증 주간 (3월 중순) - 수면 중 자주 깸
  const insomniaWeek = [
    "2025-03-15",
    "2025-03-16",
    "2025-03-17",
    "2025-03-18",
    "2025-03-19",
    "2025-03-20",
    "2025-03-21",
  ];
  insomniaWeek.forEach((date) => {
    if (data[date]) {
      data[date].score = Math.max(35, data[date].score - 35); // 매우 낮은 점수
      data[date].awake = Math.min(3.0, data[date].awake + 1.5); // 수면 중 깸 크게 증가
      data[date].deep = Math.max(0.2, data[date].deep - 1.2); // 깊은잠 대폭 감소
      data[date].light = Math.max(1.0, data[date].light - 0.8); // 얕은잠도 감소
      data[date].bedTime = "02:00"; // 매우 늦게 잠

      // 실제 수면 시간 재계산
      data[date].actualSleep =
        Math.round((data[date].deep + data[date].light + data[date].rem) * 10) /
        10;
    }
  });

  // 스트레스 주간 (4월 첫 주) - 중간 정도 불면
  const stressWeek = [
    "2025-04-01",
    "2025-04-02",
    "2025-04-03",
    "2025-04-04",
    "2025-04-05",
  ];
  stressWeek.forEach((date) => {
    if (data[date]) {
      data[date].score = Math.max(45, data[date].score - 25); // 점수 하락
      data[date].deep = Math.max(0.8, data[date].deep - 0.8); // 깊은잠 감소
      data[date].awake = Math.min(2.2, data[date].awake + 0.8); // 수면 중 깸 증가 (스트레스)
      data[date].bedTime = "01:30"; // 늦게 잠

      // 실제 수면 시간 재계산
      data[date].actualSleep =
        Math.round((data[date].deep + data[date].light + data[date].rem) * 10) /
        10;
    }
  });

  // 완벽한 수면 주간 (5월 중순) - 거의 깨지 않음
  const perfectWeek = [
    "2025-05-12",
    "2025-05-13",
    "2025-05-14",
    "2025-05-15",
    "2025-05-16",
  ];
  perfectWeek.forEach((date) => {
    if (data[date]) {
      data[date].score = Math.min(95, data[date].score + 15); // 높은 점수
      data[date].bedTime = "22:30"; // 일찍 잠
      data[date].deep = Math.min(3.5, data[date].deep + 0.8); // 깊은잠 증가
      data[date].awake = Math.max(0.1, data[date].awake - 0.6); // 수면 중 깸 대폭 감소
      data[date].rem = Math.min(2.5, data[date].rem + 0.3); // 렘수면도 증가

      // 실제 수면 시간 재계산
      data[date].actualSleep =
        Math.round((data[date].deep + data[date].light + data[date].rem) * 10) /
        10;
    }
  });

  // 나이든 사람 패턴 (5월 첫 주) - 자주 깨지만 다시 잠듦
  const elderlyPattern = ["2025-05-01", "2025-05-02", "2025-05-03"];
  elderlyPattern.forEach((date) => {
    if (data[date]) {
      data[date].awake = Math.min(1.8, data[date].awake + 0.7); // 자주 깸
      data[date].deep = Math.max(0.5, data[date].deep - 0.5); // 깊은잠 감소
      data[date].light = Math.min(6.0, data[date].light + 0.3); // 얕은잠 증가
      data[date].bedTime = "21:30"; // 일찍 잠
      data[date].wakeTime = "05:30"; // 일찍 기상

      data[date].actualSleep =
        Math.round((data[date].deep + data[date].light + data[date].rem) * 10) /
        10;
    }
  });

  // 주말 늦잠 + 수면 패턴 변화
  Object.keys(data).forEach((dateString) => {
    const date = new Date(dateString);
    if (date.getDay() === 0 || date.getDay() === 6) {
      // 주말
      const currentWake = data[dateString].wakeTime;
      const [hour, minute] = currentWake.split(":").map(Number);
      const newHour = Math.min(10, hour + 1); // 최대 10시까지
      data[dateString].wakeTime = `${String(newHour).padStart(2, "0")}:${String(
        minute
      ).padStart(2, "0")}`;

      // 주말에는 조금 더 깊게 잠 (깸 감소)
      data[dateString].awake = Math.max(0.1, data[dateString].awake - 0.2);
      data[dateString].deep = Math.min(3.0, data[dateString].deep + 0.2);

      // 실제 수면 시간 재계산
      data[dateString].actualSleep =
        Math.round(
          (data[dateString].deep +
            data[dateString].light +
            data[dateString].rem) *
            10
        ) / 10;
    }
  });

  return data;
};
// Firebase에 더미 데이터가 있는지 확인
export const checkInitialData = async () => {
  try {
    const docRef = doc(
      db,
      "sleepData",
      TEST_USER_ID,
      "metadata",
      "initialized"
    );
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const metadata = docSnap.data();
      // 버전이 1.1보다 낮으면 재초기화 필요
      if (!metadata.version || metadata.version < "1.2") {
        console.log("🔄 데이터 구조가 업데이트되어 재초기화가 필요합니다.");
        return false; // 재초기화 실행
      }
      console.log("✅ 최신 버전 데이터가 이미 존재합니다.");
      return true; // 최신 버전이므로 초기화 건너뛰기
    }

    return false; // 데이터가 없으므로 초기화 필요
  } catch (error) {
    console.error("초기 데이터 확인 오류:", error);
    return false;
  }
};
// Firebase에 더미 데이터 초기화
export const initializeDummyData = async () => {
  try {
    console.log("🚀 Firebase 더미 데이터 초기화 시작...");

    // 이미 초기화되었는지 확인
    const isInitialized = await checkInitialData();
    if (isInitialized) {
      console.log("✅ 더미 데이터가 이미 초기화되어 있습니다.");
      return false;
    }

    // 더미 데이터 생성
    let dummyData = generateDummyData();
    dummyData = addSpecialPatterns(dummyData);

    console.log(`📝 생성된 더미 데이터: ${Object.keys(dummyData).length}개`);

    // 데이터 구조 샘플과 통계 출력
    const sampleData = Object.values(dummyData)[50]; // 중간 데이터 하나 선택
    console.log("📊 데이터 구조 샘플:", sampleData);

    // 깸 시간 통계
    const awakeStats = Object.values(dummyData).map((d) => d.awake);
    const avgAwake = awakeStats.reduce((a, b) => a + b, 0) / awakeStats.length;
    const maxAwake = Math.max(...awakeStats);
    const minAwake = Math.min(...awakeStats);

    console.log(
      `📈 깸 시간 통계: 평균 ${avgAwake.toFixed(
        1
      )}시간, 최대 ${maxAwake}시간, 최소 ${minAwake}시간`
    );

    // Firebase에 업로드
    const uploadPromises = Object.entries(dummyData).map(([date, data]) => {
      const docRef = doc(db, "sleepData", TEST_USER_ID, "dailyData", date);
      return setDoc(docRef, {
        ...data,
        date,
        userId: TEST_USER_ID,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    });

    await Promise.all(uploadPromises);

    // 초기화 완료 마크
    const metadataRef = doc(
      db,
      "sleepData",
      TEST_USER_ID,
      "metadata",
      "initialized"
    );
    await setDoc(metadataRef, {
      initializedAt: serverTimestamp(),
      dataCount: Object.keys(dummyData).length,
      version: "1.1", // 버전 업데이트 (awake 필드 추가)
    });

    console.log("🎉 Firebase 더미 데이터 초기화 완료!");
    return true;
  } catch (error) {
    console.error("❌ 더미 데이터 초기화 오류:", error);
    throw error;
  }
};

// 앱 시작 시 자동 초기화
export const autoInitializeData = async () => {
  try {
    const initialized = await initializeDummyData();
    if (initialized) {
      return {
        success: true,
        message: "3개월치 더미 데이터가 자동으로 생성되었습니다!",
      };
    } else {
      return {
        success: true,
        message: "기존 데이터를 사용합니다.",
      };
    }
  } catch (error) {
    return {
      success: false,
      message: "데이터 초기화 중 오류가 발생했습니다.",
    };
  }
};
