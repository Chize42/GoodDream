// src/services/sleepService.js
import { db } from "./firebase";
import {
  collection,
  doc,
  setDoc,
  getDoc,
  query,
  where,
  getDocs,
  orderBy,
  Timestamp,
} from "firebase/firestore";

// 수면 데이터 저장
export const saveSleepData = async (userId, sleepData) => {
  try {
    console.log("💾 수면 데이터 저장:", userId, "-", sleepData);

    if (!userId || !sleepData.date) {
      throw new Error("필수 데이터가 없습니다");
    }

    const sleepDocRef = doc(db, "users", userId, "sleepData", sleepData.date);

    // 기존 데이터 확인
    const existingDoc = await getDoc(sleepDocRef);
    const isUpdate = existingDoc.exists();

    // 👇 저장할 데이터 준비 (undefined 제거)
    const dataToSave = {
      date: sleepData.date,
      duration: sleepData.duration || 0,
      bedTime: sleepData.bedTime || "00:00",
      wakeTime: sleepData.wakeTime || "00:00",
      bedTimeISO: sleepData.bedTimeISO || null,
      wakeTimeISO: sleepData.wakeTimeISO || null,
      recordId: sleepData.recordId || null,
      source: sleepData.source || "manual",
      userId: userId,
      updatedAt: Timestamp.now(),
    };

    // 👇 수면 단계 데이터가 있으면 추가 (undefined 방지)
    if (sleepData.deep !== undefined && sleepData.deep > 0) {
      dataToSave.deep = sleepData.deep;
    }
    if (sleepData.light !== undefined && sleepData.light > 0) {
      dataToSave.light = sleepData.light;
    }
    if (sleepData.rem !== undefined && sleepData.rem > 0) {
      dataToSave.rem = sleepData.rem;
    }
    if (sleepData.awake !== undefined && sleepData.awake > 0) {
      dataToSave.awake = sleepData.awake;
    }

    // 👇 수면 점수 계산
    const score = calculateSleepScore(sleepData);
    dataToSave.score = score;

    // 👇 수면 품질 판정
    dataToSave.quality = score >= 80 ? "좋음" : score >= 60 ? "보통" : "나쁨";

    // 👇 actualSleep과 totalSleepDuration 계산
    if (dataToSave.deep || dataToSave.light || dataToSave.rem) {
      // 수면 단계 데이터가 있으면
      dataToSave.actualSleep =
        (dataToSave.deep || 0) +
        (dataToSave.light || 0) +
        (dataToSave.rem || 0);
      dataToSave.totalSleepDuration =
        dataToSave.actualSleep + (dataToSave.awake || 0);
    } else {
      // 수면 단계 데이터가 없으면 duration 사용
      dataToSave.actualSleep = sleepData.duration / 60;
      dataToSave.totalSleepDuration = dataToSave.actualSleep;
    }

    // 👇 동기화 시간 (신규 생성일 때만)
    if (!isUpdate) {
      dataToSave.createdAt = Timestamp.now();
      dataToSave.syncedAt = new Date().toISOString();
    } else {
      dataToSave.syncedAt = new Date().toISOString();
    }

    console.log("💾 저장할 최종 데이터:", JSON.stringify(dataToSave, null, 2));

    await setDoc(sleepDocRef, dataToSave, { merge: true });

    console.log(
      `✅ 저장 완료: ${sleepData.date} (${isUpdate ? "업데이트" : "신규"})`
    );

    return {
      success: true,
      updated: isUpdate,
      data: dataToSave,
    };
  } catch (error) {
    console.error("❌ 수면 데이터 저장 오류:", error);
    throw error;
  }
};

