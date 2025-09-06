// src/screens/HomeScreen.tsx
import { Feather } from "@expo/vector-icons";
import React from "react";
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

function HomeScreen({ navigation }: { navigation: any }) {
  return (
    <ScrollView
      style={styles.homeScreen}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={styles.homeContent}>
        <View style={styles.homeHeader}>
          <View>
            <Text style={styles.welcomeText}>Welcome, Jacob</Text>
            <Text style={styles.dateText}>02 Feb, 2023</Text>
          </View>

          <View style={styles.profileWrapper}>
            <View style={styles.profileCircle}>
              <Image
                source={require("../../../assets/owl.png")}
                style={styles.profileImg}
              />
            </View>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => navigation.navigate("Settings")} // React Navigation 방식으로 변경
            >
              <Feather name="edit-2" size={14} color="#2E4A7D" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.weekly}>
          <Text style={styles.weeklyText}>weekly report</Text>
          <TouchableOpacity>
            <Text
              style={styles.seeMore}
              onPress={() => {
                // 수면 추적 기능 추가 시
                const today = new Date().toISOString().split("T")[0];
                navigation.navigate("SleepReport", { initialDate: today });
              }}
            >
              더보기 &gt;
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.chartBox}>
          <Text style={styles.barChartPlaceholder}>[Bar Chart]</Text>
        </View>

        <View style={styles.cardContainer}>
          <TouchableOpacity
            style={[styles.card, styles.purple]}
            onPress={() => navigation.navigate("Alarm")}
          >
            <Image
              source={require("../../../assets/alramOwl.png")}
              style={styles.cardIllustration}
            />
            <Text style={styles.cardTitle}>알람설정</Text>
            <Text style={styles.cardSubtitle}>ALARM</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.card, styles.orange]}
            onPress={() => navigation.navigate("Music")} // React Navigation 방식으로 변경
          >
            <Image
              source={require("../../../assets/soundOwl.png")}
              style={styles.cardIllustration}
            />
            <Text style={styles.cardTitleT}>사운드</Text>
            <Text style={styles.cardSubtitleT}>MUSIC</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.challengeBox}
          onPress={() => navigation.navigate("Challenge")}
        >
          <Image
            source={require("../../../assets/challengeOwl.png")}
            style={styles.challengeOwl}
          />
          <View style={styles.challengeTexts}>
            <Text style={styles.challengeTitle}>챌린지</Text>
            <Text style={styles.challengeSubtitle}>CHALLENGE</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.startSleepingBtn}
          onPress={() => navigation.navigate("Bubble")}
        >
          <Image
            source={require("../../../assets/moon.png")}
            style={styles.sleepingIcon}
          />
          <Text style={styles.startSleepingText}>Start Sleeping</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  homeScreen: {
    backgroundColor: "#181820",
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
    paddingVertical: 5,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  homeContent: {
    width: "100%",
    maxWidth: 400,
  },
  homeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
  },
  dateText: {
    fontSize: 17,
    color: "#aaa",
    marginTop: 0,
    marginBottom: 4,
  },
  welcomeText: {
    fontSize: 25,
    fontWeight: "bold",
    color: "white",
    marginBottom: 4,
  },
  profileWrapper: {
    position: "relative",
    width: 60,
    height: 60,
  },
  profileCircle: {
    backgroundColor: "#2E4A7D",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  profileImg: {
    width: 40,
    height: 40,
    resizeMode: "contain",
  },
  editButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "white",
    borderRadius: 12,
    padding: 3,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
  },
  weekly: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  weeklyText: {
    fontSize: 18,
    color: "white",
  },
  seeMore: {
    color: "#aaa",
    fontSize: 12,
  },
  chartBox: {
    backgroundColor: "#1e1e35",
    borderRadius: 12,
    height: 300,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  barChartPlaceholder: {
    color: "#777",
    fontSize: 12,
  },
  cardContainer: {
    flexDirection: "row",
    gap: 20,
    justifyContent: "space-between",
    marginBottom: 20,
  },
  card: {
    flex: 1,
    borderRadius: 16,
    padding: 12,
    height: 200,
    position: "relative",
  },
  purple: {
    backgroundColor: "#7593CE",
  },
  orange: {
    backgroundColor: "#B8D0FF",
  },
  cardIllustration: {
    width: 77,
    height: 77,
    position: "absolute",
    top: 16,
    right: 16,
  },
  cardTitle: {
    fontWeight: "bold",
    fontSize: 20,
    color: "white",
    position: "absolute",
    bottom: 45,
    left: 20,
  },
  cardTitleT: {
    fontWeight: "bold",
    fontSize: 20,
    color: "#3F414E",
    position: "absolute",
    bottom: 45,
    left: 20,
  },
  cardSubtitle: {
    fontSize: 10,
    color: "white",
    position: "absolute",
    bottom: 27,
    left: 20,
  },
  cardSubtitleT: {
    fontSize: 10,
    color: "#524F53",
    position: "absolute",
    bottom: 27,
    left: 20,
  },
  challengeBox: {
    backgroundColor: "#333242",
    borderRadius: 16,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    paddingLeft: 70,
    gap: 110,
  },
  challengeOwl: {
    width: 77,
    height: 77,
  },
  challengeTexts: {
    flex: 1,
  },
  challengeTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    right: 25,
  },
  challengeSubtitle: {
    fontSize: 11,
    color: "#ccc",
    marginTop: 10,
    fontWeight: "bold",
    right: 25,
  },
  startSleepingBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#3f78ff",
    borderRadius: 30,
    paddingVertical: 15,
    paddingHorizontal: 30,
    alignSelf: "center",
    gap: 8,
  },
  sleepingIcon: {
    width: 18,
    height: 18,
  },
  startSleepingText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
  },
});

export default HomeScreen;
