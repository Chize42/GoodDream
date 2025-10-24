// src/services/fcmService.js
import messaging from "@react-native-firebase/messaging";
import { db } from "./firebase";
import { doc, setDoc } from "firebase/firestore";

// FCM 토큰 저장
export const saveFCMToken = async (userId) => {
  try {
    const token = await messaging().getToken();

    await setDoc(
      doc(db, "users", userId),
      {
        fcmToken: token,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    console.log("FCM 토큰 저장 완료:", token);
    return token;
  } catch (error) {
    console.error("FCM 토큰 저장 실패:", error);
    throw error;
  }
};

// 알림 권한 요청
export const requestFCMPermission = async () => {
  try {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log("알림 권한 승인됨");
      return true;
    }

    return false;
  } catch (error) {
    console.error("알림 권한 요청 실패:", error);
    return false;
  }
};

// 포그라운드 알림 처리
export const setupFCMListeners = () => {
  messaging().onMessage(async (remoteMessage) => {
    console.log("포그라운드 알림:", remoteMessage);
    // 여기서 커스텀 알림 UI 표시 가능
  });
};
