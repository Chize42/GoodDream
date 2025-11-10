// src/screens/settings/AccountScreen.js

import React, { useState, useEffect } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { useAuth } from "../../contexts/AuthContext";
import { doc, getDoc, deleteDoc } from "firebase/firestore";
import { db, auth } from "../../services/firebase";
import { deleteUser } from "firebase/auth";

export default function AccountScreen({ navigation, route }) {
  const { user, signOut } = useAuth();
  const [userInfo, setUserInfo] = useState({
    name: "",
    age: "",
    gender: "",
    genderDisplay: "",
    email: "",
  });
  const [loading, setLoading] = useState(true);
  useFocusEffect(
    React.useCallback(() => {
      loadUserInfo();
    }, [user])
  );
  // ✅ 사용자 정보 로드
  useEffect(() => {
    loadUserInfo();
  }, [user]);

  // ✅ 수정 후 돌아왔을 때 처리
  useEffect(() => {
    if (route.params?.updatedUser) {
      const updated = route.params.updatedUser;

      // ✅ 성별 표시 변환
      const getGenderText = (gender) => {
        if (gender === "male") return "남자";
        if (gender === "female") return "여자";
        return "미등록";
      };

      setUserInfo({
        ...updated,
        genderDisplay: getGenderText(updated.gender),
      });
      navigation.setParams({ updatedUser: null });
    }
  }, [route.params?.updatedUser]);

  const loadUserInfo = async () => {
    try {
      if (!user?.uid) {
        setLoading(false);
        return;
      }

      console.log("👤 사용자 정보 로드 시작:", user.uid);

      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        console.log("📦 Firebase 데이터:", userData);

        // ✅ 성별 표시 변환
        const getGenderText = (gender) => {
          if (gender === "male") return "남자";
          if (gender === "female") return "여자";
          return "미등록";
        };

        const loadedInfo = {
          name: userData.username || "사용자",
          age: userData.age ? String(userData.age) : "미등록",
          gender: userData.gender || "",
          genderDisplay: getGenderText(userData.gender),
          email: user.email || "미등록",
        };

        console.log("✅ 로드된 정보:", loadedInfo);
        setUserInfo(loadedInfo);
      } else {
        console.log("⚠️ 사용자 문서가 존재하지 않음");
      }
    } catch (error) {
      console.error("사용자 정보 로드 실패:", error);
      Alert.alert("오류", "사용자 정보를 불러올 수 없습니다.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ 회원 탈퇴
  const handleDelete = () => {
    Alert.alert(
      "회원 탈퇴",
      "정말 탈퇴하시겠습니까?\n모든 데이터가 삭제되며 복구할 수 없습니다.",
      [
        { text: "취소", style: "cancel" },
        {
          text: "확인",
          style: "destructive",
          onPress: async () => {
            try {
              if (!user?.uid) return;

              setLoading(true);

              // 1. Firestore 사용자 데이터 삭제
              await deleteDoc(doc(db, "users", user.uid));
              console.log("✅ Firestore 데이터 삭제 완료");

              // 2. Firebase Auth 계정 삭제
              const currentUser = auth.currentUser;
              if (currentUser) {
                await deleteUser(currentUser);
                console.log("✅ Firebase Auth 계정 삭제 완료");
              }

              // 3. 로그아웃
              await signOut();

              Alert.alert("탈퇴 완료", "회원 탈퇴가 완료되었습니다.");
            } catch (error) {
              console.error("회원 탈퇴 실패:", error);

              if (error.code === "auth/requires-recent-login") {
                Alert.alert(
                  "재로그인 필요",
                  "보안을 위해 다시 로그인한 후 탈퇴해주세요.",
                  [
                    {
                      text: "확인",
                      onPress: async () => {
                        await signOut();
                      },
                    },
                  ]
                );
              } else {
                Alert.alert("오류", "회원 탈퇴에 실패했습니다.");
              }
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  // ✅ 로그인 안 된 경우
  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text style={{ color: "#fff", fontSize: 16 }}>
            로그인이 필요합니다
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // ✅ 로딩 중
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color="#fff" />
          <Text style={{ color: "#fff", marginTop: 10 }}>로딩 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={26} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>개인 정보</Text>
        </View>

        <View style={styles.profile}>
          <Image
            source={require("../../../assets/images/avatar.png")}
            style={styles.avatar}
          />
        </View>

        <View style={styles.infoBox}>
          <InfoRow label="이름" value={userInfo.name || "미등록"} />
          <InfoRow label="나이" value={userInfo.age || "미등록"} />
          <InfoRow label="성별" value={userInfo.genderDisplay || "미등록"} />
          <InfoRow label="이메일 주소" value={userInfo.email || "미등록"} />
        </View>

        <View style={styles.menuBox}>
          <MenuItem
            text="수정하기"
            onPress={() =>
              navigation.navigate("EditAccount", { currentUser: userInfo })
            }
          />
          <MenuItem text="탈퇴하기" isDelete onPress={handleDelete} />
        </View>
      </ScrollView>
      <Toast />
    </SafeAreaView>
  );
}

const InfoRow = ({ label, value }) => (
  <View style={styles.infoRow}>
    <Text style={styles.label}>{label || ""}</Text>
    <Text style={styles.value}>{value || "미등록"}</Text>
  </View>
);

const MenuItem = ({ text, onPress, isDelete }) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <Text style={[styles.menuText, isDelete && { color: "red" }]}>
      {text || ""}
    </Text>
    <Ionicons
      name="chevron-forward"
      size={20}
      color={isDelete ? "red" : "#aaa"}
      style={{ marginLeft: "auto" }}
    />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  scroll: {
    padding: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    flex: 1,
    marginRight: 30,
    textAlign: "center",
  },
  profile: {
    alignItems: "center",
    marginBottom: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#add8e6",
  },
  infoBox: {
    backgroundColor: "#1e1e1e",
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 18,
    paddingHorizontal: 5,
  },
  label: {
    color: "#ccc",
    fontSize: 16,
  },
  value: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  menuBox: {
    backgroundColor: "#1e1e1e",
    borderRadius: 10,
    paddingVertical: 5,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 15,
  },
  menuText: {
    fontSize: 16,
    color: "#fff",
  },
  headerIcon: {
    width: 24,
    height: 24,
    tintColor: "#fff",
  },
  menuArrowIcon: {
    width: 20,
    height: 20,
    tintColor: "#aaa",
    marginLeft: "auto",
  },
});
