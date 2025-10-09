import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

// API_BASE_URL을 import 합니다.
import API_BASE_URL from '../../config'; 

export default function AdminInquiryDetailScreen({ navigation, route }) {
  // AdminInquiryDashboard에서 전달받은 문의 데이터
  const { inquiryData } = route.params || {}; 
  
  // 초기 상태 로드 (답변 내용과 현재 상태)
  const [answerContent, setAnswerContent] = useState(inquiryData?.answerContent || '');
  const [currentStatus, setCurrentStatus] = useState(inquiryData?.status || '답변 대기');
  const [loading, setLoading] = useState(false); 

  // ✨ 1. '답변 완료' 외의 상태 변경을 처리하는 함수
  const handleStatusChange = async (newStatus) => {
    // '답변 완료' 상태는 반드시 handleSubmitAnswer를 통해 처리하도록 분리
    if (newStatus === '답변 완료') {
        return Alert.alert("안내", "답변 완료 처리는 '답변 제출 및 완료 처리' 버튼을 사용해 주세요.");
    }
    
    setLoading(true); // 로딩 시작

    // 서버로 보낼 데이터: 현재 답변 내용(기존 내용)과 새로운 상태
    const submissionData = {
        answerContent: answerContent, 
        newStatus: newStatus,
    };
    
    const inquiryId = inquiryData?._id; 
    
    try {
        const response = await fetch(`${API_BASE_URL}/${inquiryId}`, { 
            method: 'PATCH', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(submissionData),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("상태 업데이트 API Error:", errorText);
            throw new Error(`상태 업데이트 서버 오류: ${response.status}`);
        }

        // 성공 응답 처리
        Alert.alert("성공", `문의 상태가 '${newStatus}'로 변경되었습니다.`);
        setCurrentStatus(newStatus); 
        
        // 대시보드로 돌아가 목록을 갱신 (새로고침 유도)
        navigation.goBack(); 

    } catch (error) {
        console.error("상태 업데이트 실패:", error);
        Alert.alert("실패", "상태 업데이트에 실패했습니다. 서버 연결을 확인하세요.");
    } finally {
        setLoading(false); // 로딩 종료
    }
  };


  // ✨ 2. '답변 제출 및 완료 처리' (답변 내용 필수) 함수
  const handleSubmitAnswer = async () => {
    // '답변 완료'는 답변 내용이 필수이므로 유효성 검사
    if (!answerContent.trim()) {
        Alert.alert("경고", "답변 내용을 입력해주세요.");
        return;
    }
    
    setLoading(true); // 로딩 시작

    // 서버로 보낼 데이터: 답변 내용과 최종 상태는 '답변 완료'
    const submissionData = {
        answerContent: answerContent,
        newStatus: '답변 완료',
    };
    
    const inquiryId = inquiryData?._id; 
    
    try {
        const response = await fetch(`${API_BASE_URL}/${inquiryId}`, { 
            method: 'PATCH', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(submissionData),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("답변 제출 API Error:", errorText);
            throw new Error(`답변 제출 서버 오류: ${response.status}`);
        }

        // 성공 응답 처리
        Alert.alert("성공", "답변이 제출되었으며, 문의 상태가 '답변 완료'로 변경되었습니다.");
        
        // UI 상태 업데이트
        setCurrentStatus('답변 완료'); 
        
        // 대시보드로 돌아가 목록을 갱신
        navigation.goBack(); 

    } catch (error) {
        console.error("답변 제출 실패:", error);
        Alert.alert("실패", "답변 제출에 실패했습니다. 서버 연결을 확인하세요.");
    } finally {
        setLoading(false); // 로딩 종료
    }
  };
  
  const getStatusStyle = (status) => {
    switch (status) {
      case "답변 대기": return { color: "#ff5722" };
      case "처리 중": return { color: "#ffc107" };
      case "답변 완료": return { color: "#4caf50" };
      default: return { color: "#aaa" };
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="chevron-back" size={26} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>문의 답변 처리</Text>
      </View>

      <ScrollView style={styles.body} contentContainerStyle={{ paddingBottom: 40 }}>
        
        {/* === 1. 문의 기본 정보 === */}
        <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>접수 번호:</Text>
            <Text style={styles.infoText}>{inquiryData?._id?.slice(-8) || 'N/A'}</Text>
        </View>
        <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>문의자:</Text>
            <Text style={styles.infoText}>{inquiryData?.userName || 'N/A'}</Text>
        </View>
        <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>접수일:</Text>
            <Text style={styles.infoText}>{new Date(inquiryData?.createdAt).toLocaleDateString() || 'N/A'}</Text>
        </View>
        <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>현재 상태:</Text>
            <Text style={[styles.infoText, getStatusStyle(currentStatus)]}>
                {currentStatus}
            </Text>
        </View>

        {/* === 2. 문의 원문 (제목 및 내용) === */}
        <View style={styles.card}>
            <Text style={styles.cardHeader}>제목: {inquiryData?.title || '제목 없음'}</Text>
            <Text style={styles.content}>
                {inquiryData?.content || "상세 내용을 불러올 수 없습니다."}
            </Text>
        </View>

        {/* === 3. 문의 상태 변경 (관리자 액션) === */}
        <Text style={styles.label}>상태 변경</Text>
        <View style={styles.statusButtons}>
            {['답변 대기', '처리 중', '답변 완료'].map(status => (
                <TouchableOpacity
                    key={status}
                    style={[
                        styles.statusBtn,
                        currentStatus === status && styles.statusBtnActive
                    ]}
                    // ✨ handleStatusChange를 호출하여 상태 업데이트 (답변 완료는 제외)
                    onPress={() => handleStatusChange(status)}
                    disabled={loading}
                >
                    <Text style={[
                        styles.statusBtnText, 
                        currentStatus === status && styles.statusBtnTextActive
                    ]}>{status}</Text>
                </TouchableOpacity>
            ))}
        </View>

        {/* === 4. 답변 작성 영역 === */}
        <Text style={styles.label}>답변 작성</Text>
        <TextInput
            style={styles.textarea}
            multiline
            numberOfLines={8}
            placeholder="사용자에게 보낼 답변 내용을 입력하세요"
            placeholderTextColor="#888"
            value={answerContent}
            onChangeText={setAnswerContent}
            editable={!loading}
        />
        
        <TouchableOpacity
            style={[styles.submitBtn, loading && styles.disabledBtn]}
            activeOpacity={0.7}
            onPress={handleSubmitAnswer}
            disabled={loading}
        >
            {loading ? (
                <ActivityIndicator color="#fff" />
            ) : (
                <Text style={styles.submitBtnText}>답변 제출 및 완료 처리</Text>
            )}
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
    infoRow: {
        flexDirection: 'row',
        paddingVertical: 5,
        borderBottomWidth: 1,
        borderBottomColor: '#202125',
    },
    infoLabel: {
        color: '#92a8c6',
        width: 80,
        fontSize: 15,
    },
    infoText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '600',
    },
    card: {
        backgroundColor: "#18191b",
        borderRadius: 12,
        padding: 16,
        borderWidth: 1.2,
        borderColor: "#1c2c43",
        marginTop: 15,
        marginBottom: 15,
    },
    cardHeader: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 10,
        paddingBottom: 5,
        borderBottomWidth: 1,
        borderBottomColor: '#252629'
    },
    content: {
        color: "#d4e0f0",
        fontSize: 15,
        lineHeight: 22,
    },
    fileLink: {
        color: '#207cff',
        marginTop: 10,
        fontWeight: '600',
    },
    label: {
        color: "#fff",
        fontSize: 15,
        fontWeight: "600",
        marginTop: 13,
        marginBottom: 8,
    },
    statusButtons: {
        flexDirection: 'row',
        marginBottom: 15,
    },
    statusBtn: {
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderRadius: 20,
        marginRight: 8,
        backgroundColor: '#232324',
    },
    statusBtnActive: {
        backgroundColor: '#207cff',
    },
    statusBtnText: {
        color: '#92a8c6',
        fontWeight: '600',
    },
    statusBtnTextActive: {
        color: '#fff',
    },
    textarea: {
        backgroundColor: "#232324",
        borderRadius: 10,
        color: "#fff",
        fontSize: 15,
        padding: 18,
        minHeight: 150,
        textAlignVertical: "top",
        marginBottom: 15,
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
    disabledBtn: {
        opacity: 0.6,
    }
});