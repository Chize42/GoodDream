// src/screens/IntroScreen.tsx
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  // Easing을 추가하여 부드러운 움직임을 만듭니다.
  Easing,
} from "react-native";

const owlImage = require("../../../assets/owl.png");
const { width, height } = Dimensions.get("window");

/* ============================
   별 (반짝이는 배경용)
============================ */
interface StarProps {
  x: number;
  y: number;
  size: number;
  color: string;
  twinkleDelay: number;
}

function Star({ x, y, size, color, twinkleDelay }: StarProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const twinkle = () => {
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800 + twinkleDelay,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800 + twinkleDelay,
          useNativeDriver: true,
        }),
      ]).start(() => twinkle());
    };

    const floatAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(translateY, {
          toValue: -1,
          duration: 2000 + twinkleDelay,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 1,
          duration: 2000 + twinkleDelay,
          useNativeDriver: true,
        }),
      ])
    );

    twinkle();
    floatAnimation.start();

    // Cleanup function
    return () => {
      opacity.stopAnimation();
      translateY.stopAnimation();
      floatAnimation.stop();
    };
  }, [opacity, translateY, twinkleDelay]);

  return (
    <Animated.View
      style={{
        position: "absolute",
        top: y,
        left: x,
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        opacity,
        transform: [{ translateY }],
      }}
    />
  );
}

/* ============================
   별 배경
============================ */
interface StarBackgroundProps {
  count?: number;
}

function StarBackground({ count = 40 }: StarBackgroundProps) {
  const starColors = ["#ffffff", "#d0d0ff", "#ffeedd", "#cce6ff", "#f5f5f5"];
  const stars = useRef(
    Array.from({ length: count }).map((_, index) => ({
      id: index,
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2.5 + 1,
      color: starColors[Math.floor(Math.random() * starColors.length)],
      twinkleDelay: Math.random() * 1000,
    }))
  ).current;

  return (
    <View style={StyleSheet.absoluteFill}>
      {stars.map((star) => (
        <Star key={star.id} {...star} />
      ))}
    </View>
  );
}

/* ============================
   메인 Intro 화면
============================ */
function IntroScreen({ navigation }: { navigation: any }) {
  // 🦉 둥둥 떠다니는 효과를 위한 애니메이션 값
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 부드러운 위아래 움직임 (Floating) 애니메이션 정의
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 3500, // 3.5초에 걸쳐 위로 이동
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease), // 부드러운 가속/감속
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 3500, // 3.5초에 걸쳐 다시 제자리로 이동
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
      ])
    );

    // 애니메이션 시작
    animation.start();

    // 클린업 함수
    return () => animation.stop();
  }, [floatAnim]);

  const handleGetStarted = () => {
    try {
      navigation.navigate("Register");
    } catch (error) {
      console.error("Navigation error:", error);
    }
  };

  return (
    <View style={styles.introScreen}>
      {/* 배경 요소 */}
      <StarBackground count={50} />

      <View style={styles.introContent}>
        <Text style={styles.introTitle}>Welcome to Dream</Text>
        <Text style={styles.introDescription}>
          Explore the new king of sleep. It uses{"\n"}
          sound and visualization to create perfect{"\n"}
          conditions for refreshing sleep.
        </Text>

        <View style={styles.introImageContainer}>
          {/* Image를 Animated.Image로 변경하고 transform 스타일을 적용합니다. */}
          <Animated.Image
            source={owlImage}
            style={[
              styles.introImage,
              {
                transform: [
                  {
                    // floatAnim 값(0~1)에 따라 Y축 이동을 0에서 -15 픽셀로 변환
                    translateY: floatAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -15],
                    }),
                  },
                ],
              },
            ]}
          />
        </View>

        <TouchableOpacity
          style={styles.introBtn}
          onPress={handleGetStarted}
          activeOpacity={0.8}
        >
          <Text style={styles.introBtnText}>GET STARTED</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* ============================
   스타일
============================ */
const styles = StyleSheet.create({
  introScreen: {
    backgroundColor: "#181820",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  introContent: {
    alignItems: "center",
    maxWidth: 400,
    width: "100%",
  },
  introTitle: {
    fontSize: 28,
    fontWeight: "600",
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 20,
  },
  introDescription: {
    fontSize: 16,
    lineHeight: 24,
    color: "#a8a8a8",
    textAlign: "center",
    marginBottom: 40,
    maxWidth: 320,
  },
  introImageContainer: {
    marginTop: 20,
    marginBottom: 50,
    alignItems: "center",
  },
  introImage: {
    width: 250,
    height: 250,
    resizeMode: "contain",
  },
  introBtn: {
    backgroundColor: "#4285f4",
    paddingVertical: 15,
    paddingHorizontal: 50,
    borderRadius: 25,
    shadowColor: "#4285f4",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  introBtnText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
});

export default IntroScreen;