// src/screens/LoginScreen.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Dimensions,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const { width, height } = Dimensions.get("window");

const naverImage = require("../../../assets/naver.png");
const googleImage = require("../../../assets/google.png");

function LoginScreen({ navigation }: { navigation: any }) {
  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Fixed Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()} // React Navigation 방식으로 변경
          accessibilityLabel="뒤로 가기"
        >
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Welcome Back!</Text>
      </View>

      {/* Main Content Area */}
      <View style={styles.content}>
        {/* Social Login Buttons */}
        <TouchableOpacity style={styles.naverBtn} activeOpacity={0.8}>
          <Image source={naverImage} style={styles.socialIcon} />
          <Text style={styles.socialBtnText}>CONTINUE WITH NAVER</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.googleBtn} activeOpacity={0.8}>
          <Image source={googleImage} style={styles.socialIcon} />
          <Text style={styles.socialBtnText}>CONTINUE WITH GOOGLE</Text>
        </TouchableOpacity>

        {/* Divider Text */}
        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR LOG IN WITH EMAIL</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Login Form Inputs */}
        <TextInput
          style={styles.input}
          placeholder="Email address"
          placeholderTextColor="#666"
          keyboardType="email-address"
          autoCapitalize="none"
          returnKeyType="next"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#666"
          secureTextEntry
          returnKeyType="done"
        />

        {/* Login Submit Button */}
        <TouchableOpacity
          style={styles.submitBtn}
          activeOpacity={0.8}
          onPress={() => navigation.navigate("Home")} // React Navigation 방식으로 변경
        >
          <Text style={styles.submitBtnText}>LOG IN</Text>
        </TouchableOpacity>

        {/* Forgot Password Link */}
        <TouchableOpacity
          style={styles.forgotLink}
          onPress={() => {
            // 비밀번호 찾기 기능 추가 필요시
            console.log("Forgot password pressed");
          }}
        >
          <Text style={styles.forgotLinkText}>Forgot Password?</Text>
        </TouchableOpacity>

        {/* Sign Up Redirect */}
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
    paddingTop: height < 700 ? 70 : 100,
    paddingBottom: 20,
  },
  naverBtn: {
    backgroundColor: "#03cf5d",
    borderRadius: 25,
    width: "100%",
    paddingVertical: 15,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    minHeight: 44,
    shadowColor: "#03cf5d",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  googleBtn: {
    backgroundColor: "#2a2a2a",
    borderColor: "#444",
    borderWidth: 1,
    borderRadius: 25,
    width: "100%",
    paddingVertical: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    minHeight: 44,
    shadowColor: "#2a2a2a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  socialBtnText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
  },
  socialIcon: {
    width: 16,
    height: 16,
    resizeMode: "contain",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
    paddingTop: 25,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#333",
  },
  dividerText: {
    fontSize: 12,
    color: "#999",
    marginHorizontal: 15,
    textAlign: "center",
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
    marginBottom: 15,
    alignItems: "center",
    minHeight: 44,
    shadowColor: "#3f78ff",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  submitBtnText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
  },
  forgotLink: {
    alignSelf: "center",
    marginBottom: 20,
    minHeight: 35,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  forgotLinkText: {
    color: "#3f78ff",
    fontSize: 12,
    textDecorationLine: "underline",
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
