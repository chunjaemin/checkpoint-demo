// 건의사항 작성 페이지 (샘플)
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function SuggestionWriteScreen() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleSubmit = () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert('제목과 내용을 모두 입력해주세요.');
      return;
    }
    Alert.alert('건의 등록 완료!', '실제 저장 로직은 서버 연동 필요');
    router.back();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>건의사항 작성</Text>
        </View>
      </View>
      {/* AI로 작성하기 버튼 */}
      <View style={styles.aiButtonRow}>
        <View style={{ flex: 1 }} />
        <TouchableOpacity style={styles.aiButton} onPress={() => Alert.alert('AI로 작성하기 기능은 준비 중입니다.') }>
          <Text style={styles.aiButtonText}>AI로 작성하기</Text>
        </TouchableOpacity>
      </View>
      <TextInput
        style={styles.input}
        placeholder="제목을 입력하세요"
        value={title}
        onChangeText={setTitle}
        maxLength={50}
      />
      <TextInput
        style={styles.textarea}
        placeholder="내용을 입력하세요"
        value={content}
        onChangeText={setContent}
        multiline
        numberOfLines={8}
        textAlignVertical="top"
      />
      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>등록하기</Text>
      </TouchableOpacity>
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
  aiButtonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  aiButton: {
    backgroundColor: '#f2f6ff',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 16,
    marginRight: 2,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#77B6FF',
  },
  aiButtonText: {
    color: '#1976d2',
    fontWeight: 'bold',
    fontSize: 13,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#eee',
  },
  textarea: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    minHeight: 120,
    borderWidth: 1,
    borderColor: '#eee',
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#3689FF',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
