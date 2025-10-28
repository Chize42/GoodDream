// src/services/firebaseMessagingService.js

import { Platform } from "react-native";
import messaging from "@react-native-firebase/messaging";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { doc, updateDoc, setDoc } from "firebase/firestore";
import { db } from "./firebase";

// FCM 토큰 저장 키
const FCM_TOKEN_KEY = "fcm_token";

// FCM 권한 요청
export const requestFCMPermissions = async () => {
  try {
    // iOS에서만 권한 요청이 필요합니다 (Android는 자동으로 허용)
    if (Platform.OS === "ios") {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (!enabled) {
        console.log("알림 권한 거부됨");
        return false;
      }
    }

    console.log("FCM 권한 허용됨");
    return true;
  } catch (error) {
    console.error("FCM 권한 요청 실패:", error);
    return false;
  }
};

// FCM 토큰 가져오기 및 저장
export const getFCMToken = async () => {
  try {
    // 저장된 토큰 확인
    const savedToken = await AsyncStorage.getItem(FCM_TOKEN_KEY);

    // FCM 토큰 가져오기
    const fcmToken = await messaging().getToken();

    // 토큰이 변경되었거나 없는 경우 저장
    if (fcmToken !== savedToken) {
      await AsyncStorage.setItem(FCM_TOKEN_KEY, fcmToken);
      console.log("FCM 토큰 저장됨:", fcmToken);
    }

    return fcmToken;
  } catch (error) {
    console.error("FCM 토큰 가져오기 실패:", error);
    return null;
  }
};

// 사용자 문서에 FCM 토큰 저장
export const saveFCMTokenToFirestore = async (userId, token) => {
  if (!userId || !token) return;

  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      fcmTokens: {
        [token]: true,
        updatedAt: new Date().toISOString(),
      },
    });
    console.log("Firestore에 FCM 토큰 저장 완료");
  } catch (error) {
    // 문서가 없는 경우 새로 생성
    if (error.code === "not-found") {
      try {
        const userRef = doc(db, "users", userId);
        await setDoc(
          userRef,
          {
            fcmTokens: {
              [token]: true,
              updatedAt: new Date().toISOString(),
            },
          },
          { merge: true }
        );
        console.log("새 사용자 문서에 FCM 토큰 저장 완료");
      } catch (err) {
        console.error("FCM 토큰 저장 실패:", err);
      }
    } else {
      console.error("FCM 토큰 저장 실패:", error);
    }
  }
};

// 토픽 구독 (특정 스케줄에 대한 알림)
export const subscribeToSchedule = async (scheduleId) => {
  try {
    await messaging().subscribeToTopic(`schedule_${scheduleId}`);
    console.log(`스케줄 ${scheduleId} 토픽 구독 완료`);
    return true;
  } catch (error) {
    console.error(`스케줄 ${scheduleId} 토픽 구독 실패:`, error);
    return false;
  }
};
// 토픽 구독 확인
export const checkTopicSubscription = async (scheduleId) => {
  try {
    const fcmToken = await messaging().getToken();
    console.log(`FCM 토큰: ${fcmToken}`);

    // 구독 토픽 로그 출력
    console.log(`구독 중인 토픽: schedule_${scheduleId}`);

    // 테스트용: 다시 구독
    await messaging().subscribeToTopic(`schedule_${scheduleId}`);
    console.log(`토픽 재구독 완료: schedule_${scheduleId}`);

    return true;
  } catch (error) {
    console.error("토픽 구독 확인 실패:", error);
    return false;
  }
};
// 토픽 구독 해제
export const unsubscribeFromSchedule = async (scheduleId) => {
  try {
    await messaging().unsubscribeFromTopic(`schedule_${scheduleId}`);
    console.log(`스케줄 ${scheduleId} 토픽 구독 해제`);
    return true;
  } catch (error) {
    console.error(`스케줄 ${scheduleId} 토픽 구독 해제 실패:`, error);
    return false;
  }
};

