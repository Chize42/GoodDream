import React, { useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  PanResponder,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useMusicContext } from "../../../contexts/MusicContext";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

export default function MusicPlayerScreen({
  navigation,
  route,
}: {
  navigation: any;
  route: any;
}) {
  const { id, title, subtitle, image } = route.params || {};
  const {
    currentSound,
    isPlaying,
    currentTime,
    duration,
    togglePlayPause,
    setCurrentTime,
    rewind,
    forward,
  } = useMusicContext();

  const [isFavorite, setIsFavorite] = useState(false);
  const [showFavoritePopup, setShowFavoritePopup] = useState(false);
  const [isCreatingDrawer, setIsCreatingDrawer] = useState(false);
  const [newDrawerName, setNewDrawerName] = useState("");

  // 애니메이션을 위한 값
  const slideAnim = useRef(new Animated.Value(screenHeight)).current;

  // 팝업 열기 애니메이션
  const openPopup = () => {
    setShowFavoritePopup(true);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  // 팝업 닫기 애니메이션
  const closePopup = () => {
    Animated.timing(slideAnim, {
      toValue: screenHeight,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setShowFavoritePopup(false);
      setIsCreatingDrawer(false);
    });
  };

  // 즐겨찾기 토글 함수 (팝업 표시)
  const toggleFavorite = () => {
    openPopup();
  };

  // 새 서랍 만들기 버튼
  const handleCreateDrawer = () => {
    setIsCreatingDrawer(true);
  };

  // 새 서랍 생성 완료
  const handleConfirmCreateDrawer = () => {
    if (newDrawerName.trim().length === 0) return;
    console.log("새 서랍 이름:", newDrawerName);
    setNewDrawerName("");
    setIsCreatingDrawer(false);
    closePopup();
  };

  // 시간 포맷 변환 (초 -> MM:SS)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // 진행률 계산
  const progress = (currentTime / duration) * 100;

  // Progress bar pan responder
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,

    onPanResponderGrant: (evt) => {
      const progressBarWidth = screenWidth - 74;
      const touchX = evt.nativeEvent.locationX;
      const clampedX = Math.max(0, Math.min(progressBarWidth, touchX));
      const newProgress = clampedX / progressBarWidth;
      const newTime = Math.floor(newProgress * duration);
      setCurrentTime(newTime);
    },

    onPanResponderMove: (evt) => {
      const progressBarWidth = screenWidth - 74;
      const touchX = evt.nativeEvent.locationX;
      const clampedX = Math.max(0, Math.min(progressBarWidth, touchX));
      const newProgress = clampedX / progressBarWidth;
      const newTime = Math.floor(newProgress * duration);
      setCurrentTime(newTime);
    },

    onPanResponderRelease: () => {
      // 드래그가 끝나면 처리할 로직이 있다면 여기에
    },
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#ffffff" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={toggleFavorite}
        >
          {isFavorite ? (
            <Ionicons name="heart" size={20} color="#ff3b30" />
          ) : (
            <Ionicons name="heart-outline" size={20} color="#9ca3af" />
          )}
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Artwork */}
        <View style={styles.artworkContainer}>
          <View style={styles.artworkImage}>
            {(image || currentSound?.image) && (
              <Image
                source={image || currentSound?.image}
                style={styles.actualImage}
              />
            )}
          </View>
        </View>

        {/* Track Info */}
        <View style={styles.trackInfo}>
          <Text style={styles.trackTitle}>
            {currentSound?.title || title || "우주의 탄생"}
          </Text>
          <Text style={styles.trackArtist}>
            {currentSound?.subtitle || subtitle || "EBS"}
          </Text>
        </View>

        {/* Controls */}
        <View style={styles.controlsContainer}>
          <TouchableOpacity style={styles.controlButton} onPress={rewind}>
            <MaterialIcons name="replay-30" size={24} color="#ffffff" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.playButton} onPress={togglePlayPause}>
            <Ionicons
              name={isPlaying ? "pause" : "play"}
              size={24}
              color="#ffffff"
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.controlButton} onPress={forward}>
            <MaterialIcons name="forward-30" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar} {...panResponder.panHandlers}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>

          <View style={styles.timeContainer}>
            <Text style={styles.currentTime}>{formatTime(currentTime)}</Text>
            <Text style={styles.totalTime}>{formatTime(duration)}</Text>
          </View>
        </View>
      </View>

      {/* 즐겨찾기 팝업 */}
      {showFavoritePopup && (
        <TouchableOpacity
          style={styles.popupOverlay}
          activeOpacity={1}
          onPress={closePopup}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "position" : "height"}
            style={styles.keyboardAvoidingView}
          >
            <Animated.View
              style={[
                styles.popupContainer,
                { transform: [{ translateY: slideAnim }] },
              ]}
              onStartShouldSetResponder={() => true}
            >
              <View style={styles.popupHeader}>
                <Text style={styles.popupTitle}>
                  {isCreatingDrawer ? "새 서랍 만들기" : "즐겨찾기"}
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    if (isCreatingDrawer) {
                      setIsCreatingDrawer(false);
                    } else {
                      closePopup();
                    }
                  }}
                >
                  <Ionicons name="close" size={24} color="#9ca3af" />
                </TouchableOpacity>
              </View>

              {isCreatingDrawer ? (
                <View style={styles.createDrawerContainer}>
                  <Text style={styles.createDrawerDescription}>
                    서랍 이름은 최소 한 글자 이상 입력하세요.
                  </Text>
                  <View style={styles.inputContainer}>
                    <TextInput
                      value={newDrawerName}
                      onChangeText={setNewDrawerName}
                      placeholder="서랍 이름 입력"
                      placeholderTextColor="#666"
                      style={styles.textInput}
                      autoFocus={true}
                    />
                  </View>
                  <TouchableOpacity
                    style={[
                      styles.confirmButton,
                      { opacity: newDrawerName.trim().length === 0 ? 0.5 : 1 },
                    ]}
                    onPress={handleConfirmCreateDrawer}
                    disabled={newDrawerName.trim().length === 0}
                  >
                    <Text style={styles.confirmButtonText}>완료</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View>
                  <TouchableOpacity
                    style={styles.popupItem}
                    onPress={handleCreateDrawer}
                  >
                    <Ionicons
                      name="add"
                      size={20}
                      color="#ffffff"
                      style={styles.popupItemIcon}
                    />
                    <Text style={styles.popupItemText}>새 서랍 만들기</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.popupItem}>
                    <View style={styles.popupItemPlaceholder} />
                    <Text style={styles.popupItemText}>내 찜1</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.popupItem}>
                    <View style={styles.popupItemPlaceholder} />
                    <Text style={styles.popupItemText}>내 찜2</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.popupItem}>
                    <View style={styles.popupItemPlaceholder} />
                    <Text style={styles.popupItemText}>내 찜3</Text>
                  </TouchableOpacity>
                </View>
              )}
            </Animated.View>
          </KeyboardAvoidingView>
        </TouchableOpacity>
      )}
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
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 37,
    paddingTop: 20,
    marginBottom: 40,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  favoriteButton: {
    padding: 8,
    marginRight: -8,
  },
  content: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 37,
  },
  artworkContainer: {
    marginBottom: 35,
  },
  artworkImage: {
    width: 280,
    height: 280,
    borderRadius: 20,
    backgroundColor: "#1a4b5c",
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "rgba(0, 122, 255, 0.3)",
  },
  actualImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  trackInfo: {
    alignItems: "center",
    marginBottom: 35,
  },
  trackTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 8,
    textAlign: "center",
  },
  trackArtist: {
    fontSize: 16,
    color: "#9ca3af",
    textAlign: "center",
  },
  controlsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 40,
    marginBottom: 40,
  },
  controlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  playButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#007aff",
    justifyContent: "center",
    alignItems: "center",
  },
  progressContainer: {
    width: "100%",
  },
  progressBar: {
    width: "100%",
    height: 6,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 2,
    marginBottom: 12,
    position: "relative",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#007aff",
    borderRadius: 2,
  },
  timeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  currentTime: {
    fontSize: 14,
    color: "#9ca3af",
  },
  totalTime: {
    fontSize: 14,
    color: "#9ca3af",
  },

  // 팝업 관련 스타일
  popupOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "flex-end",
  },
  keyboardAvoidingView: {
    flex: 1,
    justifyContent: "flex-end",
  },
  popupContainer: {
    backgroundColor: "#2c2c34",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: screenHeight * 0.8, // 화면 높이의 80%를 넘지 않도록
  },
  popupHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  popupTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#ffffff",
    textAlign: "center",
  },
  popupItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
  },
  popupItemIcon: {
    width: 20,
    marginRight: 15,
  },
  popupItemText: {
    fontSize: 16,
    color: "#ffffff",
  },
  popupItemPlaceholder: {
    width: 20,
    height: 20,
    borderRadius: 4,
    backgroundColor: "#4e4e5b",
    marginRight: 15,
  },

  // 새 서랍 만들기 관련 스타일
  createDrawerContainer: {
    // 키보드가 올라와도 충분한 공간 확보
  },
  createDrawerDescription: {
    color: "#9ca3af",
    marginBottom: 15,
    fontSize: 14,
  },
  inputContainer: {
    backgroundColor: "#1e1e25",
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  textInput: {
    color: "#fff",
    fontSize: 16,
    minHeight: 20, // 최소 높이 설정
  },
  confirmButton: {
    backgroundColor: "#007aff",
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: "center",
  },
  confirmButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
