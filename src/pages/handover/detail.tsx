import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Modal, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, Entypo } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useHandOverStore } from '@/scripts/store/handoverStore';

export default function NoteDetail() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const noteId = (params.noteId ?? params.id) as string | undefined;
  const tabId = params.tabId as string | undefined;
  const findNoteById = useHandOverStore(state => state.findNoteById);
  const note = findNoteById(tabId, noteId);
  const insets = useSafeAreaInsets();

  const [menuVisible, setMenuVisible] = useState(false);

  const handleEdit = () => {
    setMenuVisible(false);
    router.push({
      pathname: '/handover/editHandover',
      params: { noteId: noteId, tabId: tabId },
    });
    console.log("수정 클릭"); // 여기에 수정 페이지 이동 등 구현 가능
  };

  const handleDelete = () => {
    setMenuVisible(false);
    console.log("삭제 클릭"); // 삭제 로직은 추후 구현
  };

  if (!note) {
    return (
      <View style={styles.centered}>
        <Text>메모를 찾을 수 없습니다.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 상단 헤더 */}
      <View style={[styles.header, { marginTop: insets.top }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={28} color="#333" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>인수 인계</Text>

        <TouchableOpacity onPress={() => setMenuVisible(true)}>
          <Entypo name="dots-three-vertical" size={20} color="#333" />
        </TouchableOpacity>
      </View>

      {/* 본문 */}
      <ScrollView style={{ marginTop: 24 }}>
        <Text style={styles.title}>{note.title}</Text>
        <Text style={styles.content}>{note.content}</Text>
      </ScrollView>

      {/* 옵션 메뉴 (모달 형태) */}
      <Modal
        transparent
        visible={menuVisible}
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setMenuVisible(false)}>
          <View style={styles.menuBox}>
            <TouchableOpacity style={styles.menuItem} onPress={handleEdit}>
              <Ionicons name="create-outline" size={18} color="#333" style={{ marginRight: 8 }} />
              <Text style={styles.menuText}>수정</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={handleDelete}>
              <Ionicons name="trash-outline" size={18} color="#cc3333" style={{ marginRight: 8 }} />
              <Text style={[styles.menuText, { color: '#cc3333' }]}>삭제</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingHorizontal: 20 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#222',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#555',
  },
  content: {
    fontSize: 16,
    lineHeight: 24,
    color: '#444',
  },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // 모달 스타일
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 60,
    paddingRight: 20,
  },
  menuBox: {
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    paddingVertical: 8,
    width: 140,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  menuText: {
    fontSize: 16,
    color: '#333',
  },
});
