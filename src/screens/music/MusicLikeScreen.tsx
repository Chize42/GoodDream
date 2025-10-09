import React, { useState } from "react";
import {
  FlatList,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useMusicContext } from "../../contexts/MusicContext";
import { usePlaylistContext, Playlist } from "../../contexts/PlaylistContext";

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

const MusicLikeScreen = ({ navigation }: { navigation: any }) => {
  const { currentSound, isPlaying, togglePlayPause } = useMusicContext();
  const { playlists, deletePlaylist } = usePlaylistContext();

  const [isEditing, setIsEditing] = useState(false);

  const handlePlayerPress = () => {
    if (currentSound) {
      navigation.navigate("MusicPlayer", { ...currentSound });
    }
  };

  const renderPlaylistItem = ({ item }: { item: Playlist }) => (
    <TouchableOpacity
      style={styles.playlistItem}
      onPress={() => {
        if (!isEditing) {
          navigation.navigate("MusicLikeDetail", { playlistId: item.id });
        }
      }}
    >
      {/* 썸네일 동기화: 첫 번째 트랙 이미지 표시 */}
      {item.tracks.length > 0 ? (
        <Image source={item.tracks[0].image} style={styles.thumbnail} />
      ) : (
        <View style={styles.thumbnail} />
      )}
      
      <View style={styles.playlistInfo}>
        <Text style={styles.playlistTitle}>{item.title}</Text>
        <Text style={styles.playlistTrack}>{`트랙 ${item.tracks.length}개`}</Text>
      </View>
      {isEditing && (
        <TouchableOpacity style={styles.deleteButton} onPress={() => deletePlaylist(item.id)}>
          <Image source={{ uri: 'https://i.ibb.co/Psx5Wm4Q/mynaui-trash.png' }} style={styles.deleteIcon} />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>즐겨찾기</Text>
          <TouchableOpacity style={styles.editButton} onPress={() => setIsEditing(!isEditing)}>
            <Text style={styles.editButtonText}>{isEditing ? "완료" : "수정"}</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={playlists}
          renderItem={renderPlaylistItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: currentSound ? 100 : 20 }}
          showsVerticalScrollIndicator={false}
        />
      </View>
      {currentSound && (
        <BottomPlayer
          currentSound={currentSound}
          isPlaying={isPlaying}
          onPlayPause={togglePlayPause}
          onPlayerPress={handlePlayerPress}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#181820" 
  },
  content: { 
    flex: 1, 
    paddingHorizontal: 16, 
    paddingTop: 20 
  },
  header: { 
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: "space-between", 
    marginBottom: 24 
  },
  backButton: { 
    padding: 8, 
    zIndex: 1 
  },
  headerTitle: { 
    position: 'absolute', 
    left: 0, 
    right: 0, 
    textAlign: 'center', 
    fontSize: 18, 
    fontWeight: "bold", 
    color: "white" 
  },
  editButton: { 
    padding: 8, 
    zIndex: 1 
  },
  editButtonText: { 
    color: "#007aff", 
    fontSize: 16 
  },
  playlistItem: { 
    flexDirection: "row", 
    alignItems: "center", 
    marginBottom: 20, 
    paddingHorizontal: 4 
  },
  thumbnail: { 
    width: 56, 
    height: 56, 
    backgroundColor: "#2A2A2A", 
    borderRadius: 6, 
    marginRight: 12 
  },
  playlistInfo: { 
    flex: 1 
  },
  playlistTitle: { 
    fontSize: 16, 
    fontWeight: "bold", 
    color: "white", 
    marginBottom: 4 
  },
  playlistTrack: { 
    fontSize: 14, 
    color: "#aaa" 
  },
  deleteButton: { 
    padding: 8 
  },
  deleteIcon: { 
    width: 24, 
    height: 24 
  },
  bottomPlayer: { 
    position: "absolute", 
    bottom: 20, 
    left: 20, 
    right: 20, 
    backgroundColor: "#1a1a1a", 
    borderRadius: 20, 
    borderWidth: 1, 
    borderColor: "#007AFF" 
  },
  playerContent: { 
    flexDirection: "row", 
    alignItems: "center", 
    padding: 12 
  },
  playerImage: { 
    width: 48, 
    height: 48, 
    borderRadius: 8, 
    marginRight: 12 
  },
  playerInfo: { 
    flex: 1 
  },
  playerTitle: { 
    color: "#fff", 
    fontSize: 14, 
    fontWeight: "500", 
    marginBottom: 2 
  },
  playerSubtitle: { 
    color: "#9ca3af", 
    fontSize: 12 
  },
  playerPlayButton: { 
    width: 44, 
    height: 44, 
    borderRadius: 30, 
    backgroundColor: "#007AFF", 
    justifyContent: "center", 
    alignItems: "center" 
  },
});

export default MusicLikeScreen;