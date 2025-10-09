import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

// API_BASE_URL을 import 합니다.
import API_BASE_URL from '../../config'; // 경로는 프로젝트 구조에 맞게 수정하세요.

export default function InquiryHistoryScreen({ navigation }) {
    const [inquiries, setInquiries] = useState([]);
    const [loading, setLoading] = useState(true);

    // useEffect를 사용하여 실제 API 호출
    useEffect(() => {
        const fetchInquiries = async () => {
            setLoading(true);
            
            try {
                // ✨ 수정: 쿼리 파라미터 없이 전체 목록을 요청하여 '답변 완료' 상태만 제외하고 필터링합니다.
                const response = await fetch(API_BASE_URL); 

                if (!response.ok) {
                    throw new Error('문의 목록 조회 실패: ' + response.status);
                }

                const data = await response.json();
                
                // ✨ '답변 완료' 상태만 제외하고 필터링합니다. ('답변 대기'와 '처리 중' 포함)
                const inProgressList = data.filter(item => item.status !== '답변 완료');

                setInquiries(inProgressList); 
                
            } catch (error) {
                console.error("문의 목록 조회 실패:", error);
                // 오류 발생 시 빈 목록을 보여주고 사용자에게 메시지 표시 가능
                setInquiries([]); 
            } finally {
                setLoading(false);
            }
        };

        fetchInquiries();
    }, []); 

  // 뱃지 스타일을 상태에 따라 동적으로 결정하는 함수
  const getBadgeStyle = (status) => {
    switch (status) {
        case "처리 중": return styles.badgeProcessing; // 처리 중
        case "답변 대기": return styles.badgeInProgress; // 답변 대기
        default: return styles.badgeCompleted; // 기본값 (완료)
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
            // ✨ 수정: goBack() 대신 '고객센터' 화면으로 명시적으로 이동합니다.
            onPress={() => navigation.navigate("고객센터")}
        >
          <Icon name="chevron-back" size={26} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>문의내역</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <Text style={styles.sectionTitle}>진행 중 문의</Text>
        
        {loading ? ( 
            <ActivityIndicator size="large" color="#207cff" style={{ marginTop: 30 }} />
        ) : inquiries.length > 0 ? ( 
            inquiries.map((item) => (
                <TouchableOpacity 
                    // MongoDB의 _id를 key로 사용
                    key={item._id} 
                    style={styles.itemBox}
                    activeOpacity={0.8}
                    // 문의 데이터 전체를 상세 화면으로 전달
                    onPress={() => navigation.navigate("InquiryDetailScreen", { inquiryData: item })}
                >
                    {/* DB 필드명에 맞게 item.createdAt 등을 사용하도록 수정 */}
                    <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString()}</Text>
                    <Text style={styles.title}>{item.title}</Text>
                    <Text style={styles.desc}>{item.content}</Text>
                    <View style={styles.badgeBox}>
                        <Text style={getBadgeStyle(item.status)}>{item.status}</Text>
                    </View>
                </TouchableOpacity>
            ))
        ) : ( 
            <Text style={styles.noDataText}>진행 중인 문의가 없습니다.</Text>
        )}

        <TouchableOpacity
          style={styles.endBtn}
          activeOpacity={0.8}
          // CompletedInquiryScreen으로 이동
          onPress={() => navigation.navigate("CompletedInquiryScreen")} 
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
  badgeInProgress: { // 답변 대기
    paddingHorizontal: 14,
    paddingVertical: 5,
    backgroundColor: "#4074D8",
    color: "#fff",
    borderRadius: 13,
    fontWeight: "600",
    fontSize: 13,
  },
  badgeProcessing: { // 처리 중
    paddingHorizontal: 14,
    paddingVertical: 5,
    backgroundColor: "#fff",
    color: "#4074D8",
    borderRadius: 13,
    fontWeight: "600",
    fontSize: 13,
  },
  badgeCompleted: { // 완료된 문의
    paddingHorizontal: 14,
    paddingVertical: 5,
    backgroundColor: "#4074D8", 
    color: "#fff",
    borderRadius: 13,
    fontWeight: "600",
    fontSize: 13,
  },
  noDataText: {
    color: '#92a8c6',
    textAlign: 'center',
    marginTop: 30,
    fontSize: 15,
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