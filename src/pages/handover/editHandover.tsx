import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ScrollView, KeyboardAvoidingView, Platform
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useHandOverStore } from '@/scripts/store/handoverStore';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function EditHandover() {
  const { noteId, tabId } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const findNoteById = useHandOverStore(state => state.findNoteById);
  const note = findNoteById(tabId, noteId);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
    }
  }, [note]);

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert('제목을 입력해주세요.');
      return;
    }

    // 실제 저장은 생략 (updateNote 사용 X)
    console.log('수정된 인수인계:', {
      id: note.id,
      tabId,
      title,
      content,
    });

    Alert.alert('수정 완료', '인수인계 메모가 저장되었습니다.');
    router.back();
  };

  if (!note) {
    return (
      <View style={styles.centered}>
        <Text>메모를 찾을 수 없습니다.</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.container, { marginTop: insets.top }]}>
        {/* 상단 헤더 */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={28} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>인수인계 수정</Text>
          <View style={{ width: 28 }} />
        </View>

        <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
          <TextInput
            style={styles.titleInput}
            value={title}
            onChangeText={setTitle}
            placeholder="제목을 입력하세요"
          />
          <TextInput
            style={styles.contentInput}
            value={content}
            onChangeText={setContent}
            placeholder="인수인계 내용을 입력하세요"
            multiline
          />
        </ScrollView>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>수정 완료</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  titleInput: {
    fontSize: 22,
    fontWeight: '700',
    color: '#222',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingVertical: 4,
  },
  contentInput: {
    fontSize: 16,
    color: '#444',
    lineHeight: 24,
    textAlignVertical: 'top',
    flex: 1,
    minHeight: 300,
  },
  saveButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#1e88e5',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
