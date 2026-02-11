import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemoStore } from '@/scripts/store/useMemoStore';
import { useUserStore } from '@/scripts/store/userStore';
import { memoData } from '@/scripts/dummyData/memoData';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import dayjs from 'dayjs';

export default function MemoList() {
    const { memo, setMemo } = useMemoStore();
    const user = useUserStore((state) => state.user);
    const selectedSpaceIndex = useUserStore((state) => state.selected_space);
    const selectedSpaceId = user?.spaces[selectedSpaceIndex]?.id;

    const router = useRouter();
    const [searchText, setSearchText] = useState('');

    const insets = useSafeAreaInsets();

    useEffect(() => {
        if (!memo) {
            setMemo(memoData);
        }
    }, [memo]);

    if (!memo) {
        return (
            <View style={styles.centered}>
                <Text>메모 데이터를 불러오는 중...</Text>
            </View>
        );
    }

    const currentSpace = memo.spaces.find(space => space.spaceId === selectedSpaceId);
    const notes = currentSpace ? currentSpace.notes : [];

    const filteredNotes = notes.filter(note =>
        note.title.includes(searchText) || note.content.includes(searchText)
    );

    const now = dayjs();
    const within7Days = filteredNotes.filter(note =>
        now.diff(dayjs(note.createdAt), 'day') <= 7
    );
    const within30Days = filteredNotes.filter(note =>
        now.diff(dayjs(note.createdAt), 'day') > 7 && now.diff(dayjs(note.createdAt), 'day') <= 30
    );

    return (
        <View style={[styles.container, { marginTop: insets.top }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="chevron-back" size={28} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>개인 메모</Text>
                <View style={{ width: 28 }} />
            </View>

            {/* Search */}
            <View style={styles.searchBox}>
                <Ionicons name="search" size={20} color="#999" style={{ marginRight: 8 }} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="검색"
                    value={searchText}
                    onChangeText={setSearchText}
                />
            </View>

            {/* Lists */}
            <ScrollView>
                {within7Days.length > 0 && (
                    <View style={{ marginBottom: 24 }}>
                        <Text style={styles.sectionTitle}>이전 7일</Text>
                        {within7Days.map(note => (
                            <TouchableOpacity
                                key={note.id}
                                style={styles.memoBox}
                                onPress={() => router.push({ pathname: './memo/detail', params: { noteId: note.id } })}
                            >
                                <Text style={styles.memoTitle}>{note.title}</Text>
                                <Text style={styles.memoDate}>{dayjs(note.createdAt).format('YYYY.M.D')}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
                {within30Days.length > 0 && (
                    <View>
                        <Text style={styles.sectionTitle}>이전 30일</Text>
                        {within30Days.map(note => (
                            <TouchableOpacity
                                key={note.id}
                                style={styles.memoBox}
                                onPress={() => router.push({ pathname: './memo/detail', params: { noteId: note.id } })}
                            >
                                <Text style={styles.memoTitle}>{note.title}</Text>
                                <Text style={styles.memoDate}>{dayjs(note.createdAt).format('YYYY.M.D')}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
            </ScrollView>

            {/* Floating Button */}
            <TouchableOpacity
                style={styles.fab}
                onPress={() => router.push({ pathname: '/memo/addMemo', params: { spaceId: selectedSpaceId } })}
            >
                <Ionicons name="create-outline" size={24} color="#fff" />
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
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F2F2F2',
        borderRadius: 8,
        paddingHorizontal: 12,
        marginBottom: 20,
    },
    searchInput: {
        flex: 1,
        height: 40,
        color: '#333'
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
        color: '#333'
    },
    memoBox: {
        backgroundColor: '#fafafa',
        borderRadius: 10,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 2,
    },
    memoTitle: { fontSize: 16, color: '#333', marginBottom: 4 },
    memoDate: { fontSize: 12, color: '#777' },
    fab: {
        position: 'absolute',
        right: 20,
        bottom: 20,
        backgroundColor: '#00006D',
        borderRadius: 30,
        padding: 14,
        alignItems: 'center',
        justifyContent: 'center'
    },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
