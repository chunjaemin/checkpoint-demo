import { Redirect } from 'expo-router';
import { useEffect } from 'react';
// import { getKeyHashAndroid } from '@react-native-kakao/core'; 카카오로그인 안드로이드 key해싱값 확인용

export default function Index() {
  // useEffect(()=>{
  //   getKeyHashAndroid().then(console.log);
  // })
  return <Redirect href="/personal" />;
  // return <Redirect href="/aiTest2" />;
  // return <Redirect href="/login" />;
}


