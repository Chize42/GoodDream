import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  ActivityIndicator, 
  SafeAreaView, 
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
  TextStyle, 
  ViewStyle,
  Animated,
  Easing,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';


const { width } = Dimensions.get("window");
const BASE_WIDTH = 375; 
const scale = width / BASE_WIDTH;
const normalizeSize = (size: number) => Math.round(size * scale);


/**
 * 꿈 일기 입력 및 AI 감정 분석 화면 (React Native 버전)
 */
const DreamInputScreen = () => {
  const navigation = useNavigation();
  const [dreamText, setDreamText] = useState('');
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [loadingMessage, setLoadingMessage] = useState('꿈을 분석하는 중...');
  
  // 애니메이션 값들
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const buttonFloatAnim = useRef(new Animated.Value(0)).current;
  const buttonShadowAnim = useRef(new Animated.Value(0)).current;

  // 동동 떠다니는 애니메이션 (키워드용)
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 3000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 3000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // 버튼 떠다니는 효과 (useNativeDriver: false)
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(buttonFloatAnim, {
          toValue: 1,
          duration: 2500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(buttonFloatAnim, {
          toValue: 0,
          duration: 2500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, []);

  // 버튼 반짝이는 효과
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(buttonShadowAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(buttonShadowAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, []);

  // 로딩 메시지 변경
  useEffect(() => {
    if (isLoading) {
      const messages = [
        '꿈을 분석하는 중...',
        '감정을 읽어내는 중...',
        '키워드를 추출하는 중...',
        '거의 다 됐어요...',
      ];
      let index = 0;
      const interval = setInterval(() => {
        index = (index + 1) % messages.length;
        setLoadingMessage(messages[index]);
      }, 1500);
      return () => clearInterval(interval);
    }
  }, [isLoading]);

  const getSentimentStyle = (status: string): TextStyle => {
    switch (status) {
      case '긍정적':
        return { color: '#E6D5F5', fontWeight: 'bold' }; // 파스텔 보라
      case '부정적':
      case '혼란':
        return { color: '#F5D5E6', fontWeight: 'bold' }; // 파스텔 핑크
      case '중립적':
      default:
        return { color: '#D5E6F5', fontWeight: '600' }; // 파스텔 블루
    }
  };

  const getSentimentIcon = (status: string) => {
    switch (status) {
      case '긍정적':
        return 'happy-outline';
      case '부정적':
        return 'sad-outline';
      case '혼란':
        return 'help-circle-outline';
      case '중립적':
      default:
        return 'remove-circle-outline';
    }
  };

  const mockAnalyze = (text: string) => {
      let sentimentStatus = '중립적';
      let keywords = ['수면', '기록', '꿈'];
      let score = 0.0;
      const length = text.length;

      if (text.includes('행복') || text.includes('좋은') || text.includes('기쁨') || text.includes('즐거')) {
          sentimentStatus = '긍정적';
          keywords = ['행복', '즐거움', '편안함', '밝음', '성공', '소원성취'];
          score = Math.min(0.9, length / 50); 
      } else if (text.includes('무서') || text.includes('슬퍼') || text.includes('두려') || text.includes('추격') || text.includes('악몽') || text.includes('힘들') || text.includes('식은땀') || text.includes('울음')) {
          sentimentStatus = '부정적';
          keywords = ['불안', '두려움', '스트레스', '악몽', '식은땀', '피로', '고통', '슬픔', '울음'];
          score = Math.max(-0.8, -length / 50); 
      } else if (text.includes('평화') || text.includes('잔잔') || text.includes('익숙') || text.includes('고요')) {
          sentimentStatus = '중립적';
          keywords = ['일상', '잔잔함', '평화', '기억', '고요', '안정'];
          score = Math.min(0.2, length / 100); 
      } else if (text.includes('이상') || text.includes('혼란') || text.includes('복잡') || text.includes('의문')) {
          sentimentStatus = '혼란'; 
          keywords = ['미스터리', '혼란', '복잡', '질문', '정체불명'];
          score = 0.05; 
      } else {
          score = 0.1;
      }

      return {
        originalText: text,
        sentimentScore: score.toFixed(3), 
        sentimentMagnitude: 0.8, 
        sentimentStatus: sentimentStatus,
        keywords: keywords,
        createdAt: new Date().toISOString(),
      };
  }

  const handleAnalyze = async () => {
    if (dreamText.length < 10) {
      Alert.alert('입력 오류', '꿈 일기를 10자 이상 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setError('');
    setAnalysisResult(null);
    fadeAnim.setValue(0);
    scaleAnim.setValue(0.8);
    progressAnim.setValue(0);

    try {
      const result = mockAnalyze(dreamText);
      
      // 프로그레스 바 애니메이션
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: false,
      }).start();
      
      await new Promise(resolve => setTimeout(resolve, 3000)); 
      setAnalysisResult(result);
      
      // 결과 나타날 때 애니메이션
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
      
    } catch (err) {
      console.error('클라이언트 Mock 오류:', err);
      setError('클라이언트 내부 오류가 발생했습니다.'); 
    } finally {
      setIsLoading(false);
    }
  };

  const floatTranslate = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10],
  });

  const buttonFloatTranslate = buttonFloatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -8],
  });

  const buttonGlowOpacity = buttonShadowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.6],
  });

  const buttonGlowRadius = buttonShadowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [8, 15],
  });

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* 상단 헤더 */}
        <View style={styles.headerContainer}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={normalizeSize(24)} color="#D5C4E6" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>꿈 일기 AI 분석</Text>
        </View>

        {/* 서브헤더 */}
        <View style={styles.subheaderContainer}>
          <Ionicons name="moon" size={normalizeSize(14)} color="#D5C4E6" />
          <Text style={styles.subheader}>꿈의 감정과 핵심 키워드를 추출해요</Text>
        </View>

        {/* 글자 수 카운터 */}
        <View style={styles.charCountContainer}>
          <Text style={styles.charCount}>
            {dreamText.length} / 최소 10자
          </Text>
        </View>

        {/* 입력 필드 */}
        <TextInput
          style={styles.input}
          multiline
          placeholder="오늘 꾼 꿈에 대해 자세히 적어보세요. (예: 오늘은 행복한 꿈을 꿨어.)"
          placeholderTextColor="#666"
          value={dreamText}
          onChangeText={setDreamText}
          editable={!isLoading}
        />

        {/* 분석 버튼 */}
        <Animated.View 
          style={[
            styles.analyzeButton, 
            isLoading || dreamText.length < 10 ? styles.disabledButton : {},
            {
              shadowOpacity: isLoading || dreamText.length < 10 ? 0 : buttonGlowOpacity,
              shadowRadius: buttonGlowRadius,
              transform: [{ translateY: buttonFloatTranslate }],
            }
          ]}
        >
          <TouchableOpacity
            style={styles.analyzeButtonInner}
            onPress={handleAnalyze}
            disabled={isLoading || dreamText.length < 10}
          >
            <Text style={styles.analyzeButtonText}>
              {isLoading ? loadingMessage : 'AI 분석 시작하기'}
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* 로딩 프로그레스 바 */}
        {isLoading && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
            </View>
            <ActivityIndicator size="large" color="#E6D5A8" style={styles.statusMessage} />
          </View>
        )}
        
        {/* 에러 메시지 */}
        {error ? (
          <View style={styles.errorBox}>
            <Ionicons name="warning" size={normalizeSize(20)} color="#E6D5A8" />
            <Text style={styles.errorText}>앗, 오류 발생: {error}</Text>
          </View>
        ) : null}

        {/* 분석 결과 */}
        {analysisResult && (
          <Animated.View 
            style={[
              styles.resultBox,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
              }
            ]}
          >
            {/* 결과 타이틀 */}
            <View style={styles.resultTitleContainer}>
              <Ionicons name="moon" size={normalizeSize(20)} color="#E6D5A8" />
              <Text style={styles.resultTitle}>꿈의 분석 결과</Text>
            </View>
            
            {/* 감정 상태 */}
            <View style={styles.resultRow}>
              <View style={styles.labelContainer}>
                <Ionicons 
                  name={getSentimentIcon(analysisResult.sentimentStatus)} 
                  size={normalizeSize(20)} 
                  color="#A8B8C8" 
                />
                <Text style={styles.label}>전체 감정 상태</Text>
              </View>
              <View style={styles.sentimentBadge}>
                <Text style={getSentimentStyle(analysisResult.sentimentStatus)}>
                  {analysisResult.sentimentStatus}
                </Text>
              </View>
            </View>

            {/* 감정 점수 프로그레스 바 */}
            <View style={styles.scoreContainer}>
              <View style={styles.scoreHeader}>
                <Text style={styles.label}>감정 점수</Text>
                <Text style={styles.scoreText}>{analysisResult.sentimentScore}</Text>
              </View>
              <View style={styles.scoreBarContainer}>
                <View 
                  style={[
                    styles.scoreBarFill, 
                    { 
                      width: `${Math.abs(parseFloat(analysisResult.sentimentScore)) * 100}%`,
                      backgroundColor: parseFloat(analysisResult.sentimentScore) > 0 ? '#E6D5A8' : '#F5D5E6'
                    }
                  ]} 
                />
              </View>
            </View>

            {/* 핵심 키워드 */}
            <View style={styles.keywordsSection}>
              <View style={styles.keywordHeader}>
                <Ionicons name="pricetags" size={normalizeSize(16)} color="#D5C4E6" />
                <Text style={styles.keywordsTitle}>주요 키워드</Text>
              </View>
              <View style={styles.tagContainer}>
                {analysisResult.keywords && analysisResult.keywords.length > 0 ? (
                  analysisResult.keywords.map((keyword: string, index: number) => (
                    <Animated.View 
                      key={index} 
                      style={[
                        styles.tag,
                        {
                          opacity: fadeAnim,
                          transform: [
                            {
                              translateY: fadeAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [20, 0],
                              })
                            },
                            {
                              translateY: floatAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0, -5 - (index % 3) * 2],
                              })
                            }
                          ]
                        }
                      ]}
                    >
                      <Text style={styles.tagText}>{keyword}</Text>
                    </Animated.View>
                  ))
                ) : (
                  <Text style={styles.resultText}>추출된 키워드가 없어요.</Text>
                )}
              </View>
            </View>
          </Animated.View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

