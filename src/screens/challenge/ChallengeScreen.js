import "react-native-gesture-handler";
import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  Image,
  FlatList,
} from "react-native";

// --- 챌린지 옵션 상수 ---
const CHALLENGE_OPTIONS = [
  { days: 0, label: "기간 없이" },
  { days: 21, label: "21 일" },
  { days: 66, label: "66 일" },
];

const ITEM_HEIGHT = 45;
const VISIBLE_ITEMS = 3;

export default function ChallengeScreen({ navigation }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(1);
  const flatListRef = useRef(null);

  const spacerCount = Math.floor(VISIBLE_ITEMS / 2);
  const dataWithSpacers = [
    ...Array(spacerCount).fill({ label: "" }),
    ...CHALLENGE_OPTIONS,
    ...Array(spacerCount).fill({ label: "" }),
  ];

  useEffect(() => {
    flatListRef.current?.scrollToIndex({
      index: selectedIndex,
      animated: false,
    });
  }, []);

  const renderItem = ({ item }) => {
    const { label } = item;
    if (!label) return <View style={styles.itemContainer} />;

    const numberMatch = label.match(/\d+/);
    if (!numberMatch) return <Text style={styles.pickerItemText}>{label}</Text>;

    const number = numberMatch[0];
    const parts = label.split(number);
    return (
      <View style={styles.itemContainer}>
        <Text style={styles.pickerItemText}>
          {parts[0]}
          <Text style={{ color: "#1E90FF" }}>{number}</Text>
          {parts[1]}
        </Text>
      </View>
    );
  };

  const handleMomentumScrollEnd = (event) => {
    const y = event.nativeEvent.contentOffset.y;
    const index = Math.round(y / ITEM_HEIGHT);
    const actualIndex = index - spacerCount;

    if (actualIndex >= 0 && actualIndex < CHALLENGE_OPTIONS.length) {
      setSelectedIndex(actualIndex);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Image
          source={{ uri: "https://i.ibb.co/JWnPXqxG/owl.png" }}
          style={styles.emojiContainer}
        />

        <View style={styles.selectionContainer}>
          <View style={styles.pickerContainer}>
            <FlatList
              ref={flatListRef}
              data={dataWithSpacers}
              renderItem={renderItem}
              keyExtractor={(_, index) => index.toString()}
              showsVerticalScrollIndicator={false}
              snapToInterval={ITEM_HEIGHT}
              decelerationRate="fast"
              contentContainerStyle={{
                paddingTop: spacerCount * ITEM_HEIGHT,
                paddingBottom: spacerCount * ITEM_HEIGHT,
              }}
              initialScrollIndex={selectedIndex}
              getItemLayout={(_, index) => ({
                length: ITEM_HEIGHT,
                offset: ITEM_HEIGHT * index,
                index,
              })}
              onMomentumScrollEnd={handleMomentumScrollEnd}
              style={{ backgroundColor: "transparent" }}
            />
            <View style={styles.pickerIndicator} />
          </View>
          <Text style={styles.challengeText}>챌린지 설정하기</Text>
        </View>

        <TouchableOpacity
          style={styles.startButton}
          onPress={() => {
            const selectedDays = CHALLENGE_OPTIONS[selectedIndex].days;
            navigation.navigate("ChallengeStart", { totalDays: selectedDays });
          }}
        >
          <Text style={styles.startButtonText}>시작</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Text style={styles.detailText}>자세히 알아보기 →</Text>
        </TouchableOpacity>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalView}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>로드맵 챌린지</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.modalText}>
              Lorem ipsum dolor sit amet consectetur. Eget risus justo volutpat
              senectus dictum diam massa. Sodales nunc lorem rhoncus auctor cras
              sed ultrices dictumst duis. Diam ut odio blandit senectus
              pellentesque et. Consectetur tellus sit amet sit odio.
            </Text>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  emojiContainer: {
    width: 300,
    height: 300,
    resizeMode: "contain",
    marginBottom: 20,
  },
  selectionContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 20,
    width: "100%",
    marginRight: 20,
  },
  pickerContainer: {
    height: ITEM_HEIGHT * VISIBLE_ITEMS,
    width: 200,
    justifyContent: "center",
    alignItems: "center",
  },
  pickerIndicator: {
    position: "absolute",
    width: 150,
    height: 50,
    borderWidth: 2,
    borderColor: "#FFFFFF",
    borderRadius: 25,
  },
  itemContainer: {
    height: ITEM_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  pickerItemText: {
    color: "white",
    fontSize: 22,
    paddingTop: 5,
    fontWeight: "bold",
    textAlign: "center",
  },
  challengeText: {
    color: "#fff",
    fontSize: 22,
    marginLeft: 5,
  },
  startButton: {
    backgroundColor: "#1E90FF",
    paddingVertical: 15,
    borderRadius: 25,
    marginTop: 20,
    width: 200,
    alignItems: "center",
  },
  startButtonText: {
    color: "#fff",
    fontSize: 18,
  },
  detailText: {
    color: "#ccc",
    fontSize: 14,
    marginTop: 15,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalView: {
    backgroundColor: "white",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    minHeight: "40%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  closeButton: {
    fontSize: 20,
    color: "#333",
  },
  modalText: {
    fontSize: 14,
    marginTop: 15,
    lineHeight: 20,
    color: "#333",
  },
});
