// src/contexts/AuthContext.tsx
import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  User,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../services/firebase";

// ✅ TypeScript 타입 정의
interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (
    email: string,
    password: string,
    userData: UserData
  ) => Promise<User>;
  signIn: (email: string, password: string) => Promise<User>;
  signOut: () => Promise<void>;
}

interface UserData {
  username: string;
  age: string;
  gender: string;
  phoneNumber: string;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 🔥 Firebase Auth 상태 감지 (자동 로그인)
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log("👤 Auth 상태:", currentUser?.email || "로그아웃");
      setUser(currentUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // 회원가입
  const signUp = async (
    email: string,
    password: string,
    userData: UserData
  ): Promise<User> => {
    try {
      console.log("🚀 회원가입 시작:", email);

      // 1. Firebase Auth 계정 생성
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const newUser = userCredential.user;

      // 2. Firestore에 사용자 정보 저장
      await setDoc(doc(db, "users", newUser.uid), {
        username: userData.username,
        email: email,
        age: userData.age,
        gender: userData.gender,
        phoneNumber: userData.phoneNumber,
        createdAt: new Date(),
      });

      console.log("✅ Firestore 사용자 정보 저장 완료");

      return newUser;
    } catch (error: any) {
      console.error("❌ 회원가입 실패:", error.message);
      throw error;
    }
  };

  // 로그인
  const signIn = async (email: string, password: string): Promise<User> => {
    try {
      console.log("🔑 로그인 시도:", email);
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      console.log("✅ 로그인 성공");
      return userCredential.user;
    } catch (error: any) {
      console.error("❌ 로그인 실패:", error.message);
      throw error;
    }
  };

  // 로그아웃
  const signOut = async (): Promise<void> => {
    try {
      await firebaseSignOut(auth);
      console.log("✅ 로그아웃 성공");
    } catch (error: any) {
      console.error("❌ 로그아웃 실패:", error.message);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth는 AuthProvider 내부에서만 사용 가능합니다");
  }
  return context;
};