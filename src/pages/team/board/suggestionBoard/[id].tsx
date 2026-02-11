import { AntDesign } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// 샘플 데이터 (실제 서비스에서는 서버에서 fetch하거나 context/store에서 가져오세요)
const suggestionData = [
  { id: '1', title: '건의사항: 알림 기능 개선 요청', date: '2025-07-03', content: '알림음 설정 기능이 필요합니다.' },
  { id: '2', title: '건의사항: 다크 모드 버그 제보', date: '2025-06-29', content: '특정 화면에서 다크 모드 적용이 이상합니다.' },
  { id: '3', title: '건의사항: 이미지 첨부 오류', date: '2025-06-25', content: '이미지 업로드 시 오류가 발생합니다.' },
  { id: '4', title: '건의사항 4', date: '2025-06-18', content: '네 번째 건의사항입니다.' },
  { id: '5', title: '건의사항 5', date: '2025-06-12', content: '다섯 번째 건의사항입니다.' },
];

export default function SuggestionDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const suggestion = suggestionData.find((n) => n.id === id);

  if (!suggestion) {
    return (
      <View style={styles.centered}>
        <Text>존재하지 않는 건의입니다.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={{ flex: 1, alignItems: 'center' }}>
                  <Text style={styles.headerTitle}>건의사항</Text>
                </View>
      </View>
      <View style={styles.card}>
        <Text style={styles.title}>{suggestion.title}</Text>
        <Text style={styles.date}>{suggestion.date}</Text>
        <View style={styles.divider} />
        <Text style={styles.content}>{suggestion.content}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#222',
  },
  date: {
    fontSize: 13,
    color: '#888',
    marginBottom: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 10,
  },
  content: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
