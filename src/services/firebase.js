// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";

//설정
const firebaseConfig = {
  apiKey: "AIzaSyDmKS-d0Qeg1PSlQh4EyJJtIXAOsneQDDo",
  authDomain: "sleep-tracker-app-51c1c.firebaseapp.com",
  projectId: "sleep-tracker-app-51c1c",
  storageBucket: "sleep-tracker-app-51c1c.firebasestorage.app",
  messagingSenderId: "524609540766",
  appId: "1:524609540766:web:7b5a49e43925ab2ec7218f",
  measurementId: "G-0YYLFPT0ZD",
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);

// 서비스 초기화
export const db = getFirestore(app);
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

export default app;
