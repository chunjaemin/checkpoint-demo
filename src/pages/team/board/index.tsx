import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function TeamBoardPlaceholderPage() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>게시판</Text>
      <Text style={styles.subtitle}>준비 중입니다.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
});

