import React from "react";
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

const inProgressList = [
  {
    date: "2025-05-16",
    title: "홍길동님이 보낸 문의",
    desc: "문의하기 남은 제목을 남긴 공간",
    status: "진행중",
  },
  {
    date: "2025-05-16",
    title: "홍길동님이 보낸 문의",
    desc: "문의하기 남은 제목을 남긴 공간",
    status: "진행중",
  },
  {
    date: "2025-05-16",
    title: "홍길동님이 보낸 문의",
    desc: "문의하기 남은 제목을 남긴 공간",
    status: "진행중",
  },
  {
    date: "2025-05-16",
    title: "홍길동님이 보낸 문의",
    desc: "문의하기 남은 제목을 남긴 공간",
    status: "진행중",
  },
];

export default function InquiryHistoryScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="chevron-back" size={26} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>문의내역</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <Text style={styles.sectionTitle}>진행 중 문의</Text>
        {inProgressList.map((item, idx) => (
          <View key={idx} style={styles.itemBox}>
            <Text style={styles.date}>{item.date}</Text>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.desc}>{item.desc}</Text>
            <View style={styles.badgeBox}>
              <Text style={styles.badgeInProgress}>진행중</Text>
            </View>
          </View>
        ))}

        <TouchableOpacity
          style={styles.endBtn}
          activeOpacity={0.8}
          onPress={() => navigation.navigate("완료된 문의")}
        >
          <Text style={styles.endBtnText}>완료된 문의 보기</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121212" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 13,
    height: 54,
    marginBottom: 9,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 19,
    fontWeight: "bold",
    marginLeft: 12,
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "bold",
    marginLeft: 10,
    marginBottom: 12,
    marginTop: 10,
  },
  itemBox: {
    backgroundColor: "#18191b",
    borderRadius: 12,
    borderWidth: 1.2,
    borderColor: "#1c2c43",
    marginHorizontal: 15,
    marginTop: 10,
    paddingVertical: 13,
    paddingHorizontal: 15,
    position: "relative",
  },
  date: {
    color: "#92a8c6",
    fontSize: 12.5,
    marginBottom: 4,
    fontWeight: "500",
  },
  title: { 
    color: "#fff", 
    fontSize: 14.5, 
    fontWeight: "bold", 
    marginBottom: 2 
  },
  desc: { 
    color: "#a1b2c8", 
    fontSize: 13, 
    marginBottom: 7 
  },
  badgeBox: { 
    position: "absolute", 
    top: 14, right: 15 
  },
  badgeInProgress: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    backgroundColor: "#1769fa",
    color: "#fff",
    borderRadius: 13,
    fontWeight: "600",
    fontSize: 13,
  },
  endBtn: {
    backgroundColor: "#1769fa",
    borderRadius: 10,
    marginTop: 26,
    marginHorizontal: 15,
    alignItems: "center",
    justifyContent: "center",
    height: 46,
  },
  endBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 0.3,
  },
});
