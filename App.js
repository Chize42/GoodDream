globalThis.RNFB_SILENCE_MODULAR_DEPRECATION_WARNINGS = true;
// App.js
import React, { useEffect } from "react";
import {
  View,
  ActivityIndicator,
  StyleSheet,
  Platform,
  Alert,
} from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { StatusBar } from "expo-status-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Firebase Messaging 관련 임포트 추가
import messaging from "@react-native-firebase/messaging";

// MusicProvider import 추가
import { MusicProvider } from "./src/contexts/MusicContext";
import { PlaylistProvider } from "./src/contexts/PlaylistContext";

import IntroScreen from "./src/screens/auth/IntroScreen";
import RegisterScreen from "./src/screens/auth/RegisterScreen";
import SignUpScreen from "./src/screens/auth/SignUpScreen";
import LoginScreen from "./src/screens/auth/LoginScreen";
import HomeScreen from "./src/screens/home/HomeScreen";
import MusicScreen from "./src/screens/music/MusicScreen";
import MusicLikeScreen from "./src/screens/music/MusicLikeScreen";
import MusicLikeDetailScreen from "./src/screens/music/MusicLikeDetailScreen";
import MusicPlayerScreen from "./src/screens/music/MusicPlayerScreen";
import SleepReportScreen from "./src/screens/sleepReport/SleepReportScreen";
import AddSleepDataScreen from "./src/screens/sleepReport/AddSleepDataScreen";
import SleepDetailScreen from "./src/screens/sleepReport/SleepDetailScreen";

// Settings 관련 화면들 추가
import SettingsScreen from "./src/screens/settings/SettingsScreen";
import AccountScreen from "./src/screens/settings/AccountScreen";
import EditAccountScreen from "./src/screens/settings/EditAccountScreen";
import CustomerScreen from "./src/screens/settings/CustomerScreen";
import ServiceInquiryScreen from "./src/screens/settings/ServiceInquiryScreen";
import InquiryHistoryScreen from "./src/screens/settings/InquiryHistoryScreen";
import CompletedInquiryScreen from "./src/screens/settings/CompletedInquiryScreen";
import InquiryDetailScreen from "./src/screens/settings/InquiryDetailScreen";
import NotificationScreen from "./src/screens/settings/NotificationScreen";
import HealthConnectSettingsScreen from "./src/screens/settings/HealthConnectSettingsScreen";

//관리자 모드 화면들 추가
import AdminInquiryDashboard from "./src/screens/admin/AdminInquiryDashboard";
import AdminInquiryDetailScreen from "./src/screens/admin/AdminInquiryDetailScreen";
import AdminLoginScreen from "./src/screens/admin/AdminLoginScreen";

// ScheduleAlarm 관련 화면들 추가
import SleepScheduleScreen from "./src/screens/schedule/SleepScheduleScreen";
import AddSleepScheduleScreen from "./src/screens/schedule/AddSleepScheduleScreen";

// Challenge 관련 화면들 추가
import ChallengeScreen from "./src/screens/challenge/ChallengeScreen";
import ChallengeStartScreen from "./src/screens/challenge/ChallengeStartScreen";

// Bubble 관련 화면들 추가
import BubbleScreen from "./src/screens/bubble/BubbleScreen";

//Start Sleeping 관련 화면들 추가
import Dismiss from "./src/screens/startsleeping/Dismiss";
import Play from "./src/screens/startsleeping/Play";


//auth context 관련 코드 임포트
import { AuthProvider, useAuth } from "./src/contexts/AuthContext";
import { CommonActions } from "@react-navigation/native";
import { SyncProvider } from "./src/contexts/SyncContext";
import DreamInputScreen from "./src/screens/DreamInputScreen";



// FCM 토큰 저장 키
const FCM_TOKEN_KEY = "fcm_token";

const Stack = createStackNavigator();

// 🔥 인증되지 않은 사용자용 네비게이션
function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: "#181820" },
      }}
    >
      <Stack.Screen name="Intro" component={IntroScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
    </Stack.Navigator>
  );
}

// 🔥 인증된 사용자용 네비게이션 (메인 앱)
function MainStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: "#181820" },
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Music" component={MusicScreen} />
      <Stack.Screen name="MusicLike" component={MusicLikeScreen} />
      <Stack.Screen name="MusicLikeDetail" component={MusicLikeDetailScreen} />
      <Stack.Screen name="MusicPlayer" component={MusicPlayerScreen} />
      <Stack.Screen name="SleepReport" component={SleepReportScreen} />
      <Stack.Screen name="AddSleepData" component={AddSleepDataScreen} />
      <Stack.Screen name="SleepDetail" component={SleepDetailScreen} />
      {/* Settings 관련 화면들 */}
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="계정 센터" component={AccountScreen} />
      <Stack.Screen name="EditAccount" component={EditAccountScreen} />
      <Stack.Screen name="고객센터" component={CustomerScreen} />
      <Stack.Screen name="알림" component={NotificationScreen} />
      <Stack.Screen name="서비스 이용 문의" component={ServiceInquiryScreen} />
      <Stack.Screen name="문의 내역" component={InquiryHistoryScreen} />
      <Stack.Screen
        name="HealthConnectSettings"
        component={HealthConnectSettingsScreen}
      />
      <Stack.Screen
        name="CompletedInquiryScreen"
        component={CompletedInquiryScreen}
      />
      <Stack.Screen
        name="InquiryDetailScreen"
        component={InquiryDetailScreen}
      />
      {/* ScheduleAlarm 관련 화면들 */}
      <Stack.Screen name="SleepSchedule" component={SleepScheduleScreen} />
      <Stack.Screen
        name="AddSleepSchedule"
        component={AddSleepScheduleScreen}
      />
      {/* Challenge 관련 화면들 */}
      <Stack.Screen name="Challenge" component={ChallengeScreen} />
      <Stack.Screen name="ChallengeStart" component={ChallengeStartScreen} />
      {/* Bubble 관련 화면들 */}
      <Stack.Screen name="Bubble" component={BubbleScreen} />
      {/*Start Sleeping 관련 화면들*/}
      <Stack.Screen name="Dismiss" component={Dismiss} />
      <Stack.Screen name="Play" component={Play} />

      {/*admin 관련 화면들 */}
      <Stack.Screen name="AdminDashboard" component={AdminInquiryDashboard} />
      <Stack.Screen
        name="AdminInquiryDetailScreen"
        component={AdminInquiryDetailScreen}
      />
      <Stack.Screen
        name="AdminLogin"
        component={AdminLoginScreen}
        options={{ headerShown: false }}
      />


      <Stack.Screen 
        name="DreamInput" 
        component={DreamInputScreen} 
        options={{ headerShown: false }} 
      />
    </Stack.Navigator>
    
  );
}