// 👇 수면 점수 계산 함수
const calculateSleepScore = (sleepData) => {
  if (!sleepData) return 0;

  const { deep = 0, light = 0, rem = 0, awake = 0, duration = 0 } = sleepData;

  // 수면 시간 계산
  let sleepHours = 0;
  if (deep > 0 || light > 0 || rem > 0) {
    sleepHours = deep + light + rem;
  } else if (duration > 0) {
    sleepHours = duration / 60;
  } else {
    return 0;
  }

  // 상세 데이터가 있으면 정밀 계산
  if (deep > 0 || light > 0 || rem > 0) {
    const totalSleep = deep + light + rem;
    const totalBedTime = totalSleep + awake;

    // 1. 수면 효율 (40점)
    const sleepEfficiency = totalSleep / totalBedTime;
    let efficiencyScore = 0;
    if (sleepEfficiency >= 0.85) efficiencyScore = 40;
    else if (sleepEfficiency >= 0.75) efficiencyScore = 35;
    else if (sleepEfficiency >= 0.65) efficiencyScore = 25;
    else efficiencyScore = Math.max(0, sleepEfficiency * 40);

    // 2. 수면 단계 비율 (30점)
    const deepRatio = deep / totalSleep;
    const remRatio = rem / totalSleep;
    const lightRatio = light / totalSleep;

    const idealDeep = 0.2;
    const idealRem = 0.25;
    const idealLight = 0.55;

    const deepScore = Math.max(0, 10 - Math.abs(deepRatio - idealDeep) * 50);
    const remScore = Math.max(0, 10 - Math.abs(remRatio - idealRem) * 40);
    const lightScore = Math.max(0, 10 - Math.abs(lightRatio - idealLight) * 20);
    const stageScore = deepScore + remScore + lightScore;

    // 3. 권장 수면시간 대비 (30점)
    const recommendedSleep = 8;
    const sleepTimeRatio = totalSleep / recommendedSleep;
    let timeScore = 0;

    if (sleepTimeRatio >= 0.9 && sleepTimeRatio <= 1.1) {
      timeScore = 30;
    } else if (sleepTimeRatio >= 0.8 && sleepTimeRatio <= 1.2) {
      timeScore = 25;
    } else if (sleepTimeRatio >= 0.7 && sleepTimeRatio <= 1.3) {
      timeScore = 15;
    } else {
      timeScore = Math.max(0, 30 - Math.abs(sleepTimeRatio - 1) * 30);
    }

    const totalScore = Math.round(efficiencyScore + stageScore + timeScore);
    return Math.min(100, Math.max(0, totalScore));
  }

  // 상세 데이터 없으면 수면 시간만으로 계산
  const recommendedSleep = 8;
  let timeScore = 0;

  if (sleepHours >= 7 && sleepHours <= 9) {
    const deviation = Math.abs(sleepHours - 8);
    timeScore = Math.round(100 - deviation * 10);
  } else if (sleepHours >= 6 && sleepHours <= 10) {
    const deviation = sleepHours < 7 ? 7 - sleepHours : sleepHours - 9;
    timeScore = Math.round(80 - deviation * 20);
  } else if (sleepHours >= 5 && sleepHours <= 11) {
    const deviation = sleepHours < 6 ? 6 - sleepHours : sleepHours - 10;
    timeScore = Math.round(60 - deviation * 20);
  } else if (sleepHours >= 4 && sleepHours <= 12) {
    const deviation = sleepHours < 5 ? 5 - sleepHours : sleepHours - 11;
    timeScore = Math.round(40 - deviation * 20);
  } else {
    const deviation = sleepHours < 4 ? 4 - sleepHours : sleepHours - 12;
    timeScore = Math.max(0, Math.round(20 - deviation * 5));
  }

  return Math.min(100, Math.max(0, timeScore));
};

// 특정 날짜의 수면 데이터 가져오기
export const getSleepData = async (userId, date) => {
  try {
    const sleepDocRef = doc(db, "users", userId, "sleepData", date);
    const docSnap = await getDoc(sleepDocRef);

    if (docSnap.exists()) {
      return { success: true, data: docSnap.data() };
    }

    return { success: true, data: null };
  } catch (error) {
    console.error("수면 데이터 조회 오류:", error);
    return { success: false, error: error.message };
  }
};

// 날짜 범위의 수면 데이터 가져오기
export const getSleepDataRange = async (userId, startDate, endDate) => {
  try {
    console.log(`📖 범위 조회: ${userId} - ${startDate} ~ ${endDate}`);

    const sleepCollectionRef = collection(db, "users", userId, "sleepData");
    const q = query(
      sleepCollectionRef,
      where("date", ">=", startDate),
      where("date", "<=", endDate),
      orderBy("date", "asc")
    );

    const querySnapshot = await getDocs(q);
    const sleepDataMap = {};

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      sleepDataMap[data.date] = data;
    });

    console.log(
      `✅ 범위 데이터 조회 성공: ${Object.keys(sleepDataMap).length}개`
    );
    return sleepDataMap;
  } catch (error) {
    console.error("범위 데이터 조회 오류:", error);
    throw error;
  }
};
