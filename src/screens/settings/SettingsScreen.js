import React, { useState } from "react";
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
} from "react-native";

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
  const [username, setUsername] = useState("Username");
  const [isEditing, setIsEditing] = useState(false);

  const handlePress = (menu) => {
    if (menu === "로그아웃") {
      Alert.alert("로그아웃", "정말 로그아웃 하시겠습니까?", [
        { text: "취소", style: "cancel" },
        { text: "확인", onPress: () => console.log("로그아웃 실행") },
      ]);
    } else {
      navigation.navigate(menu);
    }
  };

  const handleEditPress = () => {
    setIsEditing(true);
  };

  const handleSaveUsername = () => {
    setIsEditing(false);
    Alert.alert("알림", `이름이 '${username}'으로 변경되었습니다.`);
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
            />
          ) : (
            <Text style={styles.username}>{username}</Text>
          )}

          <TouchableOpacity
            style={styles.editBtn}
            onPress={isEditing ? handleSaveUsername : handleEditPress}
          >
            <Image
              source={{ uri: "https://i.ibb.co/k6ms3py0/bx-pencil.png" }}
              style={styles.editIcon}
            />
          </TouchableOpacity>
        </View>

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
    marginBottom: 30,
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