// 알림 리스너 설정
export const setupNotificationListeners = () => {
  // 앱이 종료된 상태에서 알림 클릭시
  messaging()
    .getInitialNotification()
    .then((remoteMessage) => {
      if (remoteMessage) {
        console.log("알림 클릭으로 앱 실행:", remoteMessage);
        handleNotification(remoteMessage);
      }
    });

  // 앱이 백그라운드 상태에서 알림 클릭시
  messaging().onNotificationOpenedApp((remoteMessage) => {
    console.log("백그라운드 알림 클릭:", remoteMessage);
    handleNotification(remoteMessage);
  });

  // 앱이 포그라운드 상태일 때 알림 수신
  const unsubscribe = messaging().onMessage(async (remoteMessage) => {
    console.log("포그라운드 알림 수신:", remoteMessage);
    showForegroundNotification(remoteMessage);
  });

  return unsubscribe;
};

// 포그라운드 알림 표시 (직접 표시 필요)
const showForegroundNotification = (remoteMessage) => {
  // 리액트 네이티브에서 Alert를 사용해 알림 표시
  const { Alert } = require("react-native");

  Alert.alert(
    remoteMessage.notification?.title || "알림",
    remoteMessage.notification?.body || "",
    [{ text: "확인" }]
  );
};

// 알림 처리 함수
const handleNotification = (remoteMessage) => {
  // 알림 데이터 추출
  const data = remoteMessage.data || {};

  // 알림 타입에 따른 처리
  switch (data.type) {
    case "bedtime":
      // 취침 알림 처리 로직
      break;
    case "wakeup":
      // 기상 알림 처리 로직
      break;
    default:
      // 기타 알림 처리
      break;
  }
};

// 테스트용 즉시 알림
export const sendTestNotification = async () => {
  try {
    // 서버에 테스트 알림 요청 (실제로는 Cloud Functions 호출)
    // 개발 중 테스트용으로만 사용
    console.log("테스트 알림 요청 전송");

    // 실제로는 서버 API 호출
    /*
    const response = await fetch('https://yourserver.com/api/send-test-notification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: await getFCMToken(),
      }),
    });
    
    if (!response.ok) {
      throw new Error('서버 응답 오류');
    }
    
    const result = await response.json();
    console.log('테스트 알림 응답:', result);
    return result.success;
    */

    // 임시 성공 반환
    return true;
  } catch (error) {
    console.error("테스트 알림 실패:", error);
    return false;
  }
};

// 앱 알림 상태 확인
export const checkNotificationStatus = async () => {
  try {
    // FCM 토큰 확인
    const token = await getFCMToken();

    // 권한 상태 확인
    let authStatus = messaging.AuthorizationStatus.NOT_DETERMINED;

    try {
      authStatus = await messaging().hasPermission();
    } catch (e) {
      console.error("권한 확인 실패:", e);
    }

    return {
      hasToken: !!token,
      tokenValue: token ? token.substring(0, 10) + "..." : null,
      authStatus: authStatus,
      permissionGranted:
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL,
    };
  } catch (error) {
    console.error("알림 상태 확인 실패:", error);
    return {
      hasToken: false,
      tokenValue: null,
      authStatus: "error",
      permissionGranted: false,
      error: error.message,
    };
  }
};

// 테스트 기능 추가
export const testFCM = async () => {
  try {
    const token = await messaging().getToken();
    console.log("FCM 토큰:", token);

    const scheduleId = "1760792670266"; // 로그에서 확인한 실제 스케줄 ID

    await messaging().subscribeToTopic(`schedule_${scheduleId}`);
    console.log(`토픽 구독 완료: schedule_${scheduleId}`);

    return { token, topic: `schedule_${scheduleId}` };
  } catch (error) {
    console.error("FCM 테스트 오류:", error);
    return null;
  }
};
