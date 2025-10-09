import React, { useState, useEffect, useCallback } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  ScrollView,
  TextInput,
  ActivityIndicator
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

// 화면 포커스 시 재조회를 위한 useFocusEffect import
import { useFocusEffect } from '@react-navigation/native';

// API_BASE_URL을 import 합니다.
import API_BASE_URL from '../../config'; // 경로는 프로젝트 구조에 맞게 수정하세요.

export default function AdminInquiryDashboard({ navigation }) {
  const [filter, setFilter] = useState("all"); 
  const [search, setSearch] = useState("");
  
  const [inquiries, setInquiries] = useState([]); 
  const [loading, setLoading] = useState(true);

  // ✨ 데이터를 서버에서 가져오는 핵심 비동기 함수
  const fetchAllInquiries = useCallback(async () => {
    setLoading(true);
    try {
      // 쿼리 파라미터 없이 전체 문의 목록을 요청합니다.
      const response = await fetch(API_BASE_URL); 

      if (!response.ok) {
          throw new Error('관리자 대시보드 조회 실패: ' + response.status);
      }

      const data = await response.json();
      setInquiries(data); 

    } catch (error) {
      console.error("관리자 대시보드 조회 중 오류:", error);
      setInquiries([]); 
    } finally {
      setLoading(false);
    }
  }, []); // 의존성 배열을 비워 최초 마운트 시에만 함수가 생성되도록 합니다.

  // ✨ useFocusEffect를 사용하여 화면이 다시 포커스될 때(상세 화면에서 돌아올 때) 데이터를 재조회합니다.
  useFocusEffect(
    useCallback(() => {
      // 화면이 마운트되거나 포커스를 얻을 때마다 데이터를 다시 가져옵니다.
      fetchAllInquiries();
    }, [fetchAllInquiries])
  );


  // 데이터 필터링 로직
  const filteredList = inquiries.filter(item => {
    // 1. 상태 필터링
    if (filter !== "all" && item.status !== filter) return false;
    
    // 2. 검색 필터링 (userName과 title로 검색)
    const lowerSearch = search.toLowerCase();
    return (
      item.title.toLowerCase().includes(lowerSearch) ||
      item.userName.toLowerCase().includes(lowerSearch)
    );
  });

  // 상태별 개수 계산
  const counts = inquiries.reduce((acc, item) => {
    acc[item.status] = (acc[item.status] || 0) + 1;
    return acc;
  }, {});

  const getStatusStyle = (status) => {
    switch (status) {
      case "답변 대기": return { backgroundColor: "#ff5722", color: '#fff' };
      case "처리 중": return { backgroundColor: "#ffc107", color: '#000' };
      case "답변 완료": return { backgroundColor: "#4caf50", color: '#fff' };
      default: return { backgroundColor: "#aaa", color: '#fff' };
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>관리자 문의 대시보드</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>

        {/* === 대시보드 요약 === */}
        <View style={styles.dashboard}>
          <Text style={styles.summaryTitle}>문의 현황</Text>
          <View style={styles.summaryRow}>
            <View style={styles.summaryBox}>
              <Text style={styles.summaryCount}>{inquiries.length}</Text>
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
        
        {/* === 검색 및 필터 === */}
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

        {/* === 문의 목록 === */}
        <View style={styles.listContainer}>
          {loading ? (
            <ActivityIndicator size="large" color="#207cff" style={{ marginTop: 30 }} />
          ) : filteredList.length > 0 ? (
            filteredList.map((item) => (
              <TouchableOpacity 
                key={item._id} // MongoDB의 _id 사용
                style={styles.itemBox}
                activeOpacity={0.8}
                // AdminInquiryDetailScreen으로 이동
                onPress={() => navigation.navigate("AdminInquiryDetailScreen", { inquiryData: item })}
              >
                <View style={styles.itemHeader}>
                  <Text style={styles.itemDate}>{new Date(item.createdAt).toLocaleDateString()}</Text>
                  <Text style={[styles.itemStatus, getStatusStyle(item.status)]}>{item.status}</Text>
                </View>
                <Text style={styles.itemTitle}>{item.title}</Text>
                {/* userName 필드 사용 */}
                <Text style={styles.itemMeta}>{`문의자: ${item.userName} | 이메일: ${item.email}`}</Text>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.noData}>해당 조건에 맞는 문의가 없습니다.</Text>
          )}
        </View>
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