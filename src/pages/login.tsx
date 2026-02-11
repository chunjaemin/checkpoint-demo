import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  SafeAreaView,
  StatusBar,
} from 'react-native';

import { initializeKakaoSDK } from '@react-native-kakao/core';
import { login } from '@react-native-kakao/user';

export default function Login() {
  const handleLoginPress = () => {
    initializeKakaoSDK("3673c3beb4ecc6a9f12b78682130eab0");
    login();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.container}>
        <Text style={styles.title}>Check Point</Text>

        <TouchableOpacity style={styles.kakaoButton} onPress={handleLoginPress}>
          <Image
            source={{
              uri: 'https://developers.kakao.com/assets/img/about/logos/kakaolink/kakaolink_btn_medium.png',
            }}
            style={styles.logo}
          />
          <Text style={styles.buttonText}>카카오로 로그인</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 40,
    color: '#333',
  },
  kakaoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE500',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 6,
    elevation: 3,
  },
  logo: {
    width: 24,
    height: 24,
    marginRight: 10,
    resizeMode: 'contain',
  },
  buttonText: {
    fontSize: 16,
    color: '#3C1E1E',
    fontWeight: 'bold',
  },
});
