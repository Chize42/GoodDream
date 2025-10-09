// src/screens/settings/SettingsScreen.js

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../contexts/AuthContext"; // ✅ 추가
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../services/firebase";

const menuIcons = {
  "계정 센터":
    "https://i.ibb.co/zhpSWYS0/material-symbols-person-outline-rounded.png",
  알림: "https://i.ibb.co/gZWMyPV5/Outline.png",
  "계정 연동": "https://i.ibb.co/2YH78Vcq/Outline.png",
  고객센터: "https://i.ibb.co/JFySN1S6/stash-question.png",
};

const MenuItem = ({ iconUri, text, onPress }) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    {iconUri && <Image source={{ uri: iconUri }} style={styles.menuIcon} />}
    <Text style={styles.menuText}>{text}</Text>
    <Image
      source={{ uri: "https://i.ibb.co/60229hwt/Arrow.png" }}
      style={styles.arrowIcon}
    />
  </TouchableOpacity>
);

export default function SettingsScreen({ navigation }) {
  const { user, signOut } = useAuth(); // ✅ AuthContext에서 가져오기

  const [username, setUsername] = useState("");
  const [originalUsername, setOriginalUsername] = useState(""); // ✅ 원본 저장
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  // ✅ 사용자 정보 로드
  useEffect(() => {
    loadUserData();
  }, [user]);

  const loadUserData = async () => {
    try {
      if (!user?.uid) {
        setLoading(false);
        return;
      }

      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const name = userData.username || "사용자";
        setUsername(name);
        setOriginalUsername(name);
      }
    } catch (error) {
      console.error("사용자 정보 로드 실패:", error);
      Alert.alert("오류", "사용자 정보를 불러올 수 없습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handlePress = (menu) => {
    if (menu === "로그아웃") {
      Alert.alert("로그아웃", "정말 로그아웃 하시겠습니까?", [
        { text: "취소", style: "cancel" },
        {
          text: "확인",
          onPress: handleLogout,
          style: "destructive",
        },
      ]);
    } else {
      navigation.navigate(menu);
    }
  };

  // ✅ 로그아웃 처리
  const handleLogout = async () => {
    try {
      await signOut();
      // ✅ AuthContext가 자동으로 로그인 화면으로 전환
      console.log("✅ 로그아웃 성공");
    } catch (error) {
      console.error("로그아웃 실패:", error);
      Alert.alert("오류", "로그아웃에 실패했습니다.");
    }
  };

  const handleEditPress = () => {
    setIsEditing(true);
  };

  // ✅ 이름 저장 (Firebase 업데이트)
  const handleSaveUsername = async () => {
    try {
      if (!user?.uid) {
        Alert.alert("오류", "로그인이 필요합니다");
        return;
      }

      // 변경사항이 없으면 그냥 종료
      if (username.trim() === originalUsername) {
        setIsEditing(false);
        return;
      }

      // 빈 이름 체크
      if (username.trim() === "") {
        Alert.alert("알림", "이름을 입력해주세요.");
        setUsername(originalUsername); // 원래 이름으로 복구
        setIsEditing(false);
        return;
      }

      setLoading(true);

      // ✅ Firebase에 업데이트
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        username: username.trim(),
      });

      setOriginalUsername(username.trim());
      setIsEditing(false);

      Alert.alert("알림", `이름이 '${username.trim()}'으로 변경되었습니다.`);
      console.log("✅ 이름 변경 성공:", username.trim());
    } catch (error) {
      console.error("이름 변경 실패:", error);
      Alert.alert("오류", "이름 변경에 실패했습니다.");
      setUsername(originalUsername); // 실패 시 원래 이름으로 복구
    } finally {
      setLoading(false);
    }
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
          <TouchableOpacity onPress={() => navigation.navigate("Home")}>
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.profile}>
          <Image
            source={{
              uri: "https://em-content.zobj.net/source/apple/354/sleeping-face_1f634.png",
            }}
            style={styles.avatar}
          />
          {isEditing ? (
            <TextInput
              style={styles.usernameInput}
              value={username}
              onChangeText={setUsername}
              autoFocus
              onBlur={handleSaveUsername}
              onSubmitEditing={handleSaveUsername}
              editable={!loading}
            />
          ) : (
            <Text style={styles.username}>{username}</Text>
          )}

          <TouchableOpacity
            style={styles.editBtn}
            onPress={isEditing ? handleSaveUsername : handleEditPress}
            disabled={loading}
          >
            <Image
              source={{ uri: "https://i.ibb.co/k6ms3py0/bx-pencil.png" }}
              style={styles.editIcon}
            />
          </TouchableOpacity>
        </View>

        {/* ✅ 이메일 표시 추가 (선택사항) */}
        <Text style={styles.emailText}>{user.email}</Text>

        <View style={styles.menuBox}>
          <MenuItem
            text="계정 센터"
            iconUri={menuIcons["계정 센터"]}
            onPress={() => handlePress("계정 센터")}
          />
          <MenuItem
            text="알림"
            iconUri={menuIcons["알림"]}
            onPress={() => handlePress("알림")}
          />
          <MenuItem
            text="계정 연동"
            iconUri={menuIcons["계정 연동"]}
            onPress={() => handlePress("계정 연동")}
          />
          <MenuItem
            text="고객센터"
            iconUri={menuIcons["고객센터"]}
            onPress={() => handlePress("고객센터")}
          />
        </View>

        <View style={styles.logoutBox}>
          <MenuItem text="로그아웃" onPress={() => handlePress("로그아웃")} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  scroll: {
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  profile: {
    alignItems: "center",
    marginBottom: 10, // ✅ 이메일 공간 위해 줄임
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#add8e6",
  },
  username: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
  usernameInput: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#fff",
    textAlign: "center",
    paddingBottom: 2,
    minWidth: 150,
  },
  // ✅ 이메일 스타일 추가
  emailText: {
    textAlign: "center",
    fontSize: 14,
    color: "#999",
    marginBottom: 20,
  },
  editBtn: {
    position: "absolute",
    right: 140,
    top: 70,
  },
  menuBox: {
    backgroundColor: "#1e1e1e",
    borderRadius: 10,
    paddingVertical: 10,
    marginBottom: 20,
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
  logoutBox: {
    backgroundColor: "#1e1e1e",
    borderRadius: 10,
    paddingVertical: 10,
  },
  headerIcon: {
    width: 24,
    height: 24,
    tintColor: "#fff",
  },
  editIcon: {
    width: 16,
    height: 16,
    tintColor: "#ccc",
  },
  menuIcon: {
    width: 20,
    height: 20,
    tintColor: "#fff",
    marginRight: 10,
  },
  arrowIcon: {
    width: 20,
    height: 20,
    tintColor: "#aaa",
    marginLeft: "auto",
  },
});
