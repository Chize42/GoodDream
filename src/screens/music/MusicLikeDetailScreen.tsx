// app/MusicLikeDetail.tsx
import { Feather, Ionicons } from "@expo/vector-icons";

import React from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import deepSpaceImage from "../../../assets/images/deep-space.jpg";

export default function MusicLikeDetailScreen({
  navigation,
}: {
  navigation: any;
}) {
  const tracks = [
    {
      id: 1,
      title: "우주의 탄생",
      artist: "EBS",
      image: deepSpaceImage,
    },
    {
      id: 2,
      title: "우주의 탄생",
      artist: "EBS",
      image: deepSpaceImage,
    },
    {
      id: 3,
      title: "우주의 탄생",
      artist: "EBS",
      image: deepSpaceImage,
    },
  ];

  return (
    <View style={styles.container}>
      {/* 뒤로가기 */}
      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="chevron-back" size={26} color="#fff" />
      </TouchableOpacity>

      {/* 앨범 이미지 */}
      <View style={styles.cover} />

      {/* 제목 + 수정 + 트랙개수 */}
      <View style={styles.titleSection}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>내 찜1</Text>
          <TouchableOpacity>
            <Feather
              name="edit-2"
              size={18}
              color="#fff"
              style={styles.editIcon}
            />
          </TouchableOpacity>
        </View>
        <Text style={styles.trackCount}>트랙 3개</Text>
      </View>

      {/* 트랙 리스트 */}
      <ScrollView style={{ marginTop: 20 }}>
        {tracks.map((track) => (
          <View key={track.id} style={styles.trackItem}>
            <Image source={track.image} style={styles.trackImage} />
            <View>
              <Text style={styles.trackTitle}>{track.title}</Text>
              <Text style={styles.trackArtist}>{track.artist}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#181820",
    paddingTop: 40,
  },
  backBtn: {
    position: "absolute",
    top: 40,
    left: 20,
    zIndex: 10,
  },
  cover: {
    width: "60%",
    aspectRatio: 1,
    backgroundColor: "#2A2A2A",
    borderRadius: 8,
    marginTop: 40,
    alignSelf: "center",
  },
  titleSection: {
    alignItems: "center", // 가운데 정렬
    marginTop: 15,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  editIcon: {
    marginLeft: 8,
  },
  trackCount: {
    color: "#aaa",
    fontSize: 14,
    marginTop: 4,
  },
  trackItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    paddingHorizontal: 20,
  },
  trackImage: {
    width: 50,
    height: 50,
    borderRadius: 4,
    marginRight: 12,
  },
  trackTitle: {
    color: "#fff",
    fontSize: 16,
  },
  trackArtist: {
    color: "#aaa",
    fontSize: 14,
  },
});
