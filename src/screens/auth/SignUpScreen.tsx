// src/screens/auth/SignUpScreen.tsx
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import {
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  ActivityIndicator,
} from "react-native";

const googleImage = require("../../../assets/google.png");

const { width, height } = Dimensions.get("window");

interface FormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  age: string;
  phoneNumber: string;
}

function SignUpScreen({ navigation }: { navigation: any }) {
  const { signUp } = useAuth(); // ✅ AuthContext에서 가져오기
  const [loading, setLoading] = useState(false); // ✅ 로딩 상태 추가

  const [formData, setFormData] = useState<FormData>({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    age: "",
    phoneNumber: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [privacyChecked, setPrivacyChecked] = useState(false);
  const [privacyModalVisible, setPrivacyModalVisible] = useState(false);
  const [selectedGender, setSelectedGender] = useState("");

  const validatePassword = (password: string) => {
    const minLength = password.length >= 8;
    const maxLength = password.length <= 20;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return {
      minLength,
      maxLength,
      hasUpperCase,
      hasLowerCase,
      hasNumbers,
      hasSpecialChar,
      isValid:
        minLength &&
        maxLength &&
        hasUpperCase &&
        hasLowerCase &&
        hasNumbers &&
        hasSpecialChar,
    };
  };

  const passwordsMatch =
    formData.password === formData.confirmPassword &&
    formData.confirmPassword !== "";

  const passwordValidation = validatePassword(formData.password);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // ✅ 회원가입 처리 함수 (Firebase 연동)
  const handleGetStarted = async () => {
    if (!isFormValid) return;

    setLoading(true);

    try {
      // ✅ AuthContext의 signUp 사용 (더미 데이터 자동 생성 포함)
      await signUp(formData.email, formData.password, {
        username: formData.username,
        age: formData.age,
        gender: selectedGender,
        phoneNumber: formData.phoneNumber,
      });

      Alert.alert(
        "회원가입 완료!",
        "환영합니다. 굿드림과 함께 좋은 꿈 꾸세요.",
        [{ text: "확인" }]
      );

      // ✅ AuthContext가 자동으로 MainStack으로 전환
    } catch (error: any) {
      let errorMessage = "회원가입에 실패했습니다";

      if (error.code === "auth/email-already-in-use") {
        errorMessage = "이미 사용 중인 이메일입니다";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "올바른 이메일 형식이 아닙니다";
      } else if (error.code === "auth/weak-password") {
        errorMessage = "비밀번호가 너무 약합니다 (최소 6자 이상)";
      }

      Alert.alert("회원가입 실패", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const isFormValid =
    privacyChecked &&
    passwordValidation.isValid &&
    passwordsMatch &&
    formData.username.trim() !== "" &&
    formData.email.trim() !== "";

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          accessibilityLabel="뒤로 가기"
        >
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create your account</Text>
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.socialButtons}>
            <TouchableOpacity style={styles.googleBtn} activeOpacity={0.8}>
              <Image source={googleImage} style={styles.socialIcon} />
              <Text style={styles.socialBtnText}>CONTINUE WITH GOOGLE</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR SIGN UP WITH EMAIL</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Username"
              placeholderTextColor="#666"
              autoCapitalize="none"
              returnKeyType="next"
              value={formData.username}
              onChangeText={(value) => handleInputChange("username", value)}
            />

            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#666"
              keyboardType="email-address"
              autoCapitalize="none"
              returnKeyType="next"
              value={formData.email}
              onChangeText={(value) => handleInputChange("email", value)}
            />

            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Password"
                placeholderTextColor="#666"
                secureTextEntry={!showPassword}
                returnKeyType="next"
                value={formData.password}
                onChangeText={(value) => handleInputChange("password", value)}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={showPassword ? "eye" : "eye-off"}
                  size={20}
                  color="#666"
                />
              </TouchableOpacity>
            </View>

            {formData.password !== "" && (
              <View style={styles.passwordRequirements}>
                <Text style={styles.requirementsTitle}>
                  Password Requirements:
                </Text>
                <View style={styles.requirementsList}>
                  <View style={styles.requirementItem}>
                    <Ionicons
                      name={
                        passwordValidation.minLength
                          ? "checkmark-circle"
                          : "close-circle"
                      }
                      size={16}
                      color={
                        passwordValidation.minLength ? "#4CAF50" : "#F44336"
                      }
                    />
                    <Text
                      style={[
                        styles.requirementText,
                        {
                          color: passwordValidation.minLength
                            ? "#4CAF50"
                            : "#F44336",
                        },
                      ]}
                    >
                      At least 8 characters
                    </Text>
                  </View>
                  <View style={styles.requirementItem}>
                    <Ionicons
                      name={
                        passwordValidation.maxLength
                          ? "checkmark-circle"
                          : "close-circle"
                      }
                      size={16}
                      color={
                        passwordValidation.maxLength ? "#4CAF50" : "#F44336"
                      }
                    />
                    <Text
                      style={[
                        styles.requirementText,
                        {
                          color: passwordValidation.maxLength
                            ? "#4CAF50"
                            : "#F44336",
                        },
                      ]}
                    >
                      Maximum 20 characters
                    </Text>
                  </View>
                  <View style={styles.requirementItem}>
                    <Ionicons
                      name={
                        passwordValidation.hasUpperCase
                          ? "checkmark-circle"
                          : "close-circle"
                      }
                      size={16}
                      color={
                        passwordValidation.hasUpperCase ? "#4CAF50" : "#F44336"
                      }
                    />
                    <Text
                      style={[
                        styles.requirementText,
                        {
                          color: passwordValidation.hasUpperCase
                            ? "#4CAF50"
                            : "#F44336",
                        },
                      ]}
                    >
                      Uppercase letter (A-Z)
                    </Text>
                  </View>
                  <View style={styles.requirementItem}>
                    <Ionicons
                      name={
                        passwordValidation.hasLowerCase
                          ? "checkmark-circle"
                          : "close-circle"
                      }
                      size={16}
                      color={
                        passwordValidation.hasLowerCase ? "#4CAF50" : "#F44336"
                      }
                    />
                    <Text
                      style={[
                        styles.requirementText,
                        {
                          color: passwordValidation.hasLowerCase
                            ? "#4CAF50"
                            : "#F44336",
                        },
                      ]}
                    >
                      Lowercase letter (a-z)
                    </Text>
                  </View>
                  <View style={styles.requirementItem}>
                    <Ionicons
                      name={
                        passwordValidation.hasNumbers
                          ? "checkmark-circle"
                          : "close-circle"
                      }
                      size={16}
                      color={
                        passwordValidation.hasNumbers ? "#4CAF50" : "#F44336"
                      }
                    />
                    <Text
                      style={[
                        styles.requirementText,
                        {
                          color: passwordValidation.hasNumbers
                            ? "#4CAF50"
                            : "#F44336",
                        },
                      ]}
                    >
                      Number (0-9)
                    </Text>
                  </View>
                  <View style={styles.requirementItem}>
                    <Ionicons
                      name={
                        passwordValidation.hasSpecialChar
                          ? "checkmark-circle"
                          : "close-circle"
                      }
                      size={16}
                      color={
                        passwordValidation.hasSpecialChar
                          ? "#4CAF50"
                          : "#F44336"
                      }
                    />
                    <Text
                      style={[
                        styles.requirementText,
                        {
                          color: passwordValidation.hasSpecialChar
                            ? "#4CAF50"
                            : "#F44336",
                        },
                      ]}
                    >
                      Special character (!@#$%^&*)
                    </Text>
                  </View>
                </View>
              </View>
            )}

            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Confirm Password"
                placeholderTextColor="#666"
                secureTextEntry={!showConfirmPassword}
                returnKeyType="next"
                value={formData.confirmPassword}
                onChangeText={(value) =>
                  handleInputChange("confirmPassword", value)
                }
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={showConfirmPassword ? "eye" : "eye-off"}
                  size={20}
                  color="#666"
                />
              </TouchableOpacity>
            </View>

            {formData.confirmPassword !== "" && (
              <View style={styles.passwordMatchContainer}>
                <Ionicons
                  name={passwordsMatch ? "checkmark-circle" : "close-circle"}
                  size={16}
                  color={passwordsMatch ? "#4CAF50" : "#F44336"}
                />
                <Text
                  style={[
                    styles.passwordMatchText,
                    { color: passwordsMatch ? "#4CAF50" : "#F44336" },
                  ]}
                >
                  {passwordsMatch
                    ? "Passwords match"
                    : "Passwords do not match"}
                </Text>
              </View>
            )}

            <Text style={styles.sectionTitle}>Additional Information</Text>

            <TextInput
              style={styles.input}
              placeholder="Age"
              placeholderTextColor="#666"
              keyboardType="numeric"
              returnKeyType="next"
              maxLength={2}
              value={formData.age}
              onChangeText={(value) => handleInputChange("age", value)}
            />

            <Text style={styles.fieldLabel}>Gender</Text>
            <View style={styles.genderContainer}>
              <TouchableOpacity
                style={[
                  styles.genderButton,
                  selectedGender === "male" && styles.genderButtonSelected,
                ]}
                onPress={() => setSelectedGender("male")}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.genderButtonText,
                    selectedGender === "male" &&
                      styles.genderButtonTextSelected,
                  ]}
                >
                  Male
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.genderButton,
                  selectedGender === "female" && styles.genderButtonSelected,
                ]}
                onPress={() => setSelectedGender("female")}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.genderButtonText,
                    selectedGender === "female" &&
                      styles.genderButtonTextSelected,
                  ]}
                >
                  Female
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.genderButton,
                  selectedGender === "other" && styles.genderButtonSelected,
                ]}
                onPress={() => setSelectedGender("other")}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.genderButtonText,
                    selectedGender === "other" &&
                      styles.genderButtonTextSelected,
                  ]}
                >
                  Other
                </Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Phone Number (Optional)"
              placeholderTextColor="#666"
              keyboardType="phone-pad"
              returnKeyType="done"
              value={formData.phoneNumber}
              onChangeText={(value) => handleInputChange("phoneNumber", value)}
            />

            <TouchableOpacity
              style={styles.privacyCheckbox}
              activeOpacity={0.7}
              onPress={() => setPrivacyChecked(!privacyChecked)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: privacyChecked }}
            >
              <View
                style={[
                  styles.checkbox,
                  privacyChecked && styles.checkboxChecked,
                ]}
              >
                {privacyChecked && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.checkboxText}>
                I have read the{" "}
                <Text
                  style={styles.privacyLink}
                  onPress={() => setPrivacyModalVisible(true)}
                >
                  Privacy Policy
                </Text>
              </Text>
            </TouchableOpacity>

            {/* ✅ 로딩 상태 추가된 버튼 */}
            <TouchableOpacity
              style={[
                styles.submitBtn,
                (!isFormValid || loading) && styles.submitBtnDisabled,
              ]}
              activeOpacity={isFormValid && !loading ? 0.8 : 1}
              onPress={handleGetStarted}
              disabled={!isFormValid || loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text
                  style={[
                    styles.submitBtnText,
                    !isFormValid && styles.submitBtnTextDisabled,
                  ]}
                >
                  GET STARTED
                </Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.loginRedirectContainer}>
            <Text style={styles.loginRedirectText}>
              ALREADY HAVE AN ACCOUNT?{" "}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
              <Text style={styles.loginRedirectBtn}>LOG IN</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Privacy Policy Modal */}
      <Modal
        visible={privacyModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setPrivacyModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Privacy Policy</Text>
            <ScrollView style={styles.modalScroll}>
              <Text style={styles.modalText}>
                여기에 개인정보 처리방침 내용이 들어갑니다...
              </Text>
            </ScrollView>
            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setPrivacyModalVisible(false)}
            >
              <Text style={styles.modalCloseBtnText}>닫기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#181820",
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: height < 700 ? 12 : 20,
    backgroundColor: "#181820",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  backButton: {
    position: "absolute",
    left: 15,
    padding: 8,
    borderRadius: 20,
    minHeight: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: width < 480 ? 20 : 24,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
  },
  content: {
    flexGrow: 1,
    width: "100%",
    maxWidth: 400,
    alignSelf: "center",
    paddingHorizontal: 20,
    paddingTop: height < 700 ? 80 : 100,
    paddingBottom: 40,
    justifyContent: "flex-start",
  },
  socialButtons: {
    marginBottom: 5,
    marginTop: 0,
  },
  googleBtn: {
    backgroundColor: "#2a2a2a",
    borderColor: "#444",
    borderWidth: 1,
    borderRadius: 25,
    width: "100%",
    paddingVertical: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    minHeight: 44,
    shadowColor: "#2a2a2a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  socialBtnText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
    textTransform: "uppercase",
  },
  socialIcon: {
    width: 16,
    height: 16,
    resizeMode: "contain",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: height < 700 ? 20 : 30,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#333",
    width: width < 480 ? 80 : 100,
  },
  dividerText: {
    fontSize: 12,
    color: "#888",
    marginHorizontal: 15,
    textAlign: "center",
  },
  form: {
    width: "100%",
    gap: 12,
  },
  input: {
    width: "100%",
    padding: 15,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#333",
    backgroundColor: "#1a1a1a",
    color: "white",
    fontSize: 14,
    minHeight: 44,
  },
  passwordContainer: {
    position: "relative",
    width: "100%",
  },
  passwordInput: {
    width: "100%",
    padding: 15,
    paddingRight: 50,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#333",
    backgroundColor: "#1a1a1a",
    color: "white",
    fontSize: 14,
    minHeight: 44,
  },
  eyeButton: {
    position: "absolute",
    right: 15,
    top: "50%",
    transform: [{ translateY: -10 }],
    padding: 5,
  },
  passwordRequirements: {
    marginTop: 8,
    marginBottom: 8,
    padding: 12,
    backgroundColor: "#1a1a1a",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#333",
  },
  requirementsTitle: {
    fontSize: 12,
    color: "#ccc",
    fontWeight: "600",
    marginBottom: 8,
  },
  requirementsList: {
    gap: 4,
  },
  requirementItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  requirementText: {
    fontSize: 11,
    fontWeight: "500",
  },
  passwordMatchContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
    marginBottom: 8,
  },
  passwordMatchText: {
    fontSize: 12,
    fontWeight: "500",
  },
  privacyCheckbox: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 10,
    marginBottom: 0,
    paddingRight: 10,
    minHeight: 44,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#4285f4",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
    backgroundColor: "transparent",
  },
  checkboxChecked: {
    backgroundColor: "#4285f4",
  },
  checkmark: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
  checkboxText: {
    flex: 1,
    fontSize: 12,
    color: "#888",
    lineHeight: 18,
    textAlign: "left",
  },
  privacyLink: {
    color: "#4285f4",
    fontSize: 12,
    textDecorationLine: "underline",
    fontWeight: "600",
  },
  submitBtn: {
    backgroundColor: "#4285f4",
    paddingVertical: 15,
    width: "100%",
    borderRadius: 25,
    marginTop: 0,
    marginBottom: 20,
    alignItems: "center",
    minHeight: 44,
    shadowColor: "#4285f4",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  submitBtnDisabled: {
    backgroundColor: "#333",
    shadowOpacity: 0,
    elevation: 0,
  },
  submitBtnText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
    textTransform: "uppercase",
  },
  submitBtnTextDisabled: {
    color: "#666",
  },
  loginRedirectContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 0,
    marginBottom: 20,
  },
  loginRedirectText: {
    fontSize: 12,
    color: "#888",
  },
  loginRedirectBtn: {
    color: "#4285f4",
    fontSize: 12,
    fontWeight: "600",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 5,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4285f4",
    marginTop: 20,
    marginBottom: 12,
    textAlign: "left",
  },
  fieldLabel: {
    fontSize: 14,
    color: "#ccc",
    marginBottom: 8,
    marginTop: 4,
  },
  genderContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    gap: 8,
  },
  genderButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#333",
    backgroundColor: "#1a1a1a",
    alignItems: "center",
    minHeight: 44,
  },
  genderButtonSelected: {
    backgroundColor: "#4285f4",
    borderColor: "#4285f4",
  },
  genderButtonText: {
    color: "#888",
    fontSize: 14,
    fontWeight: "500",
  },
  genderButtonTextSelected: {
    color: "white",
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#1a1a1a",
    borderRadius: 20,
    padding: 20,
    width: "90%",
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    marginBottom: 15,
  },
  modalScroll: {
    maxHeight: 400,
  },
  modalText: {
    color: "#ccc",
    fontSize: 14,
    lineHeight: 20,
  },
  modalCloseBtn: {
    backgroundColor: "#4285f4",
    padding: 12,
    borderRadius: 10,
    marginTop: 15,
    alignItems: "center",
  },
  modalCloseBtnText: {
    color: "white",
    fontWeight: "600",
  },
});

export default SignUpScreen;
