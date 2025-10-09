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

// 더미 문의 데이터 (관리자용)
const adminInquiries = [
  { id: "A-0005", date: "2025-05-18", title: "로그인 오류 보고", status: "답변 대기", category: "오류", name: "김관리" },
  { id: "A-0004", date: "2025-05-17", title: "결제 환불 요청", status: "처리 중", category: "결제", name: "박철수" },
  { id: "A-0003", date: "2025-05-16", title: "앱 개선 제안", status: "답변 완료", category: "제안", name: "홍길동" },
  { id: "A-0002", date: "2025-05-15", title: "이용 방법 문의", status: "답변 완료", category: "일반", name: "최영희" },
  { id: "A-0001", date: "2025-05-14", title: "첨부 파일 전송 오류", status: "답변 대기", category: "오류", name: "정민" },
];

export default function AdminInquiryDashboard({ navigation }) {
  const [filter, setFilter] = useState("all"); // 'all', '대기', '처리 중', '완료'
  const [search, setSearch] = useState("");

  const filteredList = adminInquiries.filter(item => {
    // 1. 상태 필터링
    if (filter !== "all" && item.status !== filter) return false;
    
    // 2. 검색 필터링 (제목, 이름)
    const lowerSearch = search.toLowerCase();
    return (
      item.title.toLowerCase().includes(lowerSearch) ||
      item.name.toLowerCase().includes(lowerSearch)
    );
  });

  // 상태별 개수 계산
  const counts = adminInquiries.reduce((acc, item) => {
    acc[item.status] = (acc[item.status] || 0) + 1;
    return acc;
  }, {});

  const getStatusStyle = (status) => {
    switch (status) {
      case "답변 대기": return { backgroundColor: "#ff5722", color: '#fff' }; // 주황색
      case "처리 중": return { backgroundColor: "#ffc107", color: '#000' }; // 노란색
      case "답변 완료": return { backgroundColor: "#4caf50", color: '#fff' }; // 초록색
      default: return { backgroundColor: "#aaa", color: '#fff' };
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>관리자 문의 대시보드</Text>
      </View>

      <View style={styles.dashboard}>
        <Text style={styles.summaryTitle}>문의 현황</Text>
        <View style={styles.summaryRow}>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryCount}>{adminInquiries.length}</Text>
            <Text style={styles.summaryLabel}>전체</Text>
          </View>
          <View style={styles.summaryBox}>
            <Text style={[styles.summaryCount, {color: '#ff5722'}]}>{counts["답변 대기"] || 0}</Text>
            <Text style={styles.summaryLabel}>답변 대기</Text>
          </View>
          <View style={styles.summaryBox}>
            <Text style={[styles.summaryCount, {color: '#4caf50'}]}>{counts["답변 완료"] || 0}</Text>
            <Text style={styles.summaryLabel}>답변 완료</Text>
          </View>
        </View>
      </View>
      
      <TextInput
        style={styles.searchInput}
        placeholder="제목 또는 문의자 검색"
        placeholderTextColor="#888"
        value={search}
        onChangeText={setSearch}
      />

      <View style={styles.filterContainer}>
        {['all', '답변 대기', '처리 중', '답변 완료'].map(status => (
          <TouchableOpacity 
            key={status}
            style={[
              styles.filterButton, 
              filter === status && styles.filterButtonActive
            ]}
            onPress={() => setFilter(status)}
          >
            <Text style={[
              styles.filterText, 
              filter === status && styles.filterTextActive
            ]}>
              {status === 'all' ? '전체' : status}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.listContainer}>
        {filteredList.length > 0 ? (
          filteredList.map((item) => (
            // 클릭 시 AdminInquiryDetailScreen으로 이동
            <TouchableOpacity 
              key={item.id} 
              style={styles.itemBox}
              activeOpacity={0.8}
              onPress={() => navigation.navigate("AdminInquiryDetailScreen", { inquiryData: item })}
            >
              <View style={styles.itemHeader}>
                <Text style={styles.itemDate}>{item.date}</Text>
                <Text style={[styles.itemStatus, getStatusStyle(item.status)]}>{item.status}</Text>
              </View>
              <Text style={styles.itemTitle}>{item.title}</Text>
              <Text style={styles.itemMeta}>{`문의자: ${item.name} | 분류: ${item.category}`}</Text>
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.noData}>해당 조건에 맞는 문의가 없습니다.</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121212" },
  header: {
    paddingHorizontal: 15,
    height: 60,
    justifyContent: 'center',
  },
  headerTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
  },
  dashboard: {
    backgroundColor: '#18191b',
    padding: 15,
    marginHorizontal: 15,
    borderRadius: 12,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#1c2c43',
  },
  summaryTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryBox: {
    alignItems: 'center',
    flex: 1,
  },
  summaryCount: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  summaryLabel: {
    color: '#92a8c6',
    fontSize: 13,
    marginTop: 3,
  },
  searchInput: {
    backgroundColor: "#232324",
    borderRadius: 10,
    color: "#fff",
    fontSize: 15,
    paddingHorizontal: 18,
    paddingVertical: 12,
    marginHorizontal: 15,
    marginTop: 15,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    marginTop: 10,
    marginBottom: 5,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#232324',
  },
  filterButtonActive: {
    backgroundColor: "#207cff",
  },
  filterText: {
    color: "#aaa",
    fontSize: 14,
    fontWeight: '600',
  },
  filterTextActive: {
    color: "#fff",
  },
  listContainer: {
    paddingHorizontal: 15,
    paddingBottom: 40,
  },
  itemBox: {
    backgroundColor: "#18191b",
    borderRadius: 12,
    borderWidth: 1.2,
    borderColor: "#1c2c43",
    marginTop: 10,
    paddingVertical: 13,
    paddingHorizontal: 15,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  itemDate: {
    color: "#92a8c6",
    fontSize: 12.5,
    fontWeight: "500",
  },
  itemStatus: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    fontWeight: "600",
    fontSize: 12,
  },
  itemTitle: { 
    color: "#fff", 
    fontSize: 15.5, 
    fontWeight: "bold", 
    marginBottom: 4 
  },
  itemMeta: { 
    color: "#a1b2c8", 
    fontSize: 13, 
  },
  noData: {
    color: '#92a8c6',
    textAlign: 'center',
    marginTop: 30,
    fontSize: 16,
  }
});