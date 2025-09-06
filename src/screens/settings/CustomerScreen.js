import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Modal,
  ScrollView,
  Image,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

const FAQ_DATA = [
    {
    question: "수면 기록은 어떻게 작동하나요?",
    answer:
      "사용자가 수면모드를 시작하고 종료하면 자동으로 수면 시간이 기록돼요.\n또는 직접 취침 시간과 기상 시간을 입력할 수도 있어요.",
  },
  {
    question: "수면모드는 어떤 기능인가요?",
    answer:
      "수면모드는 수면 시간 기록, 분석, 알람 제공 등 숙면을 도와주는 다양한 기능을 제공합니다.",
  },
  {
    question: "앱이 내 수면 패턴을 분석해주나요?",
    answer:
      "네, 앱이 기록된 수면 데이터를 바탕으로 다양한 수면 패턴을 분석해 그래프로 확인할 수 있습니다.",
  },
  {
    question: "고민 날리기 기능은 어떤 건가요?",
    answer:
      "고민이나 스트레스를 간단히 텍스트로 남기면 날려보낼 수 있는 감정 정리 기능입니다.",
  },
  {
    question: "수면에 도움 되는 팁이나 콘텐츠도 제공되나요?",
    answer:
      "수면 개선 팁, 전문가 칼럼, 명상 콘텐츠 등 다양한 수면 도움 자료를 제공합니다.",
  },
  {
    question: "데이터를 백업하거나 복원할 수 있나요?",
    answer:
      "설정 메뉴에서 데이터 백업 및 복원 기능을 제공하므로 소중한 데이터를 안전하게 관리할 수 있습니다.",
  },
];

export default function CustomerScreen({ navigation }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);

  const handleFaqPress = idx => {
    setActiveFaq(idx);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setActiveFaq(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="chevron-back" size={26} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>고객센터</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <Text style={styles.faqTitle}>FAQ</Text>
        <View style={styles.listContainer}>
          {FAQ_DATA.map((item, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.faqRow}
              activeOpacity={0.8}
              onPress={() => handleFaqPress(idx)}
            >
              <Image
                source={{ uri: "https://i.ibb.co/LzVnRFHn/wpf-ask-question.png" }}
                style={styles.faqIcon}
              />
              <Text style={styles.faqQuestion}>{item.question}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.divider} />

        <View style={styles.listContainer}>
          <TouchableOpacity
            style={styles.menuRow}
            activeOpacity={0.7}
            onPress={() => navigation.navigate("서비스 이용 문의")}
          >
            <Text style={styles.menuText}>서비스 이용 문의</Text>
            <Image
              source={{ uri: "https://i.ibb.co/60229hwt/Arrow.png" }}
              style={styles.menuArrowIcon}
            />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.menuRow}
            activeOpacity={0.7}
            onPress={() => navigation.navigate("문의 내역")}
          >
            <Text style={styles.menuText}>문의 내역</Text>
            <Image
              source={{ uri: "https://i.ibb.co/60229hwt/Arrow.png" }}
              style={styles.menuArrowIcon}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuRow}
            activeOpacity={0.7}
            onPress={() => navigation.navigate("광고 문의")}
          >
            <Text style={styles.menuText}>광고 문의</Text>
            <Image
              source={{ uri: "https://i.ibb.co/60229hwt/Arrow.png" }}
              style={styles.menuArrowIcon}
            />
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={handleCloseModal}
              hitSlop={{ top: 10, bottom: 10, left: 20, right: 20 }}
            >
              <Icon name="close" size={24} color="#000" />
            </TouchableOpacity>
            {activeFaq !== null && (
              <>
                <Text style={styles.modalTitle}>
                  {FAQ_DATA[activeFaq].question}
                </Text>
                <Text style={styles.modalAnswer}>{FAQ_DATA[activeFaq].answer}</Text>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    paddingTop: 36,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    marginBottom: 20,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 19,
    fontWeight: "bold",
    marginLeft: 10,
  },
  faqTitle: {
    color: "#2082ff",
    fontSize: 22,
    fontWeight: "bold",
    marginLeft: 18,
    marginBottom: 16,
  },
  listContainer: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(222, 222, 222, 1)',
  },
  faqRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 18, 
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(222, 222, 222, 1)',
  },
  faqIcon: {
    width: 20,
    height: 20,
    marginRight: 12,
  },
  faqQuestion: {
    color: "#fff",
    fontSize: 15.5,
    flex: 1,
    flexWrap: "wrap",
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 18,
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(222, 222, 222, 1)',
  },
  menuText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "500",
  },
  menuArrowIcon: {
    width: 18,
    height: 18,
    tintColor: '#fff',
  },
  divider: {
    height: 25,
    backgroundColor: '#222',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "#0008",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    padding: 24,
    minHeight: "33%",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
    alignItems: "flex-start",
  },
  modalCloseBtn: {
    position: "absolute",
    top: 12,
    right: 12,
    zIndex: 10,
    padding: 8,
  },
  modalTitle: {
    color: "#2082ff",
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 18,
    marginTop: 20,
  },
  modalAnswer: {
    color: "#333",
    fontSize: 15,
    lineHeight: 21,
  },
});