import React, { useState } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

export default function AdminLoginScreen({ navigation }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    // ✨ 실제로는 서버 API를 호출하여 자격 증명 확인
    
    // 임시 관리자 계정으로 시뮬레이션
    if (username === "admin" && password === "1234") {
      Alert.alert("로그인 성공", "관리자 대시보드로 이동합니다.");
      // 성공 시 대시보드로 이동
      navigation.replace("AdminDashboard"); 
    } else {
      Alert.alert("로그인 실패", "아이디 또는 비밀번호가 올바르지 않습니다.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.header}>
            <Text style={styles.headerTitle}>관리자 로그인</Text>
        </View>

        <View style={styles.body}>
            <Text style={styles.label}>관리자 아이디</Text>
            <TextInput
                style={styles.input}
                placeholder="아이디를 입력하세요 (테스트: admin)"
                placeholderTextColor="#888"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
            />
            
            <Text style={styles.label}>비밀번호</Text>
            <TextInput
                style={styles.input}
                placeholder="비밀번호를 입력하세요 (테스트: 1234)"
                placeholderTextColor="#888"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />

            <TouchableOpacity
                style={styles.loginBtn}
                activeOpacity={0.7}
                onPress={handleLogin}
            >
                <Text style={styles.loginBtnText}>로그인</Text>
            </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121212" },
  header: {
    paddingHorizontal: 15,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 20,
  },
  body: {
    flex: 1,
    paddingHorizontal: 30,
    marginTop: 40,
  },
  label: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
    marginTop: 20,
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#232324",
    borderRadius: 10,
    color: "#fff",
    fontSize: 16,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  loginBtn: {
    backgroundColor: "#207cff",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    height: 48,
    marginTop: 30,
  },
  loginBtnText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "bold",
    letterSpacing: 0.3,
  },
});