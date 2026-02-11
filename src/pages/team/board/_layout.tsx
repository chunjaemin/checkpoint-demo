// team/board/_layout.tsx
import React from 'react';
// createMaterialTopTabNavigator를 임포트합니다.
import { AntDesign } from '@expo/vector-icons'; // 아이콘 임포트
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useRouter, withLayoutContext } from 'expo-router'; // expo-router와 연동을 위해 필요
import { Text, TouchableOpacity, View } from 'react-native'; // Text와 View 컴포넌트를 명시적으로 임포트

// createMaterialTopTabNavigator를 expo-router 컨텍스트에 연결합니다.
const TopTabs = withLayoutContext(createMaterialTopTabNavigator().Navigator);

export default function BoardLayout() {
  const router = useRouter(); // 뒤로가기 라우터
  // 테마 컨텍스트를 사용하지 않으므로 고정된 색상 사용
  const FIXED_TAB_COLORS = {
    activeTint: '#3689FF', // 활성화된 탭 색상 (파란색) - 텍스트 색상으로 사용
    inactiveTint: '#666',  // 비활성화된 탭 색상 (회색) - 텍스트 색상으로 사용
    background: 'transparent', // <-- 탭 바 배경색을 투명으로 변경
    borderColor: 'transparent', // <-- 탭 바 경계선 색상을 투명으로 변경
    indicatorColor: 'transparent', // <-- 인디케이터 색상을 투명으로 변경
    labelColor: '#333', // 탭 레이블 기본 색상 (activeTint, inactiveTint와 함께 사용)
  };

  return (
    <>
      {/* 커스텀 헤더: 게시판 + 뒤로가기 */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        paddingTop: 40, // SafeArea 고려 (필요시 조정)
        paddingBottom: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
      }}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ position: 'absolute', left: 20, top: 54, transform: [{ translateY: -12 }], padding: 5 }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <AntDesign name="arrowleft" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#222' }}>게시판</Text>
      </View>
      {/* 탑바 */}
      <TopTabs
        screenOptions={{
          tabBarActiveTintColor: FIXED_TAB_COLORS.activeTint, // 활성화된 탭 아이콘/텍스트 색상
          tabBarInactiveTintColor: FIXED_TAB_COLORS.inactiveTint, // 비활성화된 탭 아이콘/텍스트 색상
          tabBarIndicatorStyle: { // 활성화된 탭 아래의 인디케이터 스타일
            backgroundColor: FIXED_TAB_COLORS.indicatorColor, // <-- 투명으로 변경
            height: 0, // <-- 인디케이터 두께를 0으로 변경하여 보이지 않게 함
          },
          tabBarStyle: { // 탭 바 전체 스타일
            backgroundColor: FIXED_TAB_COLORS.background, // <-- 투명으로 변경
            borderBottomWidth: 0, // <-- 하단 경계선 제거
            elevation: 0, // Android에서 탭 바의 그림자 제거
            shadowOpacity: 0, // iOS에서 탭 바의 그림자 제거
          },
          tabBarLabelStyle: { // 탭 레이블 텍스트 스타일
            fontSize: 12,
            fontWeight: 'bold',
            color: FIXED_TAB_COLORS.labelColor, // 기본 레이블 색상 (active/inactive Tint가 덮어씌움)
          },
        }}
      >
        {/* 공지사항 탭만 */}
        <TopTabs.Screen
          name="noticeBoard"
          options={{
            title: '공지사항',
            tabBarIcon: ({ color, focused }: { color: string; focused: boolean }) => (
              <View style={{ alignItems: 'center' }}>
                <AntDesign name="notification" size={20} color={color} />
                <Text style={{ color, fontSize: 12, fontWeight: 'bold', marginTop: 2 }}>공지사항</Text>
              </View>
            ),
            tabBarLabel: () => null,
          }}
        />
        {/* 건의사항 탭만 */}
        <TopTabs.Screen
          name="suggestionBoard"
          options={{
            title: '건의사항',
            tabBarIcon: ({ color, focused }: { color: string; focused: boolean }) => (
              <View style={{ alignItems: 'center' }}>
                <AntDesign name="message1" size={20} color={color} />
                <Text style={{ color, fontSize: 12, fontWeight: 'bold', marginTop: 2 }}>건의사항</Text>
              </View>
            ),
            tabBarLabel: () => null,
          }}
        />
      </TopTabs>
      {/* Slot 제거 */}
    </>
  );
}
