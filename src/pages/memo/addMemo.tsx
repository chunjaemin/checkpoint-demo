import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AddMemo() {
    const router = useRouter();
    const { spaceId } = useLocalSearchParams();

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const insets = useSafeAreaInsets();

    const handleSave = () => {
        if (!title.trim() || !content.trim()) {
            Alert.alert('알림', '제목과 내용을 모두 입력해주세요.');
            return;
        }

        const newMemo = {
            id: Date.now().toString(),
            title: title.trim(),
            content: content.trim(),
            spaceId: spaceId ?? '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        console.log('🚀 새 메모:', newMemo);

        router.back();
    };

    return (
        <View style={[styles.container, { marginTop: insets.top }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="chevron-back" size={28} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>새 메모</Text>
                <View style={{ width: 28 }} />
            </View>

            {/* Title input */}
            <TextInput
                style={styles.titleInput}
                placeholder="제목을 입력해주세요"
                placeholderTextColor="#aaa"
                value={title}
                onChangeText={setTitle}
            />

            {/* Content input */}
            <TextInput
                style={styles.contentInput}
                placeholder="내용을 입력해주세요"
                placeholderTextColor="#aaa"
                value={content}
                onChangeText={setContent}
                multiline
            />

            {/* 완료 버튼 */}
            <TouchableOpacity style={styles.doneButton} onPress={handleSave}>
                <Text style={styles.doneButtonText}>완료</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff', padding: 20 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
    },
    titleInput: {
        fontSize: 20,
        fontWeight: '500',
        color: '#333',
        marginBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
        paddingVertical: 8,
    },
    contentInput: {
        fontSize: 16,
        color: '#333',
        flex: 1,
        textAlignVertical: 'top',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingVertical: 8,
    },
    doneButton: {
        backgroundColor: '#00006D',
        borderRadius: 8,
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: 20,
    },
    doneButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
