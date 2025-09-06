// src/screens/MusicScreen.tsx
import React, { useState } from "react";
import {
  Dimensions,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import gravityImage from "../../../assets/images/gravity.png";
import deepSpaceImage from "../../../assets/images/deep-space.jpg";
import airplaneImage from "../../../assets/images/airplane.png";
import rainImage from "../../../assets/images/rain.png";
import libraryImage from "../../../assets/images/library.png";
// import { useMusicContext } from '../contexts/MusicContext'; // 필요시 추가

const { width: screenWidth } = Dimensions.get("window");

interface SoundItem {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  image: any;
  isPlaying?: boolean;
}

const soundData: SoundItem[] = [
  {
    id: "1",
    title: "중력 명상",
    subtitle: "명상",
    category: "명상",
    image: gravityImage,
  },
  {
    id: "2",
    title: "우주의 탄생",
    subtitle: "다큐멘터리",
    category: "다큐멘터리",
    image: deepSpaceImage,
  },
  {
    id: "3",
    title: "비행기 기내 안",
    subtitle: "백색소음",
    category: "백색소음",
    image: airplaneImage,
  },
  {
    id: "4",
    title: "비",
    subtitle: "자연",
    category: "자연",
    image: rainImage,
  },
  {
    id: "5",
    title: "도서관",
    subtitle: "백색소음",
    category: "백색소음",
    image: libraryImage,
  },
  {
    id: "6",
    title: "딥 스페이스",
    subtitle: "백색소음",
    category: "백색소음",
    image: deepSpaceImage,
  },
];

const categoryData = ["전체", "백색소음", "자연", "명상", "다큐멘터리"];

const SoundGridItem = ({
  item,
  onPlay,
  currentPlaying,
  isPlaying,
}: {
  item: SoundItem;
  onPlay: (item: SoundItem) => void;
  currentPlaying: SoundItem | null;
  isPlaying: boolean;
}) => {
  const isCurrentlyPlaying = currentPlaying?.id === item.id;
  const shouldShowPause = isCurrentlyPlaying && isPlaying;

  return (
    <TouchableOpacity
      style={[styles.gridItem, isCurrentlyPlaying && styles.gridItemActive]}
      onPress={() => onPlay(item)}
    >
      <View style={styles.gridItemImageContainer}>
        <Image source={item.image} style={styles.gridItemImage} />
        <View style={styles.gridItemOverlay}>
          <View style={styles.playButton}>
            <Ionicons
              name={shouldShowPause ? "pause" : "play"}
              size={16}
              color="#fff"
            />
          </View>
        </View>
      </View>
      <View style={styles.gridItemInfo}>
        <Text style={styles.gridItemTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.gridItemSubtitle} numberOfLines={1}>
          {item.subtitle}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

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

export default function MusicScreen({ navigation }: { navigation: any }) {
  const [activeCategory, setActiveCategory] = useState("전체");
  const [currentSound, setCurrentSound] = useState<SoundItem | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // MusicContext를 사용하려면 아래 줄들을 주석 해제하고 위의 state들을 제거
  // const { currentSound, isPlaying, playSound, togglePlayPause } = useMusicContext();

  const filteredSounds =
    activeCategory === "전체"
      ? soundData
      : soundData.filter((item) => item.category === activeCategory);

  const playSound = (item: SoundItem) => {
    setCurrentSound(item);
    setIsPlaying(true);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handlePlayerPress = () => {
    if (currentSound) {
      navigation.navigate("MusicPlayer", {
        id: currentSound.id,
        title: currentSound.title,
        subtitle: currentSound.subtitle,
        image: currentSound.image,
      });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()} // React Navigation 방식으로 변경
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>사운드</Text>
        </View>

        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={() => navigation.navigate("MusicLike")} // React Navigation 방식으로 변경
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.favoriteButtonText}>즐겨찾기</Text>
        </TouchableOpacity>
      </View>

      {/* Categories */}
      <View style={styles.categoryContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          {categoryData.map((category, index) => (
            <Pressable
              key={index}
              style={[
                styles.categoryButton,
                activeCategory === category && styles.activeCategoryButton,
              ]}
              onPress={() => setActiveCategory(category)}
            >
              <Text
                style={[
                  styles.categoryText,
                  activeCategory === category && styles.activeCategoryText,
                ]}
              >
                {category}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Sound Grid */}
      <ScrollView
        style={styles.contentContainer}
        contentContainerStyle={
          currentSound ? styles.scrollContentWithPlayer : styles.scrollContent
        }
      >
        <View style={styles.soundGrid}>
          {filteredSounds.map((item) => (
            <SoundGridItem
              key={item.id}
              item={item}
              onPlay={playSound}
              currentPlaying={currentSound}
              isPlaying={isPlaying}
            />
          ))}
        </View>
      </ScrollView>

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
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#181820",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 80,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  favoriteButton: {
    backgroundColor: "#007AFF",
    borderRadius: 16,
    width: 80,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  favoriteButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
  categoryContainer: {
    paddingVertical: 8,
    paddingLeft: 20,
  },
  categoryScroll: {
    alignItems: "center",
    gap: 8,
  },
  categoryButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "#2a2d47",
  },
  activeCategoryButton: {
    backgroundColor: "#007AFF",
  },
  categoryText: {
    color: "#9ca3af",
    fontSize: 14,
    fontWeight: "500",
  },
  activeCategoryText: {
    color: "#fff",
    fontWeight: "600",
  },
  contentContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  scrollContentWithPlayer: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  soundGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingTop: 10,
  },
  gridItem: {
    width: (screenWidth - 56) / 2,
    marginBottom: 16,
    borderRadius: 16,
    backgroundColor: "#2a2d47",
    overflow: "hidden",
  },
  gridItemActive: {
    borderWidth: 2,
    borderColor: "#007AFF",
  },
  gridItemImageContainer: {
    position: "relative",
    height: 120,
  },
  gridItemImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  gridItemOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  playButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  gridItemInfo: {
    padding: 16,
    backgroundColor: "#2a2d47",
  },
  gridItemTitle: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  gridItemSubtitle: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 13,
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
