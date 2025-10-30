// src/screens/RegisterScreen.tsx

import React, { useRef, useEffect } from "react"; // <-- useRef, useEffect 추가
import {
  Dimensions,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Animated, // <-- Animated 추가
} from "react-native";

const owlImage = require("../../../assets/reowl.png");

const { height } = Dimensions.get("window");

const RegisterScreen = ({ navigation }: { navigation: any }) => {
  // 애니메이션 값을 저장하기 위해 useRef 사용
  const floatAnim = useRef(new Animated.Value(0)).current; // <-- 추가

  // 컴포넌트가 마운트될 때 애니메이션 시작
  useEffect(() => {
    // <-- 추가 (전체)
    Animated.loop(
      // 애니메이션을 무한 반복합니다.
      Animated.sequence([
        // 두 개의 애니메이션을 순차적으로 실행합니다.
        Animated.timing(floatAnim, {
          toValue: -15, // 15px 위로 이동
          duration: 1500, // 1.5초 동안
          useNativeDriver: true, // 네이티브 드라이버 사용 (성능 향상)
        }),
        Animated.timing(floatAnim, {
          toValue: 0, // 원래 위치로 (아래로 15px)
          duration: 1500, // 1.5초 동안
          useNativeDriver: true,
        }),
      ])
    ).start(); // 애니메이션 시작
  }, [floatAnim]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.imageContainer}>
          {/* Image를 Animated.Image로 변경 */}
          <Animated.Image // <-- 변경
            source={owlImage}
            style={[
              // <-- 변경 (배열로 감싸기)
              styles.image,
              {
                // 애니메이션 값 적용
                transform: [{ translateY: floatAnim }], // <-- 추가
              },
            ]}
          />
        </View>

        <Text style={styles.title}>We are what we do</Text>
        <Text style={styles.description}>
          Thousand of people are using silent moon{"\n"}for small meditations
        </Text>

        <TouchableOpacity
          style={styles.button}
          activeOpacity={0.8}
          onPress={() => navigation.navigate("SignUp")}
        >
          <Text style={styles.buttonText}>SIGN UP</Text>
        </TouchableOpacity>

        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>ALREADY HAVE AN ACCOUNT? </Text>
          <TouchableOpacity onPress={() => navigation.navigate("Login")}>
            <Text style={styles.loginLink}>LOG IN</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#181820",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#181820",
  },
  imageContainer: {
    marginBottom: height < 600 ? 20 : 30,
  },
  image: {
    width: 250,
    height: 250,
    resizeMode: "contain",
  },
  title: {
    fontSize: height < 600 ? 24 : 28,
    fontWeight: "600",
    color: "white",
    marginBottom: 20,
    textAlign: "center",
  },
  description: {
    fontSize: height < 600 ? 14 : 16,
    lineHeight: 24,
    color: "#a8a8a8",
    textAlign: "center",
    marginBottom: height < 600 ? 25 : 40,
    maxWidth: 320,
  },
  button: {
    backgroundColor: "#4285f4",
    paddingVertical: 15,
    paddingHorizontal: 50,
    borderRadius: 25,
    width: "80%",
    alignItems: "center",
    marginBottom: height < 600 ? 20 : 30,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  loginContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  loginText: {
    fontSize: 13,
    color: "#a8a8a8",
    letterSpacing: 0.5,
  },
  loginLink: {
    fontSize: 13,
    color: "#4285f4",
    fontWeight: "500",
  },
});

export default RegisterScreen;