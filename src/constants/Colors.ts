/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    // appSettings 화면에 사용된 색상 추가
    settingItemBg: '#fff', // 흰색 배경의 설정 아이템
    settingItemShadow: '#000', // 검정색 그림자
    settingText: '#555', // 어두운 회색 텍스트
    versionText: '#888', // 더 어두운 회색 텍스트
    titleText: '#333', // 진한 회색 제목 텍스트
  },
  dark: {
    text: '#ECEDEE', // 밝은 회색 텍스트
    background: '#151718', // 어두운 배경
    tint: tintColorDark, // 흰색 강조
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    // appSettings 화면에 사용될 다크 모드 색상
    settingItemBg: '#2a2a2a', // 어두운 회색 배경의 설정 아이템
    settingItemShadow: '#000', // 어두운 배경에서도 그림자 색상은 일반적으로 검정색 유지 (선택 사항: 밝은 색으로 변경 가능)
    settingText: '#ccc', // 밝은 회색 텍스트
    versionText: '#aaa', // 중간 회색 텍스트
    titleText: '#eee', // 아주 밝은 회색 제목 텍스트
  },
};