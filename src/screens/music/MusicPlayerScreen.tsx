import React, { useRef, useState, useEffect } from "react";
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
  ToastAndroid,
  Modal,
  FlatList,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useMusicContext } from "../../contexts/MusicContext";
import { usePlaylistContext } from "../../contexts/PlaylistContext";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

export default function MusicPlayerScreen({ navigation, route }: { navigation: any; route: any; }) {
  const {
    currentSound,
    isPlaying,
    currentTime,
    duration,
    playSingleSound,
    togglePlayPause,
    seekToTime,
    playbackQueue,
    queueIndex,
    playTrackFromQueue,
  } = useMusicContext();

  const { playlists, createPlaylist, addTrackToPlaylist, isFavorite } = usePlaylistContext();

  const [showFavoritePopup, setShowFavoritePopup] = useState(false);
  const [isCreatingDrawer, setIsCreatingDrawer] = useState(false);
  const [newDrawerName, setNewDrawerName] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isPlaylistModalVisible, setIsPlaylistModalVisible] = useState(false);

  const slideAnim = useRef(new Animated.Value(screenHeight)).current;
  const isCurrentlyFavorite = currentSound ? isFavorite(currentSound.id) : false;

  // [수정] 📍📍📍 여기가 버그의 원인이었습니다! 📍📍📍
  useEffect(() => {
    // 기존 로직: if (route.params?.audio && (!currentSound || route.params.audio !== currentSound.audio)) {
    // 
    // [수정된 로직]
    // 이 화면으로 이동했는데(route.params가 있는데),
    // 마침 재생 중인 곡이 아무것도 없다면(e.g., 앱 재시작)
    // route.params의 곡을 재생합니다.
    if (route.params?.audio && !currentSound) {
      playSingleSound(route.params);
    }
    //
    // 이제 `currentSound`가 모달에서 바뀌더라도
    // `!currentSound` 조건이 false가 되므로, 
    // 이 `useEffect`는 다시는 `playSingleSound`를 호출하지 않습니다.
    //
  }, [route.params, currentSound, playSingleSound]);

  const showToast = (message: string) => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    } else {
      setToastMessage(message);
      setTimeout(() => setToastMessage(null), 2000);
    }
  };

  const openPopup = () => {
    setShowFavoritePopup(true);
    Animated.timing(slideAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start();
  };

  const closePopup = () => {
    Animated.timing(slideAnim, { toValue: screenHeight, duration: 300, useNativeDriver: true }).start(() => {
      setShowFavoritePopup(false);
      setIsCreatingDrawer(false);
    });
  };

  const openPlaylistModal = () => setIsPlaylistModalVisible(true);
  const closePlaylistModal = () => setIsPlaylistModalVisible(false);

  const handleSelectTrack = (index: number) => {
    playTrackFromQueue(index);
  };

  const handleConfirmCreateDrawer = () => {
    if (newDrawerName.trim().length === 0 || !currentSound) return;
    createPlaylist(newDrawerName, currentSound);
    showToast(`음악을 추가했어요.`);
    setNewDrawerName("");
    closePopup();
  };

  const handleAddToPlaylist = (playlistId: string) => {
    if (!currentSound) return;
    const added = addTrackToPlaylist(playlistId, currentSound);
    if (added) {
      showToast(`음악을 추가했어요.`);
    }
    closePopup();
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderGrant: (evt) => {
      const progressBarWidth = screenWidth - 74;
      const touchX = evt.nativeEvent.locationX;
      const newProgress = Math.min(1, Math.max(0, touchX / progressBarWidth));
      seekToTime(newProgress * duration);
    },
  });

  if (!currentSound) {
    return <SafeAreaView style={styles.safeArea}><Text style={styles.loadingText}>Loading...</Text></SafeAreaView>;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.favoriteButton} onPress={openPopup}>
          {isCurrentlyFavorite ? (
            <Image source={{ uri: 'https://i.ibb.co/WpKVJ4h5/Frame-2608676.png' }} style={styles.favoriteIconImage} />
          ) : (
            <Ionicons name="heart-outline" size={24} color="#9ca3af" />
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
          <View style={styles.artworkImage}><Image source={currentSound.image} style={styles.actualImage} /></View>
          <View style={styles.trackInfo}>
            <Text style={styles.trackTitle}>{currentSound.title}</Text>
            <Text style={styles.trackArtist}>{currentSound.subtitle}</Text>
          </View>
          
          <View style={styles.controlsContainer}>
              <View style={{ width: 30 }} /> 

              <TouchableOpacity onPress={() => seekToTime(Math.max(0, currentTime - 30))}>
                  <MaterialIcons name="replay-30" size={30} color="#ffffff" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.playButton} onPress={togglePlayPause}>
                  <Ionicons name={isPlaying ? "pause" : "play"} size={32} color="#ffffff" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => seekToTime(Math.min(duration, currentTime + 30))}>
                  <MaterialIcons name="forward-30" size={30} color="#ffffff" />
              </TouchableOpacity>

              {playbackQueue.length > 0 ? (
                <TouchableOpacity onPress={openPlaylistModal}>
                    <Ionicons name="list" size={30} color="#ffffff" />
                </TouchableOpacity>
              ) : (
                <View style={{ width: 30 }} /> 
              )}
          </View>
          
          <View style={styles.progressContainer}>
            <View style={styles.progressBar} {...panResponder.panHandlers}><View style={[styles.progressFill, { width: `${progress}%` }]} /></View>
            <View style={styles.timeContainer}><Text style={styles.currentTime}>{formatTime(currentTime)}</Text><Text style={styles.totalTime}>{formatTime(duration)}</Text></View>
          </View>
        </View>

        {/* --- 기존 즐겨찾기 팝업 (수정 없음) --- */}
        {showFavoritePopup && (
          <TouchableOpacity style={styles.popupOverlay} activeOpacity={1} onPress={closePopup}>
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1, justifyContent: 'flex-end' }}>
              <Animated.View style={[styles.popupContainer, { transform: [{ translateY: slideAnim }] }]} onStartShouldSetResponder={() => true}>
                <View style={styles.popupHeader}>
                  <Text style={styles.popupTitle}>{isCreatingDrawer ? "새 서랍 만들기" : "즐겨찾기"}</Text>
                  <TouchableOpacity onPress={closePopup}><Ionicons name="close" size={24} color="#9ca3af" /></TouchableOpacity>
                </View>
                {isCreatingDrawer ? (
                  <View>
                    <Text style={styles.createDrawerDescription}>서랍 이름은 최소 한 글자 이상 입력하세요.</Text>
                    <TextInput value={newDrawerName} onChangeText={setNewDrawerName} placeholder="서랍 이름" placeholderTextColor="#6b7280" style={styles.textInput} autoFocus />
                    <TouchableOpacity style={[styles.confirmButton, { opacity: newDrawerName.trim() ? 1 : 0.5 }]} onPress={handleConfirmCreateDrawer} disabled={!newDrawerName.trim()}>
                      <Text style={styles.confirmButtonText}>완료</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View>
                    <TouchableOpacity style={styles.popupItem} onPress={() => setIsCreatingDrawer(true)}>
                      <View style={styles.plusIconContainer}><Ionicons name="add" size={20} color="#ffffff" /></View>
                      <Text style={styles.popupItemText}>새 서랍 만들기</Text>
                    </TouchableOpacity>
                    {playlists.map((playlist) => (
                      <TouchableOpacity key={playlist.id} style={styles.popupItem} onPress={() => handleAddToPlaylist(playlist.id)}>
                        {playlist.tracks.length > 0 ? (
                          <Image source={playlist.tracks[0].image} style={styles.popupItemThumbnail} />
                        ) : (
                          <View style={styles.popupItemPlaceholder} />
                        )}
                        <Text style={styles.popupItemText}>{playlist.title}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </Animated.View>
            </KeyboardAvoidingView>
          </TouchableOpacity>
        )}

        {/* --- 재생 목록 모달 (수정 없음) --- */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={isPlaylistModalVisible}
          onRequestClose={closePlaylistModal}
        >
          <TouchableOpacity 
            style={styles.popupOverlay} 
            activeOpacity={1} 
            onPress={closePlaylistModal}
          >
            <View 
              style={[styles.popupContainer, { maxHeight: screenHeight * 0.6 }]}
              onStartShouldSetResponder={() => true} 
            >
              <View style={styles.popupHeader}>
                <Text style={styles.popupTitle}>재생 목록</Text>
                <TouchableOpacity onPress={closePlaylistModal}>
                  <Ionicons name="close" size={24} color="#9ca3af" />
                </TouchableOpacity>
              </View>

              <FlatList
                data={playbackQueue}
                keyExtractor={(item, index) => `${item.id}-${index}`}
                renderItem={({ item, index }) => {
                  const isCurrentTrack = index === queueIndex;
                  return (
                    <TouchableOpacity 
                      style={styles.popupItem}
                      onPress={() => handleSelectTrack(index)}
                    >
                      <Image source={item.image} style={styles.popupItemThumbnail} />
                      <View style={{ flex: 1 }}>
                        <Text 
                          style={[
                            styles.popupItemText, 
                            isCurrentTrack && styles.currentTrackText
                          ]}
                          numberOfLines={1}
                        >
                          {item.title}
                        </Text>
                        <Text 
                          style={[
                            styles.playlistItemSubtitle,
                            isCurrentTrack && styles.currentTrackText
                          ]}
                          numberOfLines={1}
                        >
                          {item.subtitle}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                }}
              />

            </View>
          </TouchableOpacity>
        </Modal>

        {toastMessage && (
          <View style={styles.toastContainer}>
            <Text style={styles.toastText}>{toastMessage}</Text>
          </View>
        )}
    </SafeAreaView>
  );
}

// --- 스타일 (styles) ---
// (수정 없음, 기존과 동일)
const styles = StyleSheet.create({
    safeArea: { 
      flex: 1, 
      backgroundColor: "#181820" 
    },
    header: { 
      flexDirection: "row", 
      justifyContent: "space-between", 
      alignItems: "center", 
      paddingHorizontal: 20, 
      paddingTop: 20 
    },
    backButton: { 
      padding: 8 
    },
    favoriteButton: {
       padding: 8 
      },
    favoriteIconImage: { 
      width: 24, 
      height: 24 
    },
    content: { 
      flex: 1, 
      alignItems: "center", 
      justifyContent: 'center', 
      paddingHorizontal: 37 
    },
    artworkImage: { 
      width: 280, 
      height: 280, 
      borderRadius: 20, 
      backgroundColor: "#1a4b5c",
      overflow: "hidden", 
      borderWidth: 2, 
      borderColor: "rgba(0, 122, 255, 0.3)", 
      marginBottom: 35 
    },
    actualImage: { 
      width: "100%", 
      height: "100%", 
      resizeMode: "cover" 
    },
    trackInfo: { 
      alignItems: "center", 
      marginBottom: 35 
    },
    trackTitle: { 
      fontSize: 24, 
      fontWeight: "700", 
      color: "#ffffff", 
      marginBottom: 8, 
      textAlign: "center" 
    },
    trackArtist: { 
      fontSize: 16, 
      color: "#9ca3af", 
      textAlign: "center" 
    },
    controlsContainer: { 
      flexDirection: "row", 
      alignItems: "center", 
      justifyContent: 'space-between',
      width: '100%',
      marginBottom: 40 
    },
    playButton: { 
      width: 70, 
      height: 70, 
      borderRadius: 35, 
      backgroundColor: "#007aff", 
      justifyContent: "center", 
      alignItems: "center" 
    },
    progressContainer: { 
      width: "100%" 
    },
    progressBar: { 
      height: 6, 
      backgroundColor: "rgba(255, 255, 255, 0.2)", 
      borderRadius: 3, 
      overflow: 'hidden' 
    },
    progressFill: { 
      height: "100%", 
      backgroundColor: "#007aff" 
    },
    timeContainer: { 
      flexDirection: "row", 
      justifyContent: "space-between", 
      marginTop: 8 
    },
    currentTime: { 
      fontSize: 14, 
      color: "#9ca3af" 
    },
    totalTime: { 
      fontSize: 14, 
      color: "#9ca3af" 
    },
    loadingText: { 
      color: "#ffffff", 
      fontSize: 16 
    },
    popupOverlay: { 
      ...StyleSheet.absoluteFillObject, 
      backgroundColor: "rgba(0, 0, 0, 0.7)", 
      justifyContent: "flex-end" 
    },
    popupContainer: { 
      backgroundColor: "#2c2c34", 
      borderTopLeftRadius: 20, 
      borderTopRightRadius: 20, 
      padding: 20, 
      paddingBottom: 40 
    },
    popupHeader: { 
      flexDirection: "row", 
      justifyContent: "space-between", 
      alignItems: "center", 
      marginBottom: 20 
    },
    popupTitle: { 
      flex: 1, 
      textAlign: 'center', 
      fontSize: 20, 
      fontWeight: "700", 
      color: "#ffffff", 
      marginLeft: 24 
    },
    popupItem: { 
      flexDirection: "row", 
      alignItems: "center", 
      paddingVertical: 15 
    },
    plusIconContainer: { 
      width: 40, 
      height: 40, 
      borderRadius: 8, 
      backgroundColor: '#007aff', 
      justifyContent: 'center', 
      alignItems: 'center', 
      marginRight: 15 
    },
    popupItemPlaceholder: { 
      width: 40, 
      height: 40, 
      borderRadius: 8, 
      backgroundColor: '#3a3a3c', 
      marginRight: 15 
    },
    popupItemThumbnail: { 
      width: 40, 
      height: 40, 
      borderRadius: 8, 
      marginRight: 15 
    },
    popupItemText: { 
      fontSize: 16, 
      color: "#ffffff" 
    },
    createDrawerDescription: { 
      color: '#9ca3af', 
      marginBottom: 15, 
      fontSize: 14, 
      textAlign: 'center' 
    },
    textInput: { 
      backgroundColor: '#1e1e25', 
      borderRadius: 10, 
      padding: 15, 
      color: '#fff', 
      fontSize: 16, 
      marginBottom: 20 
    },
    confirmButton: { 
      backgroundColor: "#007aff", 
      borderRadius: 8, 
      paddingVertical: 15, 
      alignItems: "center" 
    },
    confirmButtonText: { 
      color: "#fff", 
      fontSize: 16, 
      fontWeight: "600" 
    },
    toastContainer: { 
      position: 'absolute', 
      bottom: 100, 
      alignSelf: 'center', 
      backgroundColor: 'rgba(0,0,0,0.8)', 
      borderRadius: 20, 
      paddingHorizontal: 20, 
      paddingVertical: 10 
    },
    toastText: { 
      color: '#fff' 
    },
    playlistItemSubtitle: {
      fontSize: 14,
      color: '#9ca3af',
    },
    currentTrackText: {
      color: '#007aff', 
      fontWeight: 'bold',
    },
});