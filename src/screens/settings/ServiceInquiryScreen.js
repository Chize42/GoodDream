import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Image,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

export default function ServiceInquiryScreen({ navigation }) {
  const [consent, setConsent] = useState(false);
  const [toast, setToast] = useState({ visible: false, type: "", title: "", message: "" });

  const showToast = (type, title, message) => {
    setToast({ visible: true, type, title, message });
    setTimeout(() => setToast({ ...toast, visible: false }), 1500);
  };

  const handleSubmit = () => {
    if (!consent) {
      showToast("error", "개인정보 수집 및 이용을 선택해주세요.", "이메일로 문의 답변이 불가해집니다.");
      return;
    }
    showToast("success", "문의가 접수되었습니다!", "이메일로 문의 답변을 드릴 예정입니다.");
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="chevron-back" size={26} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>문의하기</Text>
        </View>

        <View style={styles.body}>
          <Text style={styles.label}>내용</Text>
          <TextInput
            style={styles.textarea}
            multiline
            numberOfLines={6}
            placeholder="문의하실 내용을 입력해 주세요"
            placeholderTextColor="#888"
          />

          <Text style={styles.label}>파일 첨부</Text>
          <TouchableOpacity style={styles.fileBtn} activeOpacity={0.7}>
            <Image
              source={{ uri: "https://i.ibb.co/nqH4W6xW/tabler-camera.png" }}
              style={styles.attachIcon}
            />
            <Text style={styles.fileBtnText}>파일 선택</Text>
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            placeholder="연락처를 이메일"
            placeholderTextColor="#888"
          />
          <TextInput
            style={styles.input}
            placeholder="이용자 성함"
            placeholderTextColor="#888"
          />
          <TouchableOpacity
            style={styles.checkRow}
            onPress={() => setConsent(!consent)}
            activeOpacity={0.8}
          >
            <Icon
              name={consent ? "checkbox" : "square-outline"}
              size={22}
              color={consent ? "#207cff" : "#aaa"}
              style={{ marginRight: 6 }}
            />
            <Text style={styles.checkLabel}>
              개인정보 수집 및 이용 동의 (필수)
            </Text>
          </TouchableOpacity>

          <View style={styles.infoBox}>
            <Text style={styles.infoTxt}>
              문의 처리 안내를 위해 이메일, 문의 내용에 포함된 개인정보를 수집하며,
              개인정보처리방침에 따라 접수 완료 후 폐기됩니다.{"\n"}
              개인정보 수집 및 이용을 거부할 수 있으며, 거부할 경우 문의가 불가합니다.
            </Text>
          </View>

          <TouchableOpacity
            style={styles.submitBtn}
            activeOpacity={0.7}
            onPress={handleSubmit}
          >
            <Text style={styles.submitBtnText}>문의 접수하기</Text>
          </TouchableOpacity>
        </View>

        <Modal
          visible={toast.visible}
          transparent
          animationType="fade"
        >
          <View style={styles.toastBackdrop}>
            <View style={styles.toastBox}>
              <Text style={styles.toastTitle}>{toast.title}</Text>
              <Text style={styles.toastDesc}>{toast.message}</Text>
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
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
  body: {
    flex: 1,
    paddingHorizontal: 22,
    paddingBottom: 32,
  },
  label: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
    marginTop: 13,
    marginBottom: 8,
  },
  textarea: {
    backgroundColor: "#232324",
    borderRadius: 10,
    color: "#fff",
    fontSize: 15,
    padding: 18,
    minHeight: 120,
    textAlignVertical: "top",
    marginBottom: 8,
  },
  fileBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#207cff",
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: "flex-start",
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: "#207cff",
  },
  attachIcon: {
    marginTop: 1,
    width: 20,
    height: 20,
  },
  fileBtnText: { 
    color: "#ffffffff", 
    marginLeft: 8, 
    fontWeight: "600", 
    fontSize: 15 
  },
  input: {
    backgroundColor: "#232324",
    borderRadius: 10,
    color: "#fff",
    fontSize: 15,
    paddingHorizontal: 18,
    paddingVertical: 12,
    marginBottom: 8,
  },
  checkRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    marginBottom: 5,
  },
  checkLabel: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  infoBox: {
    backgroundColor: "#202125",
    borderRadius: 9,
    padding: 14,
    marginTop: 2,
    marginBottom: 18,
  },
  infoTxt: {
    color: "#bbb",
    fontSize: 14,
    lineHeight: 20,
  },
  submitBtn: {
    backgroundColor: "#207cff",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    height: 48,
    marginTop: 10,
  },
  submitBtnText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "bold",
    letterSpacing: 0.3,
  },
  toastBackdrop: {
    flex: 1,
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
  },
  toastBox: {
    minWidth: 250,
    backgroundColor: "#fff",
    borderRadius: 18,
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 7,
    elevation: 5,
  },
  toastTitle: {
    color: "#222",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 7,
    textAlign: "center",
  },
  toastDesc: {
    color: "#444",
    fontSize: 14,
    textAlign: "center",
  },
});