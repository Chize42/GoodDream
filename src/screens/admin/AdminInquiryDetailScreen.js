import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

export default function AdminInquiryDetailScreen({ navigation, route }) {
  // AdminInquiryDashboard에서 전달받은 문의 데이터
  const { inquiryData } = route.params || {}; 
  
  const [answerContent, setAnswerContent] = useState('');
  const [currentStatus, setCurrentStatus] = useState(inquiryData?.status || '답변 대기');

  const handleStatusChange = (newStatus) => {
    // 실제로는 서버 API를 호출하여 상태를 업데이트합니다.
    setCurrentStatus(newStatus);
    // 임시 알림
    alert(`문의 상태가 "${newStatus}"로 변경되었습니다.`); 
  };

  // ✨ 답변 제출 기능 강화
  const handleSubmitAnswer = () => {
    if (!answerContent.trim()) {
        alert("답변 내용을 입력해주세요.");
        return;
    }
    
    // ✨ ✨ 이 부분이 답변 제출 API 호출 로직이 들어갈 곳입니다. ✨ ✨
    
    // 서버로 보낼 데이터: inquiryData.id, answerContent, newStatus
    const submissionData = {
        inquiryId: inquiryData.id,
        answer: answerContent,
        newStatus: "답변 완료",
    };
    
    // console.log("서버로 전송될 답변 데이터:", submissionData);
    // fetch('YOUR_API_ENDPOINT/answer', { method: 'POST', body: JSON.stringify(submissionData) })
    
    // 시뮬레이션: 1초 후 서버 응답이 왔다고 가정
    setTimeout(() => {
        // 서버 성공 시 처리
        alert(`답변이 성공적으로 제출되었습니다. 상태: 답변 완료`);
        setCurrentStatus('답변 완료');
        setAnswerContent(''); // 입력 필드 비우기
        
        // 제출 후 대시보드로 돌아가 목록을 갱신하도록 유도 (goBack)
        navigation.goBack(); 
    }, 1000);
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
            <Text style={styles.infoText}>{inquiryData?.id || 'N/A'}</Text>
        </View>
        <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>문의자:</Text>
            <Text style={styles.infoText}>{inquiryData?.name || 'N/A'}</Text>
        </View>
        <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>접수일:</Text>
            <Text style={styles.infoText}>{inquiryData?.date || 'N/A'}</Text>
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
                {inquiryData?.desc || "상세 내용을 불러올 수 없습니다."}
            </Text>
            <Text style={styles.fileLink}>첨부 파일 보기 (구현 예정)</Text>
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
                    onPress={() => handleStatusChange(status)}
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
        />
        
        <TouchableOpacity
            style={styles.submitBtn}
            activeOpacity={0.7}
            onPress={handleSubmitAnswer}
        >
            <Text style={styles.submitBtnText}>답변 제출 및 완료 처리</Text>
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
});