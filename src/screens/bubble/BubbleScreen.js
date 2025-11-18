import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  Modal,
  TextInput,
  SafeAreaView,
  StatusBar,
  Image,
  Dimensions,
  Animated,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

const BUBBLE_IMAGE_URL = require("../../../assets/images/bubble.png");
const BUTTON_IMAGE_URL = require("../../../assets/images/bubbleButton.png");

export default function BubbleScreen({ navigation }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [inputText, setInputText] = useState("");
  const [isBlurred, setIsBlurred] = useState(false);

  const [bubbles, setBubbles] = useState([
    {
      id: "initial-bubble",
      text: "고민은\n비눗방울처럼\n사라질 거예요",
      size: 250,
      position: {
        top: screenHeight / 2 - 175,
        left: screenWidth / 2 - 125,
      },
      scale: new Animated.Value(1),
      opacity: new Animated.Value(1),
    },
  ]);

  const calculateBubbleSize = (text) => {
    const baseSize = 100;
    const sizePerChar = 5;
    const maxSize = 300;
    const calculatedSize = baseSize + text.length * sizePerChar;
    return Math.min(calculatedSize, maxSize);
  };

  const isOverlapping = (newBubble, existingBubbles) => {
    for (const existingBubble of existingBubbles) {
      const dx =
        newBubble.position.left +
        newBubble.size / 2 -
        (existingBubble.position.left + existingBubble.size / 2);
      const dy =
        newBubble.position.top +
        newBubble.size / 2 -
        (existingBubble.position.top + existingBubble.size / 2);
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < newBubble.size / 2 + existingBubble.size / 2) {
        return true;
      }
    }
    return false;
  };

  const handleBlowBubble = () => {
    if (inputText.trim().length === 0) {
      setModalVisible(false);
      return;
    }

    const newSize = calculateBubbleSize(inputText);
    let newBubble;
    let attempts = 0;
    const maxAttempts = 50;

    const initialBubbleExists = bubbles.some(
      (bubble) => bubble.id === "initial-bubble"
    );
    const targetBubbles = initialBubbleExists ? [] : bubbles;

    do {
      const randomTop = Math.random() * (screenHeight - newSize - 150);
      const randomLeft = Math.random() * (screenWidth - newSize);

      newBubble = {
        id: Date.now(),
        text: inputText,
        size: newSize,
        position: { top: randomTop, left: randomLeft },
        scale: new Animated.Value(0),
        opacity: new Animated.Value(1),
      };
      attempts++;
    } while (isOverlapping(newBubble, targetBubbles) && attempts < maxAttempts);

    const MAX_BUBBLES = 15;

    if (initialBubbleExists) {
      setBubbles([newBubble]);
    } else {
      setBubbles((prevBubbles) => {
        const newBubbles = [...prevBubbles, newBubble];
        if (newBubbles.length > MAX_BUBBLES) {
          return newBubbles.slice(1);
        }
        return newBubbles;
      });
    }

    // 생성 애니메이션 - 통통 튀면서 나타남
    Animated.spring(newBubble.scale, {
      toValue: 1,
      friction: 5,
      tension: 40,
      useNativeDriver: true,
    }).start();

    setModalVisible(false);
    setInputText("");
  };

  const handlePressIn = (bubble) => {
    Animated.spring(bubble.scale, {
      toValue: 1.1,
      friction: 5,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = (bubble) => {
    Animated.spring(bubble.scale, {
      toValue: 1,
      friction: 5,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const handlePopBubble = (bubble) => {
    // 살짝 커졌다가 작아지면서 투명해지기
    Animated.sequence([
      // 살짝 커지기
      Animated.timing(bubble.scale, {
        toValue: 1.15,
        duration: 100,
        useNativeDriver: true,
      }),
      // 작아지면서 동시에 투명해지기
      Animated.parallel([
        Animated.timing(bubble.scale, {
          toValue: 0.2,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(bubble.opacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      setBubbles((prevBubbles) =>
        prevBubbles.filter((b) => b.id !== bubble.id)
      );
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate("Home")}>
          <Ionicons name="chevron-back" size={24} color="#fff" marginTop={30} />
        </TouchableOpacity>
      </View>
      {bubbles.map((bubble) => (
        <Animated.View
          key={bubble.id}
          style={[
            styles.bubbleWrapper,
            {
              top: bubble.position.top,
              left: bubble.position.left,
              width: bubble.size,
              height: bubble.size,
              transform: [{ scale: bubble.scale }],
              opacity: bubble.opacity,
            },
          ]}
        >
          <TouchableOpacity
            activeOpacity={0.8}
            onPressIn={() => handlePressIn(bubble)}
            onPressOut={() => handlePressOut(bubble)}
            onPress={() => handlePopBubble(bubble)}
            style={{ width: "100%", height: "100%" }}
          >
            <ImageBackground
              source={BUBBLE_IMAGE_URL}
              style={styles.bubbleImage}
              resizeMode="contain"
            >
              <Text style={styles.bubbleText}>{bubble.text}</Text>
            </ImageBackground>
          </TouchableOpacity>
        </Animated.View>
      ))}

      <View style={styles.bottomButtonContainer}>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <ImageBackground
            source={BUTTON_IMAGE_URL}
            style={styles.bottomButtonImage}
            resizeMode="contain"
          ></ImageBackground>
        </TouchableOpacity>
      </View>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TextInput
              style={styles.textInput}
              placeholder="마음을 비울 말을 작성하세요..."
              placeholderTextColor="#888"
              value={inputText}
              onChangeText={setInputText}
              maxLength={40}
              multiline={true}
            />
            <Text style={styles.charCount}>{inputText.length}/40</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={handleBlowBubble}
            >
              <Text style={styles.modalButtonText}>비눗방울 불기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {isBlurred && <View style={styles.blurOverlay} />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    justifyContent: "flex-end",
  },
  header: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 10,
  },
  backButton: {
    padding: 10,
  },
  icon: {
    width: 24,
    height: 24,
    resizeMode: "contain",
    tintColor: "#fff",
  },
  bubbleWrapper: {
    position: "absolute",
  },
  bubbleImage: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  bubbleText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    paddingLeft: "25%",
    paddingRight: "15%",
  },
  bottomButtonContainer: {
    paddingBottom: 40,
    alignItems: "center",
  },
  bottomButtonImage: {
    width: 300,
    height: 120,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "85%",
    backgroundColor: "#252525",
    borderRadius: 20,
    padding: 25,
    alignItems: "center",
  },
  textInput: {
    width: "100%",
    height: 120,
    color: "white",
    textAlignVertical: "top",
    fontSize: 16,
    padding: 10,
    borderColor: "#555",
    borderWidth: 1,
    borderRadius: 10,
  },
  charCount: {
    width: "100%",
    textAlign: "right",
    color: "#888",
    marginTop: 8,
    paddingRight: 5,
  },
  modalButton: {
    marginTop: 20,
    backgroundColor: "#3A8BFF",
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
  },
  modalButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  blurOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
});
