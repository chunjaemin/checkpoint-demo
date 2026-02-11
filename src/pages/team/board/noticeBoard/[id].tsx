import { AntDesign } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// 샘플 데이터 (실제 서비스에서는 서버에서 fetch하거나 context/store에서 가져오세요)
const noticeData = [
  { id: '1', title: '점검 안내 (2025년 7월 5일)', date: '2025-07-01', content: '시스템 안정화를 위한 정기 점검이 있습니다.' },
  { id: '2', title: '새로운 기능 업데이트!', date: '2025-06-28', content: '팀 스케줄 기능이 추가되었습니다.' },
  { id: '3', title: '이용 약관 변경 안내', date: '2025-06-20', content: '개정된 이용 약관을 확인해주세요.' },
  { id: '4', title: '서비스 개선을 위한 설문조사', date: '2025-06-15', content: '설문조사에 참여하시고 커피쿠폰을 받으세요!' },
  { id: '5', title: '공지사항 5', date: '2025-06-10', content: '다섯 번째 공지사항입니다.' },
];

export const options = {
  title: '공지사항',
};

export default function NoticeDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const notice = noticeData.find((n) => n.id === id);

  if (!notice) {
    return (
      <View style={styles.centered}>
        <Text>존재하지 않는 공지입니다.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={{ flex: 1, alignItems: 'center' }}>
                  <Text style={styles.headerTitle}>공지사항 </Text>
                </View>
      </View>
      <View style={styles.card}>
        <Text style={styles.title}>{notice.title}</Text>
        <Text style={styles.date}>{notice.date}</Text>
        <View style={styles.divider} />
        <Text style={styles.content}>{notice.content}</Text>
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
