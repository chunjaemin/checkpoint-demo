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

const suggestionData: Post[] = [
  { id: '1', title: '건의사항: 알림 기능 개선 요청', date: '2025-07-03', content: '알림음 설정 기능이 필요합니다.' },
  { id: '2', title: '건의사항: 다크 모드 버그 제보', date: '2025-06-29', content: '특정 화면에서 다크 모드 적용이 이상합니다.' },
  { id: '3', title: '건의사항: 이미지 첨부 오류', date: '2025-06-25', content: '이미지 업로드 시 오류가 발생합니다.' },
  { id: '4', title: '건의사항 4', date: '2025-06-18', content: '네 번째 건의사항입니다.' },
  { id: '5', title: '건의사항 5', date: '2025-06-12', content: '다섯 번째 건의사항입니다.' },
];

export default function SuggestionBoardScreen() {
  const router = useRouter();
  const FIXED_COLORS = {
    background: '#f8f8f8',
    text: '#333',
    postCardBg: '#fff',
    postCardBorder: '#eee',
    postTitleText: '#333',
    postDateText: '#888',
    shadowColor: '#000',
    fabBackground: '#3689FF',
    fabIconColor: '#fff',
  };

  const dataToRender = suggestionData;
  const CARD_HORIZONTAL_PADDING = 15;
  
  const renderPostItem = ({ item }: { item: Post }) => {
    const textLeftMargin = (CARD_HORIZONTAL_PADDING + 5);
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
          router.push(`/team/board/suggestionBoard/${item.id}` as any);
        }}
        activeOpacity={0.85}
      >
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
        contentContainerStyle={[styles.listContentContainer, { paddingTop: 10 }]}
      />
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: FIXED_COLORS.fabBackground }]}
        onPress={() => router.push('/team/board/suggestionBoard/write')}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 5,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
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

