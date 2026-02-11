import { AntDesign } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, FlatList, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

interface Post {
  id: string;
  title: string;
  date: string;
  content: string;
}

const noticeData: Post[] = [
  { id: '1', title: '점검 안내 (2025년 7월 5일)', date: '2025-07-01', content: '시스템 안정화를 위한 정기 점검이 있습니다.' },
  { id: '2', title: '새로운 기능 업데이트!', date: '2025-06-28', content: '팀 스케줄 기능이 추가되었습니다.' },
  { id: '3', title: '이용 약관 변경 안내', date: '2025-06-20', content: '개정된 이용 약관을 확인해주세요.' },
  { id: '4', title: '서비스 개선을 위한 설문조사', date: '2025-06-15', content: '설문조사에 참여하시고 커피쿠폰을 받으세요!' },
  { id: '5', title: '공지사항 5', date: '2025-06-10', content: '다섯 번째 공지사항입니다.' },
];

export const options = {
  title: '', // 헤더 타이틀을 빈 문자열로 설정
  headerTitle: '', // expo-router에서 지원 시 명시적으로도 빈 문자열
};

export default function NoticeBoardScreen() {
  const router = useRouter();

  const FIXED_COLORS = {
    background: '#f8f8f8',
    text: '#333',
    postCardBg: '#fff',
    postCardBorder: '#eee',
    postTitleText: '#333',
    postDateText: '#888',
    shadowColor: '#000',
    tint: '#FF0000', // 핀 아이콘 색상
    fabBackground: '#3689FF',
    fabIconColor: '#fff',
  };

  const dataToRender = noticeData;
  const PIN_ICON_SIZE = 20;
  const CARD_HORIZONTAL_PADDING = 15;
  const PIN_ICON_LEFT_POSITION = 10;
  const TEXT_INDENTATION_FOR_PIN = PIN_ICON_LEFT_POSITION + PIN_ICON_SIZE + 10;

  const renderPostItem = ({ item }: { item: Post }) => {
    const showPinIcon = item.id === '1';
    const textLeftMargin = showPinIcon ? TEXT_INDENTATION_FOR_PIN : (CARD_HORIZONTAL_PADDING + 5);
    return (
      <TouchableOpacity
        style={[
          styles.postItem,
          {
            backgroundColor: FIXED_COLORS.postCardBg,
            borderColor: FIXED_COLORS.postCardBorder,
            ...Platform.select({
              ios: { shadowColor: FIXED_COLORS.shadowColor },
              android: {},
            })
          }
        ]}
        onPress={() => {
          router.push(`/team/board/noticeBoard/${item.id}` as any);
        }}
        activeOpacity={0.85}
      >
        {/* 상단 핀 아이콘 */}
        {showPinIcon && (
          <AntDesign
            name="pushpino"
            size={PIN_ICON_SIZE}
            color={FIXED_COLORS.tint}
            style={[styles.pinIcon, { 
              left: PIN_ICON_LEFT_POSITION,
              top: '50%',
            }]} 
          />
        )}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flex: 1 }}>
            <Text style={[
              styles.postTitle,
              {
                color: FIXED_COLORS.postTitleText,
                marginLeft: textLeftMargin - CARD_HORIZONTAL_PADDING,
              }
            ]}>{item.title}</Text>
            <Text style={[
              styles.postDate,
              {
                color: FIXED_COLORS.postDateText,
                marginLeft: textLeftMargin - CARD_HORIZONTAL_PADDING
              }
            ]}>{item.date}</Text>
          </View>
          {/* 카드 내부 오른쪽 세로 중앙에 수정/삭제 아이콘 */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 8 }}>
            <TouchableOpacity onPress={(e) => { e.stopPropagation(); alert('수정 기능은 준비 중입니다.'); }} style={{ padding: 4 }}>
              <AntDesign name="edit" size={18} color="#666" />
            </TouchableOpacity>
            <TouchableOpacity onPress={(e) => { e.stopPropagation(); alert('삭제 기능은 준비 중입니다.'); }} style={{ padding: 4, marginLeft: 2 }}>
              <AntDesign name="delete" size={18} color="#e53935" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: FIXED_COLORS.background }]}>  
      <FlatList
        data={dataToRender}
        renderItem={renderPostItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.listContentContainer]}
      />
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: FIXED_COLORS.fabBackground }]}
        onPress={() => router.push('/team/board/noticeBoard/write')}
      >
        <AntDesign name="pluscircleo" size={24} color={FIXED_COLORS.fabIconColor} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContentContainer: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  postItem: {
    flexDirection: 'column',
    paddingHorizontal: 15,
    paddingVertical: 15,
    marginBottom: 10,
    borderRadius: 8,
    borderWidth: 1,
    position: 'relative',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  textContainer: {
    flexDirection: 'column',
  },
  pinIcon: {
    position: 'absolute',
    top: '50%',
  },
  postTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  postDate: {
    fontSize: 13,
  },
  fab: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 150 : 100,
    right: 25,
    width: 50,
    height: 50,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
});

