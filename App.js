// App.js
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, View, StyleSheet } from "react-native";

// Providers
import { MusicProvider } from "./src/contexts/MusicContext";
import { PlaylistProvider } from "./src/contexts/PlaylistContext";
import { AuthProvider, useAuth } from "./src/contexts/AuthContext";

// Auth Screens
import IntroScreen from "./src/screens/auth/IntroScreen";
import RegisterScreen from "./src/screens/auth/RegisterScreen";
import SignUpScreen from "./src/screens/auth/SignUpScreen";
import LoginScreen from "./src/screens/auth/LoginScreen";

// Main App Screens
import HomeScreen from "./src/screens/home/HomeScreen";
import MusicScreen from "./src/screens/music/MusicScreen";
import MusicLikeScreen from "./src/screens/music/MusicLikeScreen";
import MusicLikeDetailScreen from "./src/screens/music/MusicLikeDetailScreen";
import MusicPlayerScreen from "./src/screens/music/MusicPlayerScreen";
import SleepReportScreen from "./src/screens/sleepReport/SleepReportScreen";
import AddSleepDataScreen from "./src/screens/sleepReport/AddSleepDataScreen";
import SleepDetailScreen from "./src/screens/sleepReport/SleepDetailScreen";
import SettingsScreen from "./src/screens/settings/SettingsScreen";
import AccountScreen from "./src/screens/settings/AccountScreen";
import EditAccountScreen from "./src/screens/settings/EditAccountScreen";
import LinkScreen from "./src/screens/settings/LinkScreen";
import NotificationScreen from "./src/screens/settings/NotificationScreen";
import CustomerScreen from "./src/screens/settings/CustomerScreen";
import ServiceInquiryScreen from "./src/screens/settings/ServiceInquiryScreen";
import InquiryHistoryScreen from "./src/screens/settings/InquiryHistoryScreen";
import AdvertisementInquiryScreen from "./src/screens/settings/AdvertisementInquiryScreen";
import CompletedInquiryScreen from "./src/screens/settings/CompletedInquiryScreen";
import InquiryDetailScreen from "./src/screens/settings/InquiryDetailScreen";
import AdminInquiryDashboard from "./src/screens/admin/AdminInquiryDashboard";
import AdminInquiryDetailScreen from "./src/screens/admin/AdminInquiryDetailScreen";
import AdminLoginScreen from "./src/screens/admin/AdminLoginScreen";
import SleepScheduleScreen from "./src/screens/schedule/SleepScheduleScreen";
import AddSleepScheduleScreen from "./src/screens/schedule/AddSleepScheduleScreen";
import ChallengeScreen from "./src/screens/challenge/ChallengeScreen";
import ChallengeStartScreen from "./src/screens/challenge/ChallengeStartScreen";
import BubbleScreen from "./src/screens/bubble/BubbleScreen";
import Dismiss from "./src/screens/startsleeping/Dismiss";
import Play from "./src/screens/startsleeping/Play";

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
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="계정 센터" component={AccountScreen} />
      <Stack.Screen name="EditAccount" component={EditAccountScreen} />
      <Stack.Screen name="계정 연동" component={LinkScreen} />
      <Stack.Screen name="고객센터" component={CustomerScreen} />
      <Stack.Screen name="알림" component={NotificationScreen} />
      <Stack.Screen name="서비스 이용 문의" component={ServiceInquiryScreen} />
      <Stack.Screen name="문의 내역" component={InquiryHistoryScreen} />
      <Stack.Screen
        name="CompletedInquiryScreen"
        component={CompletedInquiryScreen}
      />
      <Stack.Screen name="광고 문의" component={AdvertisementInquiryScreen} />
      <Stack.Screen
        name="InquiryDetailScreen"
        component={InquiryDetailScreen}
      />
      <Stack.Screen name="SleepSchedule" component={SleepScheduleScreen} />
      <Stack.Screen
        name="AddSleepSchedule"
        component={AddSleepScheduleScreen}
      />
      <Stack.Screen name="Challenge" component={ChallengeScreen} />
      <Stack.Screen name="ChallengeStart" component={ChallengeStartScreen} />
      <Stack.Screen name="Bubble" component={BubbleScreen} />
      <Stack.Screen name="Dismiss" component={Dismiss} />
      <Stack.Screen name="Play" component={Play} />
      <Stack.Screen name="AdminDashboard" component={AdminInquiryDashboard} />
      <Stack.Screen
        name="AdminInquiryDetailScreen"
        component={AdminInquiryDetailScreen}
      />
      <Stack.Screen name="AdminLogin" component={AdminLoginScreen} />
    </Stack.Navigator>
  );
}

// 🔥 조건부 네비게이션 (로그인 상태 체크)
function RootNavigator() {
  const { user, loading } = useAuth();

  // Firebase Auth 초기화 대기 중
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4285f4" />
      </View>
    );
  }

  // ✅ 로그인 안 됨 → 인트로/로그인/회원가입 화면
  // ✅ 로그인 됨 → 메인 앱 화면
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      {user ? <MainStack /> : <AuthStack />}
    </NavigationContainer>
  );
}

// 메인 앱
export default function App() {
  return (
    <AuthProvider>
      <MusicProvider>
        <PlaylistProvider>
          <RootNavigator />
        </PlaylistProvider>
      </MusicProvider>
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
