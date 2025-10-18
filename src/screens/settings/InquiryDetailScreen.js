import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Image,
  Modal,
  Dimensions,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { SERVER_BASE_URL } from "../../config";

const { width } = Dimensions.get("window");

export default function InquiryDetailScreen({ navigation, route }) {
  // 이전 화면에서 전달받은 문의 데이터
  const { inquiryData } = route.params || {};

  // 이미지 확대 모달 상태
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageModalVisible, setImageModalVisible] = useState(false);

  // 이미지 클릭 시 확대 보기
  const openImageModal = (imageUri) => {
    setSelectedImage(imageUri);
    setImageModalVisible(true);
  };

  // 이미지 URL 생성
  const getImageUrl = (path) => {
    return `${SERVER_BASE_URL}${path}`;
  };

  // 데이터가 없는 경우를 대비한 가드
  if (!inquiryData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="chevron-back" size={26} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>문의 상세</Text>
        </View>
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>문의 정보를 불러올 수 없습니다.</Text>
        </View>
      </SafeAreaView>
    );
  }

  // 상태에 따른 스타일 정의
  const getStatusStyle = (status) => {
    switch (status) {
      case "답변 대기":
        return { color: "#ff5722" };
      case "처리 중":
        return { color: "#ffc107" };
      case "답변 완료":
        return { color: "#4caf50" };
      default:
        return { color: "#aaa" };
    }
  };

  // 답변 완료 여부 확인
  const isAnswered =
    inquiryData.status === "답변 완료" && inquiryData.answerContent;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="chevron-back" size={26} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>문의 상세</Text>
      </View>

      <ScrollView
        style={styles.body}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* === 1. 문의 기본 정보 === */}
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>접수 번호:</Text>
          <Text style={styles.infoText}>
            {inquiryData._id?.slice(-8) || "N/A"}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>문의자:</Text>
          <Text style={styles.infoText}>{inquiryData.userName || "N/A"}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>접수일:</Text>
          <Text style={styles.infoText}>
            {new Date(inquiryData.createdAt).toLocaleDateString() || "N/A"}
          </Text>
        </View>
        <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
          <Text style={styles.infoLabel}>현재 상태:</Text>
          <Text style={[styles.infoText, getStatusStyle(inquiryData.status)]}>
            {inquiryData.status}
          </Text>
        </View>

        {/* === 2. 문의 원문 (제목 및 내용) === */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>
            제목: {inquiryData.title || "제목 없음"}
          </Text>
          <Text style={styles.content}>
            {inquiryData.content || "상세 내용을 불러올 수 없습니다."}
          </Text>
        </View>

        {/* === 첨부 파일 표시 === */}
        {inquiryData?.attachments && inquiryData.attachments.length > 0 && (
          <View style={styles.attachmentSection}>
            <Text style={styles.attachmentTitle}>
              첨부 파일 ({inquiryData.attachments.length}개)
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.attachmentList}>
                {inquiryData.attachments.map((attachment, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.attachmentItem}
                    onPress={() => openImageModal(getImageUrl(attachment))}
                    activeOpacity={0.8}
                  >
                    <Image
                      source={{ uri: getImageUrl(attachment) }}
                      style={styles.attachmentImage}
                      resizeMode="cover"
                    />
                    <View style={styles.attachmentOverlay}>
                      <Icon name="expand-outline" size={20} color="#fff" />
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        {/* === 3. 관리자 답변 영역 (답변 완료 시) === */}
        {isAnswered && (
          <View style={styles.answerCard}>
            <Text style={styles.answerHeader}>🧑‍💻 관리자 답변</Text>
            <Text style={styles.answerContent}>
              {inquiryData.answerContent}
            </Text>
            <Text style={styles.answerDate}>
              답변일: {new Date(inquiryData.updatedAt).toLocaleDateString()}
            </Text>
          </View>
        )}

        {!isAnswered && inquiryData.status !== "답변 대기" && (
          <View style={styles.pendingBox}>
            <Text style={styles.pendingText}>
              현재 문의가 처리 중입니다. 답변이 곧 도착할 예정입니다.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* 이미지 확대 모달 */}
      <Modal
        visible={imageModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setImageModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.modalCloseArea}
            activeOpacity={1}
            onPress={() => setImageModalVisible(false)}
          >
            <View style={styles.modalHeader}>
              <TouchableOpacity
                onPress={() => setImageModalVisible(false)}
                style={styles.modalCloseBtn}
              >
                <Icon name="close" size={32} color="#fff" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalImageContainer}>
              <Image
                source={{ uri: selectedImage }}
                style={styles.modalImage}
                resizeMode="contain"
              />
            </View>
          </TouchableOpacity>
        </View>
      </Modal>
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
    marginBottom: 5,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 19,
    fontWeight: "bold",
    marginLeft: 12,
  },
  body: {
    flex: 1,
    paddingHorizontal: 18,
  },
  noDataContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noDataText: {
    color: "#92a8c6",
    fontSize: 16,
  },
  infoRow: {
    flexDirection: "row",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#202125",
  },
  infoLabel: {
    color: "#92a8c6",
    width: 80,
    fontSize: 15,
  },
  infoText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  card: {
    backgroundColor: "#18191b",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1.2,
    borderColor: "#1c2c43",
    marginTop: 20,
    marginBottom: 15,
  },
  cardHeader: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#252629",
  },
  content: {
    color: "#d4e0f0",
    fontSize: 15,
    lineHeight: 22,
  },
  // 첨부 파일 스타일
  attachmentSection: {
    marginBottom: 15,
  },
  attachmentTitle: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 10,
  },
  attachmentList: {
    flexDirection: "row",
    paddingVertical: 5,
  },
  attachmentItem: {
    marginRight: 10,
    borderRadius: 10,
    overflow: "hidden",
    position: "relative",
  },
  attachmentImage: {
    width: 100,
    height: 100,
    backgroundColor: "#232324",
  },
  attachmentOverlay: {
    position: "absolute",
    bottom: 5,
    right: 5,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 15,
    padding: 4,
  },
  // 관리자 답변 스타일
  answerCard: {
    backgroundColor: "#18191b",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1.2,
    borderColor: "#4caf50",
    marginTop: 15,
  },
  answerHeader: {
    color: "#4caf50",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#252629",
  },
  answerContent: {
    color: "#d4e0f0",
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 10,
  },
  answerDate: {
    color: "#92a8c6",
    fontSize: 13,
    textAlign: "right",
  },
  pendingBox: {
    backgroundColor: "#1c2c43",
    padding: 15,
    borderRadius: 10,
    marginTop: 15,
  },
  pendingText: {
    color: "#92a8c6",
    fontSize: 15,
    textAlign: "center",
  },
  // 모달 스타일
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.95)",
  },
  modalCloseArea: {
    flex: 1,
  },
  modalHeader: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    alignItems: "flex-end",
  },
  modalCloseBtn: {
    padding: 5,
  },
  modalImageContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalImage: {
    width: width - 40,
    height: "80%",
  },
});
