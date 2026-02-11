import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Pressable,
} from 'react-native';
import Modal from 'react-native-modal';
import { Image } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Zustand 전역변수 관리
import { useUserStore } from '@/scripts/store/userStore';
import { set } from 'date-fns';

export default function TopBar() {
    const [modalVisible, setModalVisible] = useState(false);
    const router = useRouter();

    const insets = useSafeAreaInsets();

    const user = useUserStore((state) => state.user);
    const selectedSpaceId = useUserStore((state) => state.selected_space);
    const setSelectedSpace = useUserStore((state) => state.setSelectedSpace);
    return (
        <View style={[styles.container, { paddingTop: insets.top + 20 }]}>
            {/* 왼쪽 영역 */}
            <TouchableOpacity
                style={styles.leftSection}
                onPress={() => {
                    setModalVisible(true);
                }}
            >
                {user?.spaces?.[selectedSpaceId]?.imageUrl === null ? (
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{user?.spaces[selectedSpaceId].name?.charAt(0)}</Text>
                    </View>
                ) : (
                    <Image source={{ uri: user?.spaces?.[selectedSpaceId]?.imageUrl }} style={styles.avatar} />
                )}
                <View style={styles.userInfo}>
                    <View style={styles.nameRow}>
                        <Text style={styles.name}>{user?.spaces[selectedSpaceId]?.name}</Text>
                        <Ionicons name="chevron-down" size={16} color="#333" />
                    </View>
                    <Text style={styles.email}>{user?.email}</Text>
                </View>
            </TouchableOpacity>

            {/* 오른쪽 아이콘 */}
            <View style={styles.rightSection}>
                <Pressable onPress={() => router.push('/notification')}>
                    <Feather name="bell" size={20} color="#333" style={styles.icon} />
                </Pressable>
                <Pressable onPress={() => router.push('/appSettings')}>
                    <Feather name="sliders" size={20} color="#333" />
                </Pressable>

            </View>

            {/* 모달 */}
            <Modal
                isVisible={modalVisible}
                onBackdropPress={() => setModalVisible(false)}
                animationIn="slideInUp"
                animationOut="slideOutDown"
                backdropOpacity={0.4}
                style={{ margin: 0, justifyContent: 'flex-end' }}
                useNativeDriver={false}
                hardwareAccelerated={false}
            >
                <View style={styles.modalContent}>
                    <Text style={styles.modalHeaderTitle}>공간 변경</Text>
                    <Text style={styles.userEmail}>{user?.email}</Text>

                    <View style={styles.spaceList}>
                        {user?.spaces?.map((space, i) => (
                            <Pressable
                                key={space.id}
                                style={styles.spaceItem}
                                onPress={() => {
                                    if (user?.spaces[i]?.type === 'personal' && selectedSpaceId !== i) {
                                        setModalVisible(false);
                                        setSelectedSpace(i);
                                        router.push(`/personal/`);
                                    } else if (user?.spaces[i]?.type === 'team' && selectedSpaceId !== i) {
                                        setModalVisible(false);
                                        setSelectedSpace(i);
                                        router.push(`/team/`);
                                    } else {
                                        setModalVisible(false);
                                    }
                                }}
                            >
                                {space.imageUrl === null || !space.imageUrl ? (
                                    <View style={styles.avatar}>
                                        <Text style={styles.avatarText}>{space.name.charAt(0)}</Text>
                                    </View>
                                ) : (
                                    <Image source={{ uri: space.imageUrl }} style={styles.avatar} />
                                )}
                                <Text style={styles.spaceName}>{space.name}</Text>
                                {selectedSpaceId === i && (
                                    <Text style={styles.checkmark}>✓</Text>
                                )}
                            </Pressable>
                        ))}
                    </View>

                    <Pressable style={styles.addSpaceButton} onPress={() => {
                        setModalVisible(false);
                        router.push('/addTeamSpace')
                    }}>
                        <Text style={styles.addSpaceButtonText}>새로운 공간 추가하기</Text>
                    </Pressable>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        backgroundColor: 'white',
    },
    leftSection: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 36,
        height: 36,
        borderRadius: 8,
        backgroundColor: '#eee',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    avatarText: {
        fontWeight: 'bold',
        fontSize: 14,
    },
    userInfo: {
        justifyContent: 'center',
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    name: {
        fontWeight: 'bold',
        fontSize: 14,
        marginRight: 4,
    },
    email: {
        fontSize: 12,
        color: '#888',
    },
    rightSection: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    icon: {
        marginRight: 12,
    },
    modalContent: {
        backgroundColor: 'white',
        borderTopRightRadius: 10,
        borderTopLeftRadius: 10,
        paddingHorizontal: 20,
        paddingBottom: 50,
        paddingTop: 10,
        width: '100%',
        alignSelf: 'center',
        // Shadow for iOS
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        // Elevation for Android
        elevation: 5,
    },
    modalHeaderTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
        marginBottom: 4,
    },
    userEmail: {
        fontSize: 14,
        color: '#888',
        textAlign: 'center',
        marginBottom: 20,
    },
    spaceList: {
        // No specific styling needed here, items will stack
    },
    spaceItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    avatar: {
        width: 30,
        height: 30,
        borderRadius: 4,
        backgroundColor: '#f0f0f0', // Light grey background for initial letter
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
        overflow: 'hidden', // Ensure image respects border radius
    },
    avatarText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#555',
    },
    spaceName: {
        flex: 1, // Take up remaining space
        fontSize: 16,
        color: '#333',
    },
    checkmark: {
        fontSize: 20,
        color: '#007AFF', // Standard iOS blue for checkmark
        marginLeft: 10,
    },
    addSpaceButton: {
        backgroundColor: '#007AFF', // Blue button color
        borderRadius: 8,
        paddingVertical: 14,
        marginTop: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },
    addSpaceButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});