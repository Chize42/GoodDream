import { Ionicons } from "@expo/vector-icons";

import React from "react";
import {
  Dimensions,
  FlatList,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useMusicContext } from "../../../contexts/MusicContext";

interface Playlist {
  title: string;
  tracks: number;
}

interface SoundItem {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  image: any;
  isPlaying?: boolean;
}

const BottomPlayer = ({
  currentSound,
  isPlaying,
  onPlayPause,
  onPlayerPress,
}: {
  currentSound: SoundItem;
  isPlaying: boolean;
  onPlayPause: () => void;
  onPlayerPress: () => void;
}) => (
  <TouchableOpacity style={styles.bottomPlayer} onPress={onPlayerPress}>
    <View style={styles.playerContent}>
      <Image source={currentSound.image} style={styles.playerImage} />
      <View style={styles.playerInfo}>
        <Text style={styles.playerTitle} numberOfLines={1}>
          {currentSound.title}
        </Text>
        <Text style={styles.playerSubtitle} numberOfLines={1}>
          {currentSound.subtitle}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.playerPlayButton}
        onPress={(e) => {
          e.stopPropagation();
          onPlayPause();
        }}
      >
        <Ionicons name={isPlaying ? "pause" : "play"} size={20} color="#fff" />
      </TouchableOpacity>
    </View>
  </TouchableOpacity>
);

const MusicLikeScreen = ({ navigation }: { navigation: any }) => {
  const { currentSound, isPlaying, togglePlayPause } = useMusicContext();

  const myPlaylists: Playlist[] = [
    { title: "내 찜1", tracks: 3 },
    { title: "내 찜2", tracks: 10 },
    { title: "내 찜3", tracks: 10 },
    { title: "내 찜4", tracks: 10 },
  ];

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handlePlayerPress = () => {
    if (currentSound) {
      navigation.navigate("MusicPlayer", {
        id: currentSound.id,
        title: currentSound.title,
        subtitle: currentSound.subtitle,
      });
    }
  };

  const renderPlaylistItem = ({
    item,
    index,
  }: {
    item: Playlist;
    index: number;
  }) => (
    <TouchableOpacity
      style={styles.playlistItem}
      onPress={() => navigation.navigate("MusicLikeDetail")}
    >
      <View style={styles.thumbnail} />
      <View style={styles.playlistInfo}>
        <Text style={styles.playlistTitle}>{item.title}</Text>
        <Text style={styles.playlistTrack}>{`트랙 ${item.tracks}개`}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={handleBackPress}
            style={styles.backButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="chevron-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>즐겨찾기</Text>
          <View style={styles.rightSpacer} />
        </View>

        {/* Playlist List */}
        <FlatList
          data={myPlaylists}
          renderItem={renderPlaylistItem}
          keyExtractor={(item, index) => index.toString()}
          style={styles.playlistList}
          contentContainerStyle={
            currentSound ? styles.scrollContentWithPlayer : styles.scrollContent
          }
          showsVerticalScrollIndicator={false}
        />
      </View>

      {/* Bottom Player */}
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

const { width } = Dimensions.get("window");
const maxWidth = Math.min(width, 400);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#181820",
    alignSelf: "center",
    width: maxWidth,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 4,
    marginBottom: 24,
    position: "relative",
  },
  headerTitle: {
    position: "absolute",
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    zIndex: 1,
  },
  playlistList: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  scrollContentWithPlayer: {
    paddingBottom: 100,
  },
  playlistItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  thumbnail: {
    width: 56,
    height: 56,
    backgroundColor: "#222",
    borderRadius: 6,
    marginRight: 12,
  },
  playlistInfo: {
    flexDirection: "column",
    flex: 1,
  },
  playlistTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "white",
    marginBottom: 4,
  },
  playlistTrack: {
    fontSize: 13,
    color: "#aaa",
  },
  backButton: {
    padding: 8,
    zIndex: 10,
  },
  rightSpacer: {
    width: 34, // backButton과 같은 크기로 균형 맞춤
  },
  bottomPlayer: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: "#1a1a1a",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#007AFF",
  },
  playerContent: {
    flexDirection: "row",
    alignItems: "center",
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
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 2,
  },
  playerSubtitle: {
    color: "#9ca3af",
    fontSize: 12,
  },
  playerPlayButton: {
    width: 44,
    height: 44,
    borderRadius: 30,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default MusicLikeScreen;
