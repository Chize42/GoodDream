import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  ScrollView,
} from "react-native";
import Toast from "react-native-toast-message";

export default function AccountScreen({ navigation, route }) {
  const [userInfo, setUserInfo] = useState({
    name: "홍길동",
    birth: "2025.05.16",
    gender: "여성",
    email: "pillow@gmail.com",
  });

  useEffect(() => {
    if (route.params?.updatedUser) {
      setUserInfo(route.params.updatedUser);
      Toast.show({
        type: "success",
        text1: "저장되었습니다!",
        position: "bottom",
        visibilityTime: 2000,
      });
      navigation.setParams({ updatedUser: null });
    }
  }, [route.params?.updatedUser]);

  const handleDelete = () => {
    Alert.alert("회원 탈퇴", "정말 탈퇴하시겠습니까?", [
      { text: "취소", style: "cancel" },
      { text: "확인", onPress: () => console.log("탈퇴 처리 실행") },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Image
              source={{ uri: "https://i.ibb.co/Dg5C8MzW/Arrow.png" }}
              style={styles.headerIcon}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>개인 정보</Text>
        </View>

        <View style={styles.profile}>
          <Image
            source={{
              uri: "https://em-content.zobj.net/source/apple/354/sleeping-face_1f634.png",
            }}
            style={styles.avatar}
          />
        </View>

        <View style={styles.infoBox}>
          <InfoRow label="이름" value={userInfo.name} />
          <InfoRow label="생년월일" value={userInfo.birth} />
          <InfoRow label="성별" value={userInfo.gender} />
          <InfoRow label="이메일 주소" value={userInfo.email} />
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
    </SafeAreaView>
  );
}

const InfoRow = ({ label, value }) => (
  <View style={styles.infoRow}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>{value}</Text>
  </View>
);

const MenuItem = ({ text, onPress, isDelete }) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <Text style={[styles.menuText, isDelete && { color: "red" }]}>{text}</Text>
    <Image
      source={{ uri: "https://i.ibb.co/60229hwt/Arrow.png" }}
      style={[styles.menuArrowIcon, isDelete && { tintColor: "red" }]}
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
