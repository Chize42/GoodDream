// src/services/sleepService.js
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

// ✅ 사용자별 sleepData 경로
const getUserSleepDataCollection = (userId) => {
  if (!userId) throw new Error("로그인이 필요합니다");
  return collection(db, "users", userId, "sleepData");
};

// 수면 데이터 저장
export const saveSleepData = async (userId, date, sleepData) => {
  try {
    console.log(`💾 수면 데이터 저장: ${userId} - ${date}`);

    const docRef = doc(getUserSleepDataCollection(userId), date);
    await setDoc(docRef, {
      ...sleepData,
      date,
      userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    console.log(`✅ 수면 데이터 저장 성공`);
    return true;
  } catch (error) {
    console.error(`❌ 수면 데이터 저장 오류:`, error);
    throw error;
  }
};

// 수면 데이터 업데이트
export const updateSleepData = async (userId, date, updates) => {
  try {
    console.log(`🔄 수면 데이터 업데이트: ${userId} - ${date}`);

    const docRef = doc(getUserSleepDataCollection(userId), date);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });

    console.log(`✅ 수면 데이터 업데이트 성공`);
    return true;
  } catch (error) {
    console.error(`❌ 수면 데이터 업데이트 오류:`, error);
    throw error;
  }
};

// 특정 날짜 수면 데이터 가져오기
export const getSleepData = async (userId, date) => {
  try {
    console.log(`📖 수면 데이터 조회: ${userId} - ${date}`);

    const docRef = doc(getUserSleepDataCollection(userId), date);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      console.log(`✅ 수면 데이터 조회 성공`);
      return docSnap.data();
    } else {
      console.log(`❌ 데이터 없음`);
      return null;
    }
  } catch (error) {
    console.error(`❌ 수면 데이터 조회 오류:`, error);
    throw error;
  }
};

// 날짜 범위별 수면 데이터 가져오기
// 날짜 범위별 수면 데이터 가져오기
export const getSleepDataRange = async (userId, startDate, endDate) => {
  try {
    // ✅ userId 유효성 검사 추가
    if (!userId) {
      console.error("❌ userId가 없습니다");
      throw new Error("로그인이 필요합니다");
    }

    console.log(`📖 범위 조회: ${userId} - ${startDate} ~ ${endDate}`);

    const q = query(
      getUserSleepDataCollection(userId),
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

// 수면 데이터 삭제
export const deleteSleepData = async (userId, date) => {
  try {
    console.log(`🗑️ 수면 데이터 삭제: ${userId} - ${date}`);

    const docRef = doc(getUserSleepDataCollection(userId), date);
    await deleteDoc(docRef);

    console.log(`✅ 수면 데이터 삭제 성공`);
    return true;
  } catch (error) {
    console.error(`❌ 수면 데이터 삭제 오류:`, error);
    throw error;
  }
};

// 새로운 수면 데이터 추가
export const addNewSleepData = async (
  userId,
  date,
  bedTime,
  wakeTime,
  score
) => {
  const bedTimeMinutes =
    parseInt(bedTime.split(":")[0]) * 60 + parseInt(bedTime.split(":")[1]);
  const wakeTimeMinutes =
    parseInt(wakeTime.split(":")[0]) * 60 + parseInt(wakeTime.split(":")[1]);

  let totalMinutes = wakeTimeMinutes - bedTimeMinutes;
  if (totalMinutes < 0) totalMinutes += 24 * 60;

  const sleepDuration = totalMinutes / 60;

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

  return await saveSleepData(userId, date, newData);
};