interface ComponentStyles {
  safeArea: ViewStyle;
  container: ViewStyle;
  headerContainer: ViewStyle;
  backButton: ViewStyle;
  headerTitle: TextStyle;
  subheaderContainer: ViewStyle;
  subheader: TextStyle;
  charCountContainer: ViewStyle;
  charCount: TextStyle;
  input: TextStyle | ViewStyle; 
  analyzeButton: ViewStyle;
  analyzeButtonInner: ViewStyle;
  analyzeButtonText: TextStyle; 
  disabledButton: ViewStyle; 
  progressContainer: ViewStyle;
  progressBar: ViewStyle;
  progressFill: ViewStyle;
  statusMessage: ViewStyle;
  errorBox: ViewStyle;
  errorText: TextStyle;
  resultBox: ViewStyle;
  resultTitleContainer: ViewStyle;
  resultTitle: TextStyle;
  resultRow: ViewStyle;
  labelContainer: ViewStyle;
  label: TextStyle;
  sentimentBadge: ViewStyle;
  scoreContainer: ViewStyle;
  scoreHeader: ViewStyle;
  scoreText: TextStyle;
  scoreBarContainer: ViewStyle;
  scoreBarFill: ViewStyle;
  keywordsSection: ViewStyle;
  keywordHeader: ViewStyle;
  keywordsTitle: TextStyle;
  tagContainer: ViewStyle;
  tag: ViewStyle; 
  tagText: TextStyle; 
  resultText: TextStyle;
}

