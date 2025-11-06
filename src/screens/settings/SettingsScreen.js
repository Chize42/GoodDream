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
import { useAuth } from "../../contexts/AuthContext";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../services/firebase";

const menuIcons = {
  "계정 센터": "person-outline",
  "알림": "notifications-outline", // 'Outline.png' -> '알림'에 맞는 아이콘
  "계정 연동": "link-outline", // 'Outline.png' -> '계정 연동'에 맞는 아이콘
  "고객센터": "help-circle-outline", // 'stash-question.png'
};

const MenuItem = ({ iconName, text, onPress, iconComponent }) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    {iconComponent ? (
      iconComponent // 1. Health Connect 같은 커스텀 컴포넌트 우선
    ) : iconName ? (
      // 2. iconName이 있으면 Ionicons 렌더링
      <Ionicons
        name={iconName}
        size={20} // styles.menuIcon의 width/height
        color="#fff" // styles.menuIcon의 tintColor
        style={{ marginRight: 10 }} // styles.menuIcon의 marginRight
      />
    ) : null}
    <Text style={styles.menuText}>{text}</Text>
    
    {/* 3. 오른쪽 화살표 Image를 Ionicons로 변경 */}
    <Ionicons
      name="chevron-forward"
      size={20} // styles.arrowIcon의 width/height
      color="#aaa" // styles.arrowIcon의 tintColor
      style={{ marginLeft: "auto" }} // styles.arrowIcon의 marginLeft
    />
  </TouchableOpacity>
);

export default function SettingsScreen({ navigation }) {
  const { user, signOut } = useAuth();

  const [username, setUsername] = useState("");
  const [originalUsername, setOriginalUsername] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

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
    } else if (menu === "Health Connect") {
      navigation.navigate("HealthConnectSettings"); // 👈 추가
    } else {
      navigation.navigate(menu);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      console.log("✅ 로그아웃 성공");
    } catch (error) {
      console.error("로그아웃 실패:", error);
      Alert.alert("오류", "로그아웃에 실패했습니다.");
    }
  };

  const handleEditPress = () => {
    setIsEditing(true);
  };

  const handleSaveUsername = async () => {
    try {
      if (!user?.uid) {
        Alert.alert("오류", "로그인이 필요합니다");
        return;
      }

      if (username.trim() === originalUsername) {
        setIsEditing(false);
        return;
      }

      if (username.trim() === "") {
        Alert.alert("알림", "이름을 입력해주세요.");
        setUsername(originalUsername);
        setIsEditing(false);
        return;
      }

      setLoading(true);

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
      setUsername(originalUsername);
    } finally {
      setLoading(false);
    }
  };

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
            source={require("../../../assets/images/avatar.png")}
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
            <Ionicons
              name="pencil"
              size={16} 
              color="#ccc" 
            />
          </TouchableOpacity>
        </View>

        <Text style={styles.emailText}>{user.email}</Text>

      <View style={styles.menuBox}>
        <MenuItem
          text="계정 센터"
          iconName={menuIcons["계정 센터"]} 
          onPress={() => handlePress("계정 센터")}
        />
        <MenuItem
          text="알림"
          iconName={menuIcons["알림"]} 
          onPress={() => handlePress("알림")}
        />
        <MenuItem
          text="계정 연동"
          iconName={menuIcons["계정 연동"]} 
          onPress={() => handlePress("계정 연동")}
        />
        {/* 👇 Health Connect 메뉴 */}
        <MenuItem
          text="Health Connect"
          iconComponent={
            <Ionicons
              name="fitness-outline"
              size={20}
              color="#fff"
              style={{ marginRight: 10 }}
            />
          }
          onPress={() => handlePress("Health Connect")}
        />
        <MenuItem
          text="고객센터"
          iconName={menuIcons["고객센터"]} 
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

// 스타일은 동일...
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
    marginBottom: 10,
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
