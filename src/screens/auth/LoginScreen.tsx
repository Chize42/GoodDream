// src/screens/auth/LoginScreen.tsx
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import {
  Alert,
  Dimensions,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";

const { width, height } = Dimensions.get("window");

function LoginScreen({ navigation }: { navigation: any }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const { signIn } = useAuth();

  const handleLogin = async () => {
    console.log("🟢 1. handleLogin 시작");
    console.log("🟢 2. 입력값:", { email, password });

    if (!email || !password) {
      console.log("🔴 3. 입력값 없음");
      Alert.alert("오류", "이메일과 비밀번호를 입력해주세요");
      return;
    }

    console.log("🟢 4. setLoading(true)");
    setLoading(true);

    try {
      console.log("🟢 5. signIn 호출 직전");
      const result = await signIn(email, password);
      console.log("🟢 6. signIn 완료:", result);
      console.log("✅ 로그인 성공, 홈 화면으로 이동");
    } catch (error: any) {
      console.log("🔴 7. 에러 발생:", error);
      console.log("🔴 에러 코드:", error.code);
      console.log("🔴 에러 메시지:", error.message);

      let errorMessage = "로그인에 실패했습니다";

      if (error.code === "auth/user-not-found") {
        errorMessage = "존재하지 않는 계정입니다";
      } else if (error.code === "auth/wrong-password") {
        errorMessage = "비밀번호가 일치하지 않습니다";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "올바른 이메일 형식이 아닙니다";
      } else if (error.code === "auth/invalid-credential") {
        errorMessage = "이메일 또는 비밀번호가 올바르지 않습니다";
      }

      Alert.alert("로그인 실패", errorMessage);
    } finally {
      console.log("🟢 8. finally - setLoading(false)");
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          accessibilityLabel="뒤로 가기"
        >
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Welcome Back!</Text>
      </View>

      <View style={styles.content}>
        <TextInput
          style={styles.input}
          placeholder="Email address"
          placeholderTextColor="#666"
          keyboardType="email-address"
          autoCapitalize="none"
          returnKeyType="next"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#666"
          secureTextEntry
          returnKeyType="done"
          value={password}
          onChangeText={setPassword}
          onSubmitEditing={handleLogin}
        />

        <TouchableOpacity
          style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
          activeOpacity={0.8}
          onPress={() => {
            console.log("🔵 버튼 클릭됨!");
            handleLogin();
          }}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.submitBtnText}>LOG IN</Text>
          )}
        </TouchableOpacity>

        <View style={styles.signupRedirectContainer}>
          <Text style={styles.signupRedirectText}>DON'T HAVE AN ACCOUNT? </Text>
          <TouchableOpacity onPress={() => navigation.navigate("SignUp")}>
            <Text style={styles.signupLink}>SIGN UP</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#181820",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: height < 700 ? 12 : 20,
    backgroundColor: "#181820",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  backButton: {
    position: "absolute",
    left: 15,
    padding: 8,
    borderRadius: 20,
    minHeight: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: width < 480 ? 20 : 24,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
  },
  content: {
    flex: 1,
    width: "100%",
    maxWidth: 360,
    alignSelf: "center",
    paddingHorizontal: 20,
    paddingTop: height < 700 ? 60 : 80,
    paddingBottom: 20,
  },
  input: {
    width: "100%",
    padding: 15,
    marginBottom: 12,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#333",
    backgroundColor: "#1a1a1a",
    color: "white",
    fontSize: 14,
    minHeight: 44,
  },
  submitBtn: {
    backgroundColor: "#3f78ff",
    color: "white",
    paddingVertical: 15,
    width: "100%",
    borderRadius: 25,
    marginBottom: 30,
    alignItems: "center",
    minHeight: 44,
    shadowColor: "#3f78ff",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  submitBtnDisabled: {
    backgroundColor: "#666",
  },
  submitBtnText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
  },
  signupRedirectContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 0,
  },
  signupRedirectText: {
    fontSize: 12,
    color: "#999",
  },
  signupLink: {
    color: "#3f78ff",
    fontSize: 12,
    fontWeight: "bold",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 5,
  },
});

export default LoginScreen;