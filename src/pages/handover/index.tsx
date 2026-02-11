import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Modal, TextInput, Alert } from 'react-native';
import { useHandOverStore } from '@/scripts/store/handoverStore';
import { useUserStore } from '@/scripts/store/userStore';
import { handoverData } from '@/scripts/dummyData/handOverData';
import { router, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HandoverPage() {
  const { handovers, setHandovers } = useHandOverStore();

  const user = useUserStore((state) => state.user);
  const selectedSpaceIndex = useUserStore((state) => state.selected_space);
  const selectedSpaceId = user.spaces[selectedSpaceIndex].id;
  const [currentHandover, setCurrentHandover] = useState(null);
  const [selectedTabId, setSelectedTabId] = useState<string | null>(null);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newTabName, setNewTabName] = useState('');

  const insets = useSafeAreaInsets();
  const nav = useRouter();

  useEffect(() => {
    if (!handovers && setHandovers) {
      setHandovers(handoverData);
    }
  }, [handovers]);

  useEffect(() => {
    if (handovers && selectedSpaceId !== null) {
      const handover = handovers.spaces.find(space => space.id === selectedSpaceId);
      setCurrentHandover(handover);

      if (handover) {
        // ✅ 기존 선택한 탭 ID가 여전히 존재하면 유지, 아니면 첫 번째 탭으로
        const tabExists = handover.handover.tabs.some(tab => tab.id === selectedTabId);
        setSelectedTabId(tabExists ? selectedTabId : handover.handover.tabs[0]?.id ?? null);
      }
    }
  }, [handovers, selectedSpaceId]);

  if (!currentHandover) {
    return (
      <View style={styles.centered}><Text>팀 데이터를 불러오는 중...</Text></View>
    );
  }

  const selectedTab = currentHandover.handover.tabs.find(tab => tab.id === selectedTabId);

  const handleAddTab = () => {
    if (!newTabName.trim()) {
      Alert.alert('알림', '탭 이름을 입력해주세요.');
      return;
    }

    const newTab = {
      id: `tab_${Date.now()}`,
      name: newTabName.trim(),
      notes: [],
    };

    // ✅ 전역 상태 업데이트
    if (handovers && selectedSpaceId) {
      const updatedSpaces = [...handovers.spaces];
      const spaceIndex = updatedSpaces.findIndex(space => space.id === selectedSpaceId);

      if (spaceIndex !== -1) {
        const oldTabs = updatedSpaces[spaceIndex].handover.tabs;
        const newTabs = [...oldTabs, newTab];

        updatedSpaces[spaceIndex] = {
          ...updatedSpaces[spaceIndex],
          handover: {
            ...updatedSpaces[spaceIndex].handover,
            tabs: newTabs
          }
        };

        // 전역 상태 저장
        setHandovers({
          ...handovers,
          spaces: updatedSpaces
        });

        // 현재 핸드오버도 업데이트
        setCurrentHandover(updatedSpaces[spaceIndex]);
        setSelectedTabId(newTab.id);
        setNewTabName('');
        setIsModalVisible(false);
      }
    }
  };
  return (
    <View style={[styles.container, { marginTop: insets.top }]}>
      {/* 상단 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => nav.back()}>
          <Ionicons name="chevron-back" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>인수 인계</Text>
        <View style={{ width: 28 }} />
      </View>

      <View style={styles.tabs}>
        {currentHandover.handover.tabs.map(tab => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tab, selectedTabId === tab.id && styles.tabActive]}
            onPress={() => setSelectedTabId(tab.id)}
          >
            <Text style={selectedTabId === tab.id ? styles.tabTextActive : styles.tabText}>
              {tab.name}
            </Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={styles.tab} onPress={() => setIsModalVisible(true)}>
          <Text style={styles.tabText}>+</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={{ marginTop: 12 }}>
        {selectedTab?.notes?.length > 0 ? (
          selectedTab.notes.map(note => (
            <TouchableOpacity key={note.id} style={styles.noteBox}
              onPress={() => {
                router.push({
                  pathname: '/handover/detail',
                  params: { noteId: note.id, tabId: selectedTabId }
                });
              }}>
              <Text style={styles.noteTitle}>{note.title}</Text>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyMessage}>메모가 없습니다</Text>
          </View>
        )}

        <TouchableOpacity style={styles.addNoteBtn}
          onPress={() => {
            router.push({
              pathname: '/handover/addHandover',
              params: { tabId: selectedTabId }
            });
          }}>
          <Text style={styles.addNoteText}>+ 새 메모 추가하기</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* 모달 */}
      <Modal
        transparent
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>새 탭 이름</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="탭 이름 입력"
              value={newTabName}
              onChangeText={setNewTabName}
            />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setIsModalVisible(false)}
              >
                <Text style={styles.modalCancelButtonText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={handleAddTab}
              >
                <Text style={styles.modalButtonText}>추가하기</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View >
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fafbfc', padding: 16 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  tabs: { flexDirection: 'row', marginBottom: 12 },
  tab: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#eee',
    marginRight: 8
  },
  tabActive: { backgroundColor: '#00006D' },
  tabText: { color: '#555' },
  tabTextActive: { color: 'white' },
  noteBox: {
    backgroundColor: '#EDEDED',
    borderRadius: 10,
    padding: 30,
    marginBottom: 12
  },
  noteTitle: { fontSize: 16, color: '#111' },
  addNoteBtn: {
    backgroundColor: '#EDEDED',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginTop: 8
  },
  addNoteText: { color: '#777' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    width: '80%'
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12
  },
  modalInput: {
    fontSize: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginBottom: 16
  },
  modalButton: {
    backgroundColor: '#00006D',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    flex: 0.50,
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  modalCancelButton: {
    backgroundColor: '#E0E0E0',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    flex: 0.44,
  },
  modalCancelButtonText: {
    color: '#555',
    fontWeight: '600',
    fontSize: 16
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});
