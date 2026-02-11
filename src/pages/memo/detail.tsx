import React, { useState, useEffect } from 'react';
import {
    View, Text, TextInput, StyleSheet, TouchableOpacity,
    Alert, KeyboardAvoidingView, Platform, ScrollView, Modal, Pressable
} from 'react-native';
import { Ionicons, Entypo } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemoStore } from '@/scripts/store/useMemoStore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import dayjs from 'dayjs';

export default function MemoDetail() {
    const { noteId } = useLocalSearchParams();
    const findNoteById = useMemoStore(state => state.findNoteById);
    const note = findNoteById(noteId);
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const [menuVisible, setMenuVisible] = useState(false);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

    useEffect(() => {
        if (note) {
            setTitle(note.title);
            setContent(note.content);
        }
    }, [note]);

    const handleDelete = () => {
        setMenuVisible(false);
        console.log('삭제됨');
    };

    const handleEdit = () => {
        setMenuVisible(false);
        router.push({
            pathname: '/memo/editMemo',
            params: { noteId },
        });
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

                    <Text style={styles.headerTitle}>메모 상세</Text>

                    <TouchableOpacity onPress={() => setMenuVisible(true)}>
                        <Entypo name="dots-three-vertical" size={20} color="#333" />
                    </TouchableOpacity>
                </View>

                <Text style={styles.date}>
                    작성일: {dayjs(note.createdAt).format('YYYY.MM.DD HH:mm')}
                </Text>

                <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 80 }}>
                    <TextInput
                        style={styles.titleInput}
                        value={title}
                        editable={false}
                        placeholder="제목"
                    />
                    <TextInput
                        style={styles.contentInput}
                        value={content}
                        editable={false}
                        multiline
                        placeholder="내용"
                    />
                </ScrollView>

                {/* 메뉴 모달 */}
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
    date: {
        fontSize: 12,
        color: '#888',
        marginBottom: 16,
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