const styles = StyleSheet.create<ComponentStyles>({ 
  safeArea: {
    flex: 1,
    backgroundColor: '#1A1A2E', // 부드러운 다크 네이비
  },
  container: {
    padding: normalizeSize(20),
    paddingTop: normalizeSize(70), 
    alignItems: 'center',
    flexGrow: 1,
  },
  headerContainer: {
    width: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: normalizeSize(20),
    paddingTop: normalizeSize(40),
    paddingBottom: normalizeSize(10),
    backgroundColor: '#1A1A2E', 
    zIndex: 10,
    justifyContent: 'flex-start',
  },
  backButton: {
    padding: normalizeSize(5),
  },
  headerTitle: {
    fontSize: normalizeSize(24),
    fontWeight: '800', 
    color: '#ffffffff', 
    marginLeft: normalizeSize(15),
  },
  subheaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: normalizeSize(10),
    marginTop: normalizeSize(25),
  },
  subheader: {
    fontSize: normalizeSize(15),
    color: '#D5C4E6',
    marginLeft: normalizeSize(5),
    textAlign: 'center',
    fontWeight: '600',
  },
  charCountContainer: {
    width: '100%',
    alignItems: 'flex-end',
    marginBottom: normalizeSize(10),
  },
  charCount: {
    fontSize: normalizeSize(13),
    color: '#888',
    fontWeight: '600',
  },
  input: {
    width: '100%',
    height: normalizeSize(180),
    backgroundColor: '#252540', // 부드러운 다크 블루
    borderRadius: normalizeSize(25),
    padding: normalizeSize(20),
    fontSize: normalizeSize(16),
    color: '#E8E8F0',
    borderWidth: 1,
    borderColor: '#D5C4E6', 
    marginBottom: normalizeSize(25),
    textAlignVertical: 'top',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  analyzeButton: { 
    width: '100%',
    paddingVertical: normalizeSize(18),
    borderRadius: normalizeSize(25),
    backgroundColor: '#E6D5A8', // 파스텔 옐로우
    shadowColor: '#E6D5A8',
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
    marginBottom: normalizeSize(20),
  },
  analyzeButtonInner: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  analyzeButtonText: { 
    color: '#5c486fff',
    fontSize: normalizeSize(18),
    fontWeight: '800',
  },
  disabledButton: { 
    backgroundColor: '#3A3A55',
    shadowOpacity: 0,
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: normalizeSize(20),
  },
  progressBar: {
    width: '100%',
    height: normalizeSize(8),
    backgroundColor: '#3A3A55',
    borderRadius: normalizeSize(10),
    overflow: 'hidden',
    marginBottom: normalizeSize(15),
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#E6D5A8',
    borderRadius: normalizeSize(10),
  },
  statusMessage: {
    marginTop: normalizeSize(10),
  },
  errorBox: {
    backgroundColor: '#3A2A35', 
    padding: normalizeSize(15),
    borderRadius: normalizeSize(15),
    width: '100%',
    marginVertical: normalizeSize(15),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: '#E6D5A8',
    fontWeight: '700',
    textAlign: 'center',
    fontSize: normalizeSize(14),
    marginLeft: normalizeSize(10),
  },
  resultBox: {
    width: '100%',
    backgroundColor: '#252540',
    borderRadius: normalizeSize(25),
    padding: normalizeSize(25),
    marginTop: normalizeSize(10),
    borderWidth: 1,
    borderColor: '#3A3A55',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 6,
  },
  resultTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: normalizeSize(20),
    borderBottomWidth: 1,
    borderBottomColor: '#3A3A55',
    paddingBottom: normalizeSize(15),
  },
  resultTitle: {
    fontSize: normalizeSize(20),
    fontWeight: '800',
    color: '#E6D5A8',
    marginLeft: normalizeSize(10),
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: normalizeSize(15),
    alignItems: 'center',
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontWeight: '600',
    color: '#A8B8C8',
    fontSize: normalizeSize(16),
    marginLeft: normalizeSize(8),
  },
  sentimentBadge: {
    backgroundColor: '#3A3A55',
    paddingHorizontal: normalizeSize(15),
    paddingVertical: normalizeSize(8),
    borderRadius: normalizeSize(15),
  },
  scoreContainer: {
    marginBottom: normalizeSize(20),
  },
  scoreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: normalizeSize(10),
  },
  scoreText: {
    color: '#E8E8F0',
    fontSize: normalizeSize(16),
    fontWeight: '700',
  },
  scoreBarContainer: {
    width: '100%',
    height: normalizeSize(12),
    backgroundColor: '#3A3A55',
    borderRadius: normalizeSize(10),
    overflow: 'hidden',
  },
  scoreBarFill: {
    height: '100%',
    borderRadius: normalizeSize(10),
  },
  keywordsSection: {
    marginTop: normalizeSize(10),
  },
  keywordHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: normalizeSize(12),
  },
  keywordsTitle: {
    fontSize: normalizeSize(16),
    fontWeight: '700',
    color: '#D5C4E6',
    marginLeft: normalizeSize(8),
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: '#3A3A55', 
    paddingVertical: normalizeSize(10),
    paddingHorizontal: normalizeSize(16),
    borderRadius: normalizeSize(20),
    marginRight: normalizeSize(8),
    marginBottom: normalizeSize(10),
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#D5C4E6',
  },
  tagText: {
    color: '#D5C4E6',
    fontSize: normalizeSize(14),
    fontWeight: '600',
  },
  resultText: {
    fontSize: normalizeSize(16),
    color: '#A8B8C8',
    lineHeight: normalizeSize(24),
    marginBottom: normalizeSize(5),
  }
});

export default DreamInputScreen;