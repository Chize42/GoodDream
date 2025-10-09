// App.js
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { StatusBar } from "expo-status-bar";

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
import LinkScreen from "./src/screens/settings/LinkScreen";
import NotificationScreen from "./src/screens/settings/NotificationScreen";
import CustomerScreen from "./src/screens/settings/CustomerScreen";
import ServiceInquiryScreen from "./src/screens/settings/ServiceInquiryScreen";
import InquiryHistoryScreen from "./src/screens/settings/InquiryHistoryScreen";
import AdvertisementInquiryScreen from "./src/screens/settings/AdvertisementInquiryScreen";
import CompletedInquiryScreen from "./src/screens/settings/CompletedInquiryScreen";

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

const Stack = createStackNavigator();

export default function App() {
  return (
    <MusicProvider>
    <PlaylistProvider>
      <NavigationContainer>
        <StatusBar style="light" />
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
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Music" component={MusicScreen} />
          <Stack.Screen name="MusicLike" component={MusicLikeScreen} />
          <Stack.Screen
            name="MusicLikeDetail"
            component={MusicLikeDetailScreen}
          />
          <Stack.Screen name="MusicPlayer" component={MusicPlayerScreen} />
          <Stack.Screen name="SleepReport" component={SleepReportScreen} />
          <Stack.Screen name="AddSleepData" component={AddSleepDataScreen} />
          <Stack.Screen name="SleepDetail" component={SleepDetailScreen} />
          {/* Settings 관련 화면들 */}
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="계정 센터" component={AccountScreen} />
          <Stack.Screen name="EditAccount" component={EditAccountScreen} />
          <Stack.Screen name="계정 연동" component={LinkScreen} />
          <Stack.Screen name="고객센터" component={CustomerScreen} />
          <Stack.Screen name="알림" component={NotificationScreen} />
          <Stack.Screen
            name="서비스 이용 문의"
            component={ServiceInquiryScreen}
          />
          <Stack.Screen name="문의 내역" component={InquiryHistoryScreen} />
          <Stack.Screen name="완료된 문의" component={CompletedInquiryScreen} />
          <Stack.Screen
            name="광고 문의"
            component={AdvertisementInquiryScreen}
          />
          {/* ScheduleAlarm 관련 화면들 */}
          <Stack.Screen name="SleepSchedule" component={SleepScheduleScreen} />
          <Stack.Screen
            name="AddSleepSchedule"
            component={AddSleepScheduleScreen}
          />
          {/* Challenge 관련 화면들 */}
          <Stack.Screen name="Challenge" component={ChallengeScreen} />
          <Stack.Screen
            name="ChallengeStart"
            component={ChallengeStartScreen}
          />
          {/* Bubble 관련 화면들 */}
          <Stack.Screen name="Bubble" component={BubbleScreen} />
          {/*Start Sleeping 관련 화면들*/}
          <Stack.Screen name="Dismiss" component={Dismiss} />
          <Stack.Screen name="Play" component={Play} />
        </Stack.Navigator>
      </NavigationContainer>
      </PlaylistProvider>
    </MusicProvider>
  );
}
