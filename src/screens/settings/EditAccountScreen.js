// src/screens/settings/EditAccountScreen.js

import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Alert,
  ActivityIndicator,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../contexts/AuthContext";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../services/firebase";

export default function EditAccountScreen({ navigation, route }) {
  const { user } = useAuth();

  const currentUser = route.params?.currentUser || {
    name: "",
    age: "",
    gender: "",
    email: "",
  };

  const [info, setInfo] = useState(currentUser);
  const [editField, setEditField] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showGenderModal, setShowGenderModal] = useState(false);

  // ✅ 성별 표시 함수
  const getGenderText = (gender) => {
    if (gender === "male") return "남자";
    if (gender === "female") return "여자";
    return "미등록";
  };

  // ✅ 저장하기
  const handleSave = async () => {
    try {
      if (!user?.uid) {
        Alert.alert("오류", "로그인이 필요합니다");
        return;
      }

      if (!info.name || info.name.trim() === "") {
        Alert.alert("알림", "이름을 입력해주세요.");
        return;
      }

      // 나이 유효성 검사
      if (
        info.age &&
        (isNaN(info.age) || parseInt(info.age) < 0 || parseInt(info.age) > 150)
      ) {
        Alert.alert("알림", "올바른 나이를 입력해주세요.");
        return;
      }

      setLoading(true);

      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        username: info.name.trim(),
        age: info.age ? parseInt(info.age) : null,
        gender: info.gender || "",
      });

      console.log("✅ 사용자 정보 업데이트 완료");
      // ✅ 그냥 goBack만 하기
      navigation.goBack();

      // ✅ Toast는 AccountScreen에서 보여주기
      setTimeout(() => {
        Toast.show({
          type: "success",
          text1: "저장되었습니다!",
          position: "bottom",
          visibilityTime: 2000,
        });
      }, 300);
    } catch (error) {
      console.error("사용자 정보 업데이트 실패:", error);
      Alert.alert("오류", "정보 수정에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  // ✅ 성별 선택
  const handleGenderSelect = (gender) => {
    setInfo({ ...info, gender });
    setShowGenderModal(false);
  };

  // ✅ 일반 필드 렌더링
  const renderRow = (
    label,
    fieldKey,
    editable = true,
    keyboardType = "default"
  ) => {
    const fieldValue = info[fieldKey] || "";

    return (
      <View style={styles.infoRow}>
        <Text style={styles.label}>{label}</Text>
        <View style={styles.valueBox}>
          {editField === fieldKey ? (
            <TextInput
              style={[styles.value, styles.input]}
              value={String(fieldValue)}
              autoFocus
              keyboardType={keyboardType}
              onChangeText={(text) => setInfo({ ...info, [fieldKey]: text })}
              onBlur={() => setEditField(null)}
              placeholder={label}
              placeholderTextColor="#888"
              editable={!loading}
            />
          ) : (
            <Text style={styles.value} numberOfLines={1}>
              {fieldValue || "미등록"}
            </Text>
          )}
          {editable && (
            <TouchableOpacity
              onPress={() => setEditField(fieldKey)}
              disabled={loading}
            >
              <Image
                source={{ uri: "https://i.ibb.co/k6ms3py0/bx-pencil.png" }}
                style={styles.editIcon}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  // ✅ 성별 선택 필드 렌더링
  const renderGenderRow = () => {
    return (
      <View style={styles.infoRow}>
        <Text style={styles.label}>성별</Text>
        <View style={styles.valueBox}>
          <Text style={styles.value} numberOfLines={1}>
            {getGenderText(info.gender)}
          </Text>
          <TouchableOpacity
            onPress={() => setShowGenderModal(true)}
            disabled={loading}
          >
            <Image
              source={{ uri: "https://i.ibb.co/k6ms3py0/bx-pencil.png" }}
              style={styles.editIcon}
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#295be7" />
          <Text style={styles.loadingText}>저장 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>개인 정보</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.infoBox}>
        {renderRow("이름", "name")}
        {renderRow("나이", "age", true, "numeric")}
        {renderGenderRow()}
        {renderRow("이메일 주소", "email", false)}
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.button}
          onPress={handleSave}
          disabled={loading}
        >
          <Text style={styles.buttonText}>저장하기</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.cancelBtn]}
          onPress={handleCancel}
          disabled={loading}
        >
          <Text style={styles.buttonText}>취소하기</Text>
        </TouchableOpacity>
      </View>

      {/* ✅ 성별 선택 모달 */}
      <Modal
        visible={showGenderModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowGenderModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowGenderModal(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>성별 선택</Text>

            <TouchableOpacity
              style={[
                styles.genderOption,
                info.gender === "male" && styles.genderOptionSelected,
              ]}
              onPress={() => handleGenderSelect("male")}
            >
              <Text
                style={[
                  styles.genderOptionText,
                  info.gender === "male" && styles.genderOptionTextSelected,
                ]}
              >
                남자
              </Text>
              {info.gender === "male" && (
                <Ionicons name="checkmark" size={20} color="#295be7" />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.genderOption,
                info.gender === "female" && styles.genderOptionSelected,
              ]}
              onPress={() => handleGenderSelect("female")}
            >
              <Text
                style={[
                  styles.genderOptionText,
                  info.gender === "female" && styles.genderOptionTextSelected,
                ]}
              >
                여자
              </Text>
              {info.gender === "female" && (
                <Ionicons name="checkmark" size={20} color="#295be7" />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setShowGenderModal(false)}
            >
              <Text style={styles.modalCancelText}>취소</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111014",
    paddingHorizontal: 16,
    paddingTop: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 32,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#fff",
    marginTop: 10,
    fontSize: 16,
  },
  infoBox: {
    backgroundColor: "#222224",
    borderRadius: 10,
    padding: 20,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 18,
    justifyContent: "space-between",
  },
  label: {
    color: "#ccc",
    fontSize: 15,
    minWidth: 85,
  },
  valueBox: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    justifyContent: "flex-end",
  },
  value: {
    color: "#fff",
    fontSize: 15,
    maxWidth: 150,
  },
  input: {
    backgroundColor: "#222224",
    borderBottomWidth: 1,
    borderBottomColor: "#444",
    color: "#fff",
    minWidth: 100,
    padding: 4,
  },
  editIcon: {
    width: 16,
    height: 16,
    marginLeft: 8,
    tintColor: "#ccc",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 12,
  },
  button: {
    backgroundColor: "#295be7",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 28,
    marginHorizontal: 8,
  },
  cancelBtn: {
    backgroundColor: "#444",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },
  // ✅ 모달 스타일
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#222224",
    borderRadius: 16,
    padding: 24,
    width: "80%",
    maxWidth: 300,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 20,
    textAlign: "center",
  },
  genderOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: "#1a1a1a",
    marginBottom: 12,
  },
  genderOptionSelected: {
    backgroundColor: "#295be720",
    borderWidth: 1,
    borderColor: "#295be7",
  },
  genderOptionText: {
    fontSize: 16,
    color: "#ccc",
  },
  genderOptionTextSelected: {
    color: "#fff",
    fontWeight: "600",
  },
  modalCancelButton: {
    marginTop: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  modalCancelText: {
    color: "#999",
    fontSize: 16,
  },
});
