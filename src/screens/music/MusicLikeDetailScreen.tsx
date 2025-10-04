import React, { useState, useEffect } from "react";
import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  Modal,
  Alert,
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { usePlaylistContext } from "../../contexts/PlaylistContext";
import { useMusicContext } from "../../contexts/MusicContext";

const BottomPlayer = ({ currentSound, isPlaying, onPlayPause, onPlayerPress }: any) => (
  <TouchableOpacity style={styles.bottomPlayer} onPress={onPlayerPress}>
    <View style={styles.playerContent}>
      <Image source={currentSound.image} style={styles.playerImage} />
      <View style={styles.playerInfo}>
        <Text style={styles.playerTitle} numberOfLines={1}>{currentSound.title}</Text>
        <Text style={styles.playerSubtitle} numberOfLines={1}>{currentSound.subtitle}</Text>
      </View>
      <TouchableOpacity style={styles.playerPlayButton} onPress={(e) => { e.stopPropagation(); onPlayPause(); }}>
        <Ionicons name={isPlaying ? "pause" : "play"} size={20} color="#fff" />
      </TouchableOpacity>
    </View>
  </TouchableOpacity>
);


export default function MusicLikeDetailScreen({ navigation, route }: { navigation: any; route: any; }) {
  const { playlistId } = route.params;
  const { playlists, renamePlaylist, removeTrackFromPlaylist } = usePlaylistContext();
  
  const { playPlaylist, currentSound, isPlaying, togglePlayPause } = useMusicContext();

  const playlist = playlists.find((p) => p.id === playlistId);

  const [isEditing, setIsEditing] = useState(false);
  const [isRenameModalVisible, setRenameModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState(playlist?.title || "");

  useEffect(() => {
    if (!playlist) {
      navigation.goBack();
    } else {
      setNewTitle(playlist.title);
    }
  }, [playlists, playlist, navigation]);

  if (!playlist) return null;

  const handleSave = () => {
    setIsEditing(false);
  };
  
  const handleRenameRequest = () => {
    setNewTitle(playlist.title);
    setRenameModalVisible(true);
  }
  
  const handleRenameConfirm = () => {
    if (newTitle.trim().length > 0) {
        renamePlaylist(playlist.id, newTitle.trim());
        setRenameModalVisible(false);
    } else {
        Alert.alert("알림", "플레이리스트 이름은 한 글자 이상이어야 합니다.");
    }
  }

  const handlePlayerPress = () => {
    if (currentSound) {
      navigation.navigate("MusicPlayer", { ...currentSound });
    }
  };

  const handleShufflePlay = () => {
    const shuffled = [...playlist.tracks].sort(() => Math.random() - 0.5);
    playPlaylist(shuffled);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={26} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerButton} onPress={() => isEditing ? handleSave() : setIsEditing(true)}>
          <Text style={styles.headerButtonText}>{isEditing ? "완료" : "수정"}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={{ paddingBottom: currentSound ? 100 : 20 }}
      >
        {/* 앨범 커버 (상단 중앙) */}
        <View style={styles.coverWrapper}>
          <View style={styles.coverArtContainer}>
            {playlist.tracks.length > 0 ? (
              <Image source={playlist.tracks[0].image} style={styles.coverArt} />
            ) : <View style={styles.coverArt} />}
          </View>
        </View>

        {/* 플레이리스트 정보 (커버 아래) */}
        <View style={styles.infoSection}>
          <View style={styles.detailsContainer}>
              <View style={styles.titleRow}>
                  <Text style={styles.titleText} numberOfLines={1}>{playlist.title}</Text>
                  {isEditing && (
                      <TouchableOpacity onPress={handleRenameRequest}>
                          <Feather name="edit-2" size={18} color="#aaa" style={styles.editIcon}/>
                      </TouchableOpacity>
                  )}
              </View>
              <Text style={styles.trackCountText}>{`트랙 ${playlist.tracks.length}개`}</Text>
          </View>
        </View>

        {/* 재생 & 셔플 버튼 */}
        <View style={styles.playButtonsContainer}>
          <TouchableOpacity style={styles.playButton} onPress={() => playPlaylist(playlist.tracks)}>
            <Ionicons name="play" size={20} color="#4074D8" />
            <Text style={styles.playButtonText}>재생</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.playButton} onPress={handleShufflePlay}>
            <Ionicons name="shuffle" size={20} color="#4074D8" />
            <Text style={styles.playButtonText}>임의 재생</Text>
          </TouchableOpacity>
        </View>

        {/* 트랙 리스트 */}
        {playlist.tracks.map((track) => (
          <View key={track.id} style={styles.trackItem}>
            <Image source={track.image} style={styles.trackImage} />
            <View style={styles.trackInfo}>
              <Text style={styles.trackTitle}>{track.title}</Text>
              <Text style={styles.trackArtist}>{track.subtitle}</Text>
            </View>
            {isEditing && (
              <TouchableOpacity onPress={() => removeTrackFromPlaylist(playlist.id, track.id)}>
                <Image source={{ uri: 'https://i.ibb.co/Psx5Wm4Q/mynaui-trash.png' }} style={styles.deleteIcon} />
              </TouchableOpacity>
            )}
          </View>
        ))}
      </ScrollView>

      {currentSound && (
        <BottomPlayer
          currentSound={currentSound}
          isPlaying={isPlaying}
          onPlayPause={togglePlayPause}
          onPlayerPress={handlePlayerPress}
        />
      )}
      
      {/* 이름 변경 모달 */}
      <Modal visible={isRenameModalVisible} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>플레이리스트 이름 변경</Text>
            <TextInput
              style={styles.modalInput}
              value={newTitle}
              onChangeText={setNewTitle}
              placeholder="새 이름 입력"
              placeholderTextColor="#666"
            />
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.modalButton} 
                onPress={() => setRenameModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalConfirmButton]} 
                onPress={handleRenameConfirm}
              >
                <Text style={[styles.modalButtonText, styles.modalConfirmButtonText]}>확인</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    container: { 
      flex: 1, 
      backgroundColor: "#181820" 
    },
    header: { 
      flexDirection: 'row', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      paddingHorizontal: 16, 
      paddingTop: 10, 
      paddingBottom: 10 
    },
    headerButton: { 
      padding: 8 
    },
    headerButtonText: { 
      color: '#007aff', 
      fontSize: 16 
    },
    coverWrapper: { 
      alignItems: 'center',
      marginVertical: 20 
    },
    coverArtContainer: { 
      width: '70%', 
      aspectRatio: 1 
    },
    coverArt: { 
      width: '100%', 
      height: '100%', 
      borderRadius: 8, 
      backgroundColor: '#2A2A2A' 
    },
    infoSection: { 
      flexDirection: 'row', 
      alignItems: 'center', 
      justifyContent: 'center', 
      paddingHorizontal: 20, 
      marginBottom: 20,
    },
    detailsContainer: { 
      alignItems: 'center',
    },
    titleRow: { 
      flexDirection: 'row', 
      alignItems: 'center'
     },
    titleText: { 
      color: '#fff', 
      fontSize: 24, 
      fontWeight: 'bold' 
    },
    editIcon: { 
      marginLeft: 8 
    },
    trackCountText: { 
      color: '#aaa', 
      fontSize: 14, 
      marginTop: 6 
    },
    playButtonsContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 12,
      paddingHorizontal: 20,
      marginBottom: 30,
    },
    playButton: {
      width: 134,
      height: 50,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(114, 114, 114, 0.12)',
      borderRadius: 10,
      gap: 8,
    },
    playButtonText: {
      color: '#4074D8',
      fontSize: 16,
      fontWeight: '500',
    },
    trackItem: { 
      flexDirection: "row", 
      alignItems: "center", 
      marginBottom: 15, 
      paddingHorizontal: 20 
    },
    trackImage: { 
      width: 50, 
      height: 50, 
      borderRadius: 4, 
      marginRight: 12 
    },
    trackInfo: { 
      flex: 1 
    },
    trackTitle: { 
      color: "#fff", 
      fontSize: 16 
    },
    trackArtist: { 
      color: "#aaa", 
      fontSize: 14 
    },
    deleteIcon: { 
      width: 24, 
      height: 24 
    },

    modalOverlay: { 
      flex: 1, 
      backgroundColor: 'rgba(0,0,0,0.7)', 
      justifyContent: 'center', 
      alignItems: 'center', 
      paddingHorizontal: 20 
    },
    modalContent: { 
      backgroundColor: '#2c2c34', 
      borderRadius: 14, 
      padding: 20, 
      width: '100%' 
    },
    modalTitle: { 
      color: '#fff', 
      fontSize: 18, 
      fontWeight: 'bold', 
      textAlign: 'center', 
      marginBottom: 15 
    },
    modalInput: { 
      backgroundColor: '#1e1e25', 
      color: '#fff', 
      borderRadius: 8, 
      padding: 10, 
      fontSize: 16, 
      marginBottom: 20 
    },
    modalActions: { 
      flexDirection: 'row', 
      justifyContent: 'space-between' 
    },
    modalButton: { 
      flex: 1, 
      padding: 12, 
      borderRadius: 8, 
      alignItems: 'center' 
    },
    modalConfirmButton: { 
      backgroundColor: '#007aff' 
    },
    modalButtonText: { 
      color: '#007aff', 
      fontSize: 16 
    },
    modalConfirmButtonText: { 
      color: '#fff', 
      fontWeight: 'bold' 
    },

    bottomPlayer: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
        backgroundColor: '#1a1a1a',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#007AFF',
      },
      playerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
      },
      playerImage: {
        width: 48,
        height: 48,
        borderRadius: 8,
        marginRight: 12,
      },
      playerInfo: {
        flex: 1,
      },
      playerTitle: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 2,
      },
      playerSubtitle: {
        color: '#9ca3af',
        fontSize: 12,
      },
      playerPlayButton: {
        width: 44,
        height: 44,
        borderRadius: 30,
        backgroundColor: '#007AFF',
        justifyContent: 'center',
        alignItems: 'center',
      },
      playAllIcon: { width: 60, height: 60 },
});