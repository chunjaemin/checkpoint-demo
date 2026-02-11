// ✅ AddHandover.tsx

import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useHandOverStore } from '@/scripts/store/handoverStore';
import { useUserStore } from '@/scripts/store/userStore';

export default function AddHandover() {
  const { tabId } = useLocalSearchParams<{ tabId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const setHandovers = useHandOverStore((state) => state.setHandovers);
  const handovers = useHandOverStore((state) => state.handovers);
  const user = useUserStore((state) => state.user);
  const selectedSpaceIndex = useUserStore((state) => state.selected_space);

  const handleSave = () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert('알림', '제목과 내용을 모두 입력해주세요.');
      return;
    }

    const selectedSpaceId = user?.spaces[selectedSpaceIndex]?.id;
    if (!handovers || !selectedSpaceId) return;

    const updatedSpaces = [...handovers.spaces];
    const spaceIndex = updatedSpaces.findIndex((space) => space.id === selectedSpaceId);
    if (spaceIndex === -1) return;

    const tabIndex = updatedSpaces[spaceIndex].handover.tabs.findIndex((tab: { id: string }) => tab.id === tabId);
    if (tabIndex === -1) return;

    const newNote = {
      id: Date.now().toString(),
      tabId,
      title: title.trim(),
      content: content.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    updatedSpaces[spaceIndex].handover.tabs[tabIndex].notes.push(newNote);
    setHandovers({ ...handovers, spaces: updatedSpaces });
    Alert.alert('완료', '메모가 저장되었습니다.');
    router.back();
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.header}>
              <TouchableOpacity onPress={() => router.back()}>
                <Ionicons name="chevron-back" size={24} color="#333" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>인수인계 메모 작성</Text>
              <TouchableOpacity onPress={handleSave}>
                <Text style={styles.doneText}>저장</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.titleInput}
              placeholder="제목을 입력하세요"
              value={title}
              onChangeText={setTitle}
            />

            <TextInput
              style={styles.contentInput}
              placeholder="내용을 입력하세요"
              value={content}
              onChangeText={setContent}
              multiline
            />
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingHorizontal: 20 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16,
  },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#333' },
  titleInput: {
    fontSize: 20, fontWeight: '500', color: '#333', marginBottom: 12, borderBottomWidth: 1, borderBottomColor: '#ddd', paddingVertical: 8,
  },
  contentInput: {
    fontSize: 16, color: '#333', flex: 1, textAlignVertical: 'top', minHeight: 200,
  },
  doneText: {
    fontSize: 16, color: '#007AFF', fontWeight: '500',
  },
});
