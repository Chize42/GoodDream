// src/services/sleepService.js - 통일된 버전
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";

// 사용자 ID (실제로는 Firebase Auth에서 가져와야 하지만, 테스트용으로 하드코딩)
const TEST_USER_ID = "user123";

// 수면 데이터 저장
export const saveSleepData = async (date, sleepData) => {
  try {
    console.log(`💾 수면 데이터 저장 시도: ${date}`, sleepData);

    const docRef = doc(db, "sleepData", TEST_USER_ID, "dailyData", date);
    await setDoc(docRef, {
      ...sleepData,
      date,
      userId: TEST_USER_ID,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    console.log(`✅ 수면 데이터 저장 성공: ${date}`);
    return true;
  } catch (error) {
    console.error(`❌ 수면 데이터 저장 오류:`, error);
    throw error;
  }
};

// 수면 데이터 업데이트 (새로 추가)
export const updateSleepData = async (date, updates) => {
  try {
    console.log(`🔄 수면 데이터 업데이트 시도: ${date}`, updates);

    const docRef = doc(db, "sleepData", TEST_USER_ID, "dailyData", date);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });

    console.log(`✅ 수면 데이터 업데이트 성공: ${date}`);
    return true;
  } catch (error) {
    console.error(`❌ 수면 데이터 업데이트 오류:`, error);
    throw error;
  }
};

// 특정 날짜 수면 데이터 가져오기
export const getSleepData = async (date) => {
  try {
    console.log(`📖 수면 데이터 조회 시도: ${date}`);

    const docRef = doc(db, "sleepData", TEST_USER_ID, "dailyData", date);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      console.log(`✅ 수면 데이터 조회 성공: ${date}`);
      return docSnap.data();
    } else {
      console.log(`❌ 데이터 없음: ${date}`);
      return null;
    }
  } catch (error) {
    console.error(`❌ 수면 데이터 조회 오류:`, error);
    throw error;
  }
};

// 날짜 범위별 수면 데이터 가져오기 (월간 데이터용)
export const getSleepDataRange = async (startDate, endDate) => {
  try {
    console.log(`📖 수면 데이터 범위 조회: ${startDate} ~ ${endDate}`);

    const q = query(
      collection(db, "sleepData", TEST_USER_ID, "dailyData"),
      where("date", ">=", startDate),
      where("date", "<=", endDate),
      orderBy("date", "asc")
    );

    const querySnapshot = await getDocs(q);
    const data = {};

    querySnapshot.forEach((doc) => {
      data[doc.id] = doc.data();
    });

    console.log(`✅ 범위 데이터 조회 성공: ${Object.keys(data).length}개`);
    return data;
  } catch (error) {
    console.error(`❌ 범위 데이터 조회 오류:`, error);
    throw error;
  }
};

// 수면 데이터 삭제 (새로 추가)
export const deleteSleepData = async (date) => {
  try {
    console.log(`🗑️ 수면 데이터 삭제 시도: ${date}`);

    const docRef = doc(db, "sleepData", TEST_USER_ID, "dailyData", date);
    await deleteDoc(docRef);

    console.log(`✅ 수면 데이터 삭제 성공: ${date}`);
    return true;
  } catch (error) {
    console.error(`❌ 수면 데이터 삭제 오류:`, error);
    throw error;
  }
};

// 더미 데이터를 Firebase에 업로드 - initializeData 구조 사용
export const uploadDummyData = async () => {
  console.log("🚀 initializeData 구조 사용한 더미 데이터 업로드...");

  try {
    // initializeData의 생성 로직 사용
    const { initializeDummyData } = await import("./initializeData");
    await initializeDummyData();

    console.log("🎉 통일된 구조로 더미 데이터 업로드 완료!");
    return true;
  } catch (error) {
    console.error("❌ 더미 데이터 업로드 실패:", error);
    throw error;
  }
};

// 새로운 수면 데이터 추가 - awake 필드 포함
export const addNewSleepData = async (date, bedTime, wakeTime, score) => {
  // 수면 시간 계산
  const bedTimeMinutes =
    parseInt(bedTime.split(":")[0]) * 60 + parseInt(bedTime.split(":")[1]);
  const wakeTimeMinutes =
    parseInt(wakeTime.split(":")[0]) * 60 + parseInt(wakeTime.split(":")[1]);

  let totalMinutes = wakeTimeMinutes - bedTimeMinutes;
  if (totalMinutes < 0) totalMinutes += 24 * 60; // 다음날 기상

  const sleepDuration = totalMinutes / 60;

  // 현실적인 수면 단계 비율 계산
  const baseDeep = sleepDuration * 0.18;
  const baseRem = sleepDuration * 0.13;
  const baseLight = sleepDuration * 0.58;
  const baseAwake = sleepDuration * 0.11;

  const deep = Math.max(
    0.3,
    Math.round((baseDeep + (Math.random() - 0.5) * 0.5) * 10) / 10
  );
  const rem = Math.max(
    0.2,
    Math.round((baseRem + (Math.random() - 0.5) * 0.3) * 10) / 10
  );
  const light = Math.max(
    1.5,
    Math.round((baseLight + (Math.random() - 0.5) * 0.4) * 10) / 10
  );
  const awake = Math.max(
    0.1,
    Math.round((baseAwake + (Math.random() - 0.5) * 0.3) * 10) / 10
  );

  // 총합이 sleepDuration과 맞도록 조정
  const total = deep + rem + light + awake;
  const factor = sleepDuration / total;

  const adjustedDeep = Math.round(deep * factor * 10) / 10;
  const adjustedRem = Math.round(rem * factor * 10) / 10;
  const adjustedLight = Math.round(light * factor * 10) / 10;
  const adjustedAwake = Math.round(awake * factor * 10) / 10;
  const actualSleep =
    Math.round((adjustedDeep + adjustedRem + adjustedLight) * 10) / 10;

  const newData = {
    bedTime,
    wakeTime,
    score,
    deep: adjustedDeep,
    light: adjustedLight,
    rem: adjustedRem,
    awake: adjustedAwake,
    actualSleep: actualSleep,
    totalSleepDuration: Math.round(sleepDuration * 10) / 10,
  };

  return await saveSleepData(date, newData);
};
