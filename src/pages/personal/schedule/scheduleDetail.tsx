import React, { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import {
    View, Text, StyleSheet, Pressable, ScrollView, Dimensions, TextInput,
} from 'react-native';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUserStore } from '@/scripts/store/userStore';
import { scheduleColors } from '@/scripts/color/scheduleColor';
import Modal from 'react-native-modal';

const { width: screenWidth } = Dimensions.get('window');

interface ScheduleItem {
    id: string;
    name: string;
    startTime: string;
    endTime: string;
    color?: string;
    hourlyWage?: number;
    memo?: string;
    memberId?: string;
    type: string;
    teamId?: string;
}

const PersonalScheduleDetail: React.FC = () => {
    const searchParams = useLocalSearchParams();
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();

    const [schedule, setSchedule] = useState<ScheduleItem | null>(null);
    const user = useUserStore((state) => state.user);
    const selected_space = useUserStore((state) => state.selected_space);
    const space_type = user?.spaces[selected_space]?.type;
    const [modalVisible, setModalVisible] = useState(false);
    const [isEditingMemo, setIsEditingMemo] = useState(false);
    const [editedMemo, setEditedMemo] = useState('');

    // 1. schedule.teamId에 해당하는 팀 공간을 user.spaces에서 찾는다
    const teamSpaceFromSchedule = schedule?.type === 'team'
        ? user.spaces.find(space => space.id === schedule.teamId)
        : null;

    // 2. 교대 요청 대상자 목록을 이 변수로 지정
    const shiftTargetMembers = space_type === 'team'
        ? user.spaces[selected_space]?.members || []
        : teamSpaceFromSchedule?.members || [];

    useEffect(() => {
        // 1) 기존 방식: schedule JSON을 query로 전달받는 경우
        if (searchParams.schedule) {
            try {
                const parsedSchedule: ScheduleItem = JSON.parse(decodeURIComponent(searchParams.schedule as string));
                setSchedule(parsedSchedule);
                setEditedMemo(parsedSchedule.memo || '');
                setIsEditingMemo(false);
                return;
            } catch (error) {
                console.error('Failed to parse schedule param:', error);
            }
        }

        // 2) 라우트 파라미터(id)로 전달받는 경우: 현재 선택된 space에서 schedule을 찾아봄
        const scheduleId = (searchParams.id as string | undefined) ?? undefined;
        const currentSpace = user?.spaces?.[selected_space];
        const found = scheduleId ? currentSpace?.schedules?.find((s: any) => s.id === scheduleId) : null;
        if (found) {
            setSchedule(found as ScheduleItem);
            setEditedMemo((found as any).memo || '');
            setIsEditingMemo(false);
            return;
        }

        setSchedule(null);
    }, [searchParams.schedule, searchParams.id, user, selected_space]);

    const isValidDate = (d: Date | null | undefined) => d instanceof Date && !isNaN(d.getTime());
    const isMyTeamSchedule = space_type === 'team' && schedule?.memberId === user.id;
    const isMySchedule = space_type === 'personal' && schedule?.type === "team"
    const isShiftAbled = isMyTeamSchedule || isMySchedule

    if (!schedule) {
        return null;
    }

    const startDateTime = schedule.startTime ? new Date(schedule.startTime) : null;
    const endDateTime = schedule.endTime ? new Date(schedule.endTime) : null;

    const formattedDate = isValidDate(startDateTime)
        ? format(startDateTime as Date, 'yyyy년 M월 d일 (EEE)', { locale: ko })
        : '날짜 정보 없음';
    const formattedTimeRange = isValidDate(startDateTime) && isValidDate(endDateTime)
        ? `${format(startDateTime as Date, 'HH:mm')} - ${format(endDateTime as Date, 'HH:mm')}`
        : '시간 정보 없음';

    const durationMs = isValidDate(startDateTime) && isValidDate(endDateTime)
        ? endDateTime.getTime() - startDateTime.getTime()
        : 0;
    const durationHours = durationMs / (1000 * 60 * 60);

    const displayDuration = Number.isInteger(durationHours)
        ? durationHours.toString()
        : durationHours.toFixed(1);

    const totalPrice = schedule.hourlyWage && durationHours > 0
        ? Math.floor(schedule.hourlyWage * durationHours)
        : 0;

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.header}>
                <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={24} color="#333" />
                </Pressable>
                <Text style={styles.headerDate}>{formattedDate}</Text>
                <View style={styles.backButtonPlaceholder} />
            </View>

            <View style={styles.workplaceSection}>
                <View style={[styles.workplaceColorBar, { backgroundColor: scheduleColors[schedule.color]?.main || '#ccc' }]} />
                <Text style={styles.workplaceName}>{schedule.name || '알 수 없는 근무지'}</Text>
            </View>

            <View style={styles.timeSection}>
                <Text style={styles.timeRange}>{formattedTimeRange}</Text>
                <Text style={styles.durationText}>{displayDuration}시간</Text>
            </View>

            <Pressable
                style={[
                    styles.requestShiftButton,
                    isShiftAbled ? { backgroundColor: '#FFEE58' } : { backgroundColor: '#ccc' },
                ]}
                disabled={!isShiftAbled}
                onPress={() => setModalVisible(true)}
            >
                <Text style={styles.requestShiftButtonText}>근무 교대 요청하기</Text>
            </Pressable>

            <View style={styles.financeSection}>
                <View style={styles.financeItem}>
                    <Text style={styles.financeLabel}>총액</Text>
                    <Text style={styles.financeValue}>{totalPrice.toLocaleString()}원</Text>
                </View>
                <View style={styles.financeItem}>
                    <Text style={styles.financeLabel}>시급</Text>
                    <Text style={styles.financeValue}>{typeof schedule.hourlyWage === 'number' ? schedule.hourlyWage.toLocaleString() : '0'}원</Text>
                </View>
            </View>

            <View style={styles.memoSection}>
                <View style={styles.memoHeader}>
                    <Text style={styles.memoTitle}>메모</Text>
                    <Pressable
                        onPress={() => {
                            if (isEditingMemo && schedule) {
                                setSchedule({ ...schedule, memo: editedMemo });
                            }
                            setIsEditingMemo((prev) => !prev);
                        }}
                    >
                        {isEditingMemo ? <Text style={{ color: "#528cf8ff" }}>저장</Text> : <Ionicons name='pencil' size={18} color="#666" />}
                    </Pressable>
                </View>
                {isEditingMemo ? (
                    <TextInput
                        value={editedMemo}
                        onChangeText={setEditedMemo}
                        multiline
                        style={styles.memoInput}
                        placeholder="메모를 입력하세요"
                    />
                ) : (
                    <Text style={styles.memoContent}>
                        {schedule.memo && schedule.memo.trim() !== '' ? schedule.memo : '추가한 메모가 없습니다.'}
                    </Text>
                )}
            </View>

            <Pressable
                style={[styles.deleteButton, { marginBottom: insets.bottom + 20 }]}
                onPress={() => {
                    console.log('삭제하기 눌림');
                }}
            >
                <Text style={styles.deleteButtonText}>삭제하기</Text>
            </Pressable>

            <Modal
                isVisible={modalVisible}
                onBackdropPress={() => setModalVisible(false)}
                onBackButtonPress={() => setModalVisible(false)}
                useNativeDriver
                hideModalContentWhileAnimating
                style={styles.bottomModal}
            >
                <View style={styles.modalContainer}>
                    <Text style={styles.modalTitle}>교대 요청할 사람 선택</Text>
                    <ScrollView>
                        {shiftTargetMembers
                            .filter(member => member.id !== user.id)
                            .map(member => (
                                <View key={member.id} style={styles.memberRow}>
                                    <Text style={styles.memberName}>{member.name || '이름 없음'}</Text>
                                    <Pressable
                                        style={styles.swapButton}
                                        onPress={() => {
                                            setModalVisible(false);
                                            Alert.alert('요청 완료', `${member.name}님에게 교대 요청을 보냈습니다.`);
                                        }}
                                    >
                                        <Text style={styles.swapButtonText}>교대 요청</Text>
                                    </Pressable>
                                </View>
                            ))}
                    </ScrollView>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8f8f8', paddingHorizontal: 20 },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#eee', marginBottom: 20,
    },
    backButton: { padding: 5 },
    headerDate: { fontSize: 16, fontWeight: 'bold', color: '#333' },
    backButtonPlaceholder: { width: 34 },
    workplaceSection: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    workplaceColorBar: { width: 8, height: 35, borderRadius: 4, marginRight: 10, marginTop: 5 },
    workplaceName: { fontSize: 24, fontWeight: 'bold', color: '#333' },
    timeSection: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 20 },
    timeRange: { fontSize: 18, fontWeight: '600', color: '#333', marginRight: 8 },
    durationText: { fontSize: 16, color: '#666' },
    requestShiftButton: {
        paddingVertical: 15, borderRadius: 8, alignItems: 'center', justifyContent: 'center',
        marginBottom: 30, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1, shadowRadius: 2,
    },
    requestShiftButtonText: { fontSize: 16, fontWeight: 'bold', color: '#333' },
    financeSection: {
        backgroundColor: 'white', borderRadius: 10, padding: 20, marginBottom: 20,
        elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05, shadowRadius: 2,
    },
    financeItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
    financeLabel: { fontSize: 16, color: '#666' },
    financeValue: { fontSize: 18, fontWeight: 'bold', color: '#333' },
    memoSection: {
        backgroundColor: 'white', borderRadius: 10, padding: 20,
        elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05, shadowRadius: 2,
    },
    memoHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    memoTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
    memoContent: { fontSize: 14, color: '#666', lineHeight: 20 },
    memoInput: {
        fontSize: 14, color: '#333', borderWidth: 1, borderColor: '#ccc',
        borderRadius: 8, padding: 10, lineHeight: 20, minHeight: 80, backgroundColor: '#fff',
    },
    closeButtonTop: { position: 'absolute', top: 60, left: 20, padding: 5, zIndex: 10 },
    errorText: { textAlign: 'center', color: 'red', fontSize: 16, marginTop: 100, paddingHorizontal: 20 },
    deleteButton: {
        backgroundColor: 'rgba(255, 108, 95, 1)', paddingVertical: 14, borderRadius: 8,
        alignItems: 'center', justifyContent: 'center', marginTop: 20,
    },
    deleteButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
    bottomModal: { justifyContent: 'flex-end', margin: 0 },
    modalContainer: {
        backgroundColor: 'white', borderTopLeftRadius: 16, borderTopRightRadius: 16,
        padding: 20, maxHeight: '60%',
    },
    modalTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 12 },
    memberRow: {
        flexDirection: 'row', justifyContent: 'space-between',
        alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#eee',
    },
    memberName: { fontSize: 16, color: '#333' },
    swapButton: { backgroundColor: '#007AFF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
    swapButtonText: { color: 'white', fontWeight: 'bold' },
});

export default PersonalScheduleDetail;