// FCM 권한 요청 함수
const requestFCMPermissions = async () => {
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
const getFCMToken = async () => {
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

// 사용자 문서에 FCM 토큰 저장 (Firestore)
const saveFCMTokenToFirestore = async (userId, token) => {
  if (!userId || !token) return;

  try {
    const db = require("./src/services/firebase").db;
    const { doc, updateDoc, setDoc } = require("firebase/firestore");

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
        const db = require("./src/services/firebase").db;
        const { doc, setDoc } = require("firebase/firestore");

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

// 알림 핸들러 설정
const setupNotificationHandlers = () => {
  // 포그라운드 알림 핸들러 (앱 실행 중)
  messaging().onMessage(async (remoteMessage) => {
    console.log("포그라운드 알림 수신:", remoteMessage);

    // 포그라운드에서 알림 표시 (수동으로 처리해야 함)
    Alert.alert(
      remoteMessage.notification?.title || "알림",
      remoteMessage.notification?.body || "",
      [{ text: "확인" }]
    );
  });

  // 앱이 백그라운드에서 열린 경우
  messaging().onNotificationOpenedApp((remoteMessage) => {
    console.log("백그라운드 알림으로 앱 열림:", remoteMessage);

    // 알림 데이터에 따라 특정 화면으로 이동할 수 있음
    if (remoteMessage.data?.scheduleId) {
      // TODO: 스케줄 화면으로 이동 로직 추가
    }
  });

  // 앱이 종료된 상태에서 알림으로 열린 경우
  messaging()
    .getInitialNotification()
    .then((remoteMessage) => {
      if (remoteMessage) {
        console.log("종료 상태에서 알림으로 앱 실행:", remoteMessage);

        // 알림 데이터에 따라 특정 화면으로 이동할 수 있음
        // 이 경우 네비게이션 설정 후에 처리해야 함
      }
    });

  // 알림 이벤트 구독 (백그라운드)
  messaging().setBackgroundMessageHandler(async (remoteMessage) => {
    console.log("백그라운드 메시지 처리:", remoteMessage);
    return Promise.resolve();
  });
};

// 🔥 조건부 네비게이션 (로그인 상태 체크)
function RootNavigator() {
  const { user, loading } = useAuth();
  const navigationRef = React.useRef(null);

  // Firebase Messaging 초기화
  useEffect(() => {
    const initFirebaseMessaging = async () => {
      try {
        // FCM 권한 요청
        const hasPermission = await requestFCMPermissions();
        if (!hasPermission) {
          console.log("FCM 권한 없음");
          return;
        }

        // FCM 토큰 가져오기
        const token = await getFCMToken();
        console.log("FCM 토큰 가져옴:", token ? "성공" : "실패");

        // 사용자가 로그인한 경우 토큰 저장
        if (user && token) {
          await saveFCMTokenToFirestore(user.uid, token);
        }

        // 알림 핸들러 설정
        setupNotificationHandlers();
      } catch (error) {
        console.error("Firebase Messaging 초기화 실패:", error);
      }
    };

    // FCM 초기화 함수 호출
    initFirebaseMessaging();

    // 안드로이드에서 알림 채널 생성
    if (Platform.OS === "android") {
      try {
        console.log(
          "안드로이드 알림 채널은 AndroidManifest.xml에 정의되어 있습니다."
        );
      } catch (e) {
        console.error("알림 채널 생성 실패:", e);
      }
    }
  }, [user]); // 사용자가 변경될 때마다 실행

  // ✅ 로그인 상태 변경 시 네비게이션 업데이트
  React.useEffect(() => {
    if (!loading && navigationRef.current) {
      if (user) {
        navigationRef.current?.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: "Home" }],
          })
        );
      } else {
        navigationRef.current?.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: "Intro" }],
          })
        );
      }
    }
  }, [user, loading]);

  // ✅ 조건부 return은 모든 Hook 다음에!
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4285f4" />
      </View>
    );
  }

  return (
    <NavigationContainer
      ref={navigationRef}
      key={user ? "authenticated" : "unauthenticated"}
    >
      <StatusBar style="light" />
      {user ? <MainStack /> : <AuthStack />}
    </NavigationContainer>
  );
}

// 메인 앱
export default function App() {
  return (
    <AuthProvider>
      <SyncProvider>
        <MusicProvider>
          <PlaylistProvider>
            <RootNavigator />
          </PlaylistProvider>
        </MusicProvider>
      </SyncProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#181820",
  },
});
