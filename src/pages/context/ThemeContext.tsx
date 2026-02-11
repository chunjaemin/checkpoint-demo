// context/ThemeContext.tsx

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Appearance } from 'react-native'; // 기기 시스템 설정 읽기 (초기값 설정용)
// import AsyncStorage from '@react-native-async-storage/async-storage'; // 테마 설정을 저장하기 위해 설치 필요

// 1. AsyncStorage 설치 (아직 설치 안 되어 있다면)
// npx expo install @react-native-async-storage/async-storage

// 2. 테마 타입 정의
export type ThemeMode = 'light' | 'dark';

// 3. Context에 제공할 값의 타입 정의
interface ThemeContextType {
  theme: ThemeMode;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
}

// 4. Context 생성
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// 5. ThemeProvider 컴포넌트 생성
interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  // 초기 테마 상태를 기기의 시스템 설정에서 가져오거나 저장된 값에서 가져옴
  const [currentTheme, setCurrentTheme] = useState<ThemeMode>('light'); // 초기값은 'light'로 설정

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('appTheme');
        if (savedTheme === 'light' || savedTheme === 'dark') {
          setCurrentTheme(savedTheme);
        } else {
          // 저장된 테마가 없으면 기기 시스템 설정 따름 (선택 사항)
          const systemColorScheme = Appearance.getColorScheme();
          setCurrentTheme(systemColorScheme === 'dark' ? 'dark' : 'light');
        }
      } catch (e) {
        console.error("Failed to load theme from storage", e);
        const systemColorScheme = Appearance.getColorScheme();
        setCurrentTheme(systemColorScheme === 'dark' ? 'dark' : 'light');
      }
    };
    loadTheme();
  }, []);

  // 테마 변경 함수
  const setTheme = async (mode: ThemeMode) => {
    setCurrentTheme(mode);
    try {
      await AsyncStorage.setItem('appTheme', mode); // 테마 설정을 저장
    } catch (e) {
      console.error("Failed to save theme to storage", e);
    }
  };

  // 테마 토글 함수
  const toggleTheme = () => {
    setTheme(currentTheme === 'light' ? 'dark' : 'light');
  };

  // Context를 통해 제공할 값
  const contextValue: ThemeContextType = {
    theme: currentTheme,
    toggleTheme,
    setTheme,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

// 6. 커스텀 훅 생성: 테마 상태와 토글 함수를 쉽게 사용할 수 있도록
export const useAppTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useAppTheme must be used within a ThemeProvider');
  }
  return context;
}
