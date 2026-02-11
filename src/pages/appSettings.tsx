// app/appSettings.tsx 파일 내용

import React from 'react';
import { View, Text, StyleSheet, Button, Switch, ScrollView, Linking, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/useColorScheme'; // <-- useColorScheme 훅 임포트
import { Colors } from '@/constants/Colors'; // <-- Colors 상수 임포트

export default function Appsettings() {
  // 1. 현재 색상 스키마(light 또는 dark)를 가져옵니다.
  const colorScheme = useColorScheme();
  
  // 2. colorScheme 값에 따라 Colors 객체에서 해당 테마의 색상 팔레트를 선택합니다.
  //    colorScheme이 null일 경우를 대비해 기본값으로 'light'를 설정해둡니다.
  const currentColors = Colors[colorScheme ?? 'light']; 

  const [receiveNotifications, setReceiveNotifications] = React.useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = React.useState(false); // 이 스위치는 앱 내 테마를 강제할 때 사용될 수 있습니다.

  const PRIVACY_POLICY_URL = 'https://www.yourcompany.com/privacy-policy';
  const TERMS_OF_SERVICE_URL = 'https://www.yourcompany.com/terms-of-service';

  const handleOpenURL = async (url: string) => {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert(`이 URL을 열 수 없습니다: ${url}`);
      console.error(`Don't know how to open this URL: ${url}`);
    }
  };

  const handleLogout = () => {
    console.log('로그아웃 버튼 클릭');
  };

  return (
    // 3. SafeAreaView와 같은 최상위 컨테이너에 배경색 적용
    //    배열 스타일 구문: [기본 스타일, {동적으로 변경될 스타일}]
    <SafeAreaView style={[styles.container, { backgroundColor: currentColors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>

        {/* 알림 설정 아이템 */}
        <View style={[
            styles.settingItem,
            { 
              backgroundColor: currentColors.settingItemBg, // 아이템 배경색
              // 그림자 색상은 iOS에서만 적용되므로 Platform.select를 사용하는 것이 더 좋습니다.
              // 안드로이드는 elevation으로 그림자 깊이를 조절합니다.
              // shadowColor: currentColors.settingItemShadow 
            }
          ]}
        >
          <Text style={[styles.settingText, { color: currentColors.settingText }]}>알림 받기</Text>
          <Switch
            onValueChange={setReceiveNotifications}
            value={receiveNotifications}
            // 스위치 트랙 및 썸 색상도 테마에 따라 변경
            trackColor={{ false: '#767577', true: currentColors.tint }} 
            thumbColor={receiveNotifications ? currentColors.tint : '#f4f3f4'}
          />
        </View>

        {/* 다크 모드 스위치 */}
        {/* 이 스위치가 실제 앱 테마를 변경하려면 전역 상태 관리 로직 필요 */}
        <View style={[styles.settingItem, { backgroundColor: currentColors.settingItemBg }]}>
          <Text style={[styles.settingText, { color: currentColors.settingText }]}>다크 모드</Text>
          <Switch
            onValueChange={setDarkModeEnabled}
            value={darkModeEnabled}
            trackColor={{ false: '#767577', true: currentColors.tint }}
            thumbColor={darkModeEnabled ? currentColors.tint : '#f4f3f4'}
          />
        </View>

        {/* 개인 정보 보호 정책 아이템 */}
        <View style={[styles.settingItem, { backgroundColor: currentColors.settingItemBg }]}>
          <Text style={[styles.settingText, { color: currentColors.settingText }]}>개인 정보 보호 정책</Text>
          <Button
            title="보기"
            onPress={() => handleOpenURL(PRIVACY_POLICY_URL)}
            // Button 컴포넌트의 color prop을 동적으로 변경할 수 있습니다.
            // color={currentColors.tint}
          />
        </View>

        {/* 서비스 이용 약관 아이템 */}
        <View style={[styles.settingItem, { backgroundColor: currentColors.settingItemBg }]}>
          <Text style={[styles.settingText, { color: currentColors.settingText }]}>서비스 이용 약관</Text>
          <Button
            title="보기"
            onPress={() => handleOpenURL(TERMS_OF_SERVICE_URL)}
            // color={currentColors.tint}
          />
        </View>

        {/* 버전 정보 아이템 */}
        <View style={[styles.settingItem, { backgroundColor: currentColors.settingItemBg }]}>
          <Text style={[styles.settingText, { color: currentColors.settingText }]}>버전 정보</Text>
          <Text style={[styles.versionText, { color: currentColors.versionText }]}>1.0.0</Text>
        </View>

        {/* 로그아웃 버튼 */}
        <View style={styles.logoutButtonContainer}>
          <Button title="로그아웃" onPress={handleLogout} color="red" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // 여기서 backgroundColor를 제거하고, 위에서 currentColors.background로 동적 적용
  },
  scrollContent: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    // 여기서 color를 제거하고, 위에서 currentColors.titleText로 동적 적용
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    // 여기서 backgroundColor를 제거하고, 위에서 currentColors.settingItemBg로 동적 적용
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 10,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    // 그림자 색상: Android의 elevation은 따로 색상을 지정할 필요가 없지만,
    // iOS의 shadowColor는 Platform.select를 통해 동적으로 설정하는 것이 좋습니다.
    // 예를 들어, 아래와 같이 스타일을 추가할 수 있습니다:
    // ...Platform.select({
    //   ios: { shadowColor: currentColors.settingItemShadow },
    //   android: {}, // Android는 elevation으로 처리되므로 추가 설정 없음
    // }),
  },
  settingText: {
    fontSize: 18,
    // 여기서 color를 제거하고, 위에서 currentColors.settingText로 동적 적용
  },
  versionText: {
    fontSize: 16,
    // 여기서 color를 제거하고, 위에서 currentColors.versionText로 동적 적용
  },
  logoutButtonContainer: {
    marginTop: 30,
  }
});