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
  ScrollView,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";

import API_BASE_URL from "../../config";

export default function ServiceInquiryScreen({ navigation }) {
  const [consent, setConsent] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [attachedFiles, setAttachedFiles] = useState([]); // 첨부 파일 배열

  const [toast, setToast] = useState({
    visible: false,
    type: "",
    title: "",
    message: "",
  });

  const showToast = (type, title, message) => {
    setToast({ visible: true, type, title, message });
    setTimeout(() => setToast({ ...toast, visible: false }), 1500);
  };

  // 파일 선택 함수
  const pickImage = async () => {
    // 권한 요청
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      Alert.alert("권한 필요", "사진 라이브러리 접근 권한이 필요합니다.");
      return;
    }

    // 이미지 선택
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: false,
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const selectedFile = result.assets[0];

      // 파일 크기 제한 (예: 10MB)
      const maxSize = 10 * 1024 * 1024;
      if (selectedFile.fileSize && selectedFile.fileSize > maxSize) {
        showToast(
          "error",
          "파일 크기 초과",
          "10MB 이하의 파일만 첨부 가능합니다."
        );
        return;
      }

      // 최대 파일 개수 제한 (예: 5개)
      if (attachedFiles.length >= 5) {
        showToast("error", "파일 개수 초과", "최대 5개까지 첨부 가능합니다.");
        return;
      }

      setAttachedFiles([...attachedFiles, selectedFile]);
    }
  };

  // 파일 삭제 함수
  const removeFile = (index) => {
    const newFiles = attachedFiles.filter((_, i) => i !== index);
    setAttachedFiles(newFiles);
  };

  // 제출 함수: 파일 포함하여 전송
  const handleSubmit = async () => {
    if (!title || !content || !email || !name) {
      showToast(
        "error",
        "필수 정보를 모두 입력해주세요.",
        "제목, 내용, 이메일, 성함을 확인하세요."
      );
      return;
    }

    if (!consent) {
      showToast(
        "error",
        "개인정보 수집 및 이용을 선택해주세요.",
        "이메일로 문의 답변이 불가해집니다."
      );
      return;
    }

    try {
      // FormData 생성
      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", content);
      formData.append("email", email);
      formData.append("userName", name);
      formData.append("status", "답변 대기");

      // 첨부 파일 추가
      attachedFiles.forEach((file, index) => {
        const fileUri = file.uri;
        const fileName = file.fileName || `file_${index}.jpg`;
        const fileType = file.type || "image/jpeg";

        formData.append("files", {
          uri: fileUri,
          name: fileName,
          type: fileType,
        });
      });

      // API 요청
      const response = await fetch(API_BASE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "multipart/form-data",
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("문의 접수 실패: " + response.status);
      }

      const result = await response.json();
      console.log("서버 응답:", result);

      showToast(
        "success",
        "문의가 접수되었습니다!",
        "이메일로 답변 드릴 예정입니다."
      );

      setTimeout(() => {
        setTitle("");
        setContent("");
        setEmail("");
        setName("");
        setConsent(false);
        setAttachedFiles([]);
        navigation.navigate("문의 내역");
      }, 2000);
    } catch (error) {
      console.error("문의 접수 중 오류:", error);
      showToast("error", "문의 접수 실패", "네트워크 연결을 확인해주세요.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="chevron-back" size={26} color="#fff" marginTop={10} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { marginTop: 10 }]}>문의하기</Text>
        </View>

        <ScrollView style={styles.body}>
          <Text style={styles.label}>제목</Text>
          <TextInput
            style={styles.input}
            placeholder="문의하실 내용을 요약해 주세요"
            placeholderTextColor="#888"
            value={title}
            onChangeText={setTitle}
          />

          <Text style={styles.label}>내용</Text>
          <TextInput
            style={styles.textarea}
            multiline
            numberOfLines={6}
            placeholder="문의하실 내용을 상세히 입력해 주세요"
            placeholderTextColor="#888"
            value={content}
            onChangeText={setContent}
          />

          <Text style={styles.label}>파일 첨부</Text>
          <TouchableOpacity
            style={styles.fileBtn}
            activeOpacity={0.7}
            onPress={pickImage}
          >
            <Ionicons 
              name="camera-outline" // 또는 "camera"
              size={20} // width/height: 20
              color="#ccc" // tintColor가 없으므로 원하는 색상으로 지정 (예: #ccc)
              style={{ marginTop: 1 }} // marginTop: 1
            />
            <Text style={styles.fileBtnText}>파일 선택</Text>
          </TouchableOpacity>

          {/* 첨부된 파일 목록 표시 */}
          {attachedFiles.length > 0 && (
            <View style={styles.fileList}>
              {attachedFiles.map((file, index) => (
                <View key={index} style={styles.fileItem}>
                  <Image
                    source={{ uri: file.uri }}
                    style={styles.filePreview}
                  />
                  <Text style={styles.fileName} numberOfLines={1}>
                    {file.fileName || `파일 ${index + 1}`}
                  </Text>
                  <TouchableOpacity
                    onPress={() => removeFile(index)}
                    style={styles.removeBtn}
                  >
                    <Icon name="close-circle" size={22} color="#ff4444" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          <TextInput
            style={styles.input}
            placeholder="연락처를 이메일"
            placeholderTextColor="#888"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            style={styles.input}
            placeholder="이용자 성함"
            placeholderTextColor="#888"
            value={name}
            onChangeText={setName}
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
              문의 처리 안내를 위해 이메일, 문의 내용에 포함된 개인정보를
              수집하며, 개인정보처리방침에 따라 접수 완료 후 폐기됩니다.{"\n"}
              개인정보 수집 및 이용을 거부할 수 있으며, 거부할 경우 문의가
              불가합니다.
            </Text>
          </View>

          <TouchableOpacity
            style={styles.submitBtn}
            activeOpacity={0.7}
            onPress={handleSubmit}
          >
            <Text style={styles.submitBtnText}>문의 접수하기</Text>
          </TouchableOpacity>
        </ScrollView>

        <Modal visible={toast.visible} transparent animationType="fade">
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
    fontSize: 15,
  },
  fileList: {
    marginBottom: 12,
  },
  fileItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#232324",
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  filePreview: {
    width: 50,
    height: 50,
    borderRadius: 6,
    marginRight: 12,
  },
  fileName: {
    flex: 1,
    color: "#fff",
    fontSize: 14,
  },
  removeBtn: {
    padding: 4,
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
