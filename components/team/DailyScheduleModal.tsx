// DailyScheduleModalContent.tsx
import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Dimensions } from 'react-native';
import { format } from 'date-fns';
import { useCalTypeStore } from '@/scripts/store/teamStore';
import { useRouter } from 'expo-router';
import { scheduleColors } from '@/scripts/color/scheduleColor';

const { height: screenHeight } = Dimensions.get('window');

interface ScheduleItem {
    id: string;
    name: string;
    startTime: string; // ISO string or similar
    endTime: string;   // ISO string or similar
    color?: string; // Optional color for the left bar
    // ScheduleDetail에서 필요한 추가 필드도 여기에 포함되어야 합니다.
    // 예를 들어, ScheduleDetailItem에 hourlyWage, memo가 있다면 여기에 추가:
    hourlyWage?: number; // ScheduleDetailItem에 있는 경우
    memo?: string;       // ScheduleDetailItem에 있는 경우
}

interface DailyScheduleModalContentProps {
    selectedDate: Date | null;
    dailySchedules: ScheduleItem[];
    onAddSchedule: (date: Date) => void;
    onClose: () => void;
}

const DailyScheduleModalContent: React.FC<DailyScheduleModalContentProps> = ({
    selectedDate,
    dailySchedules,
    onAddSchedule,
    onClose
}) => {
    const router = useRouter();
    const setCalType = useCalTypeStore((state) => state.setCalType);

    if (!selectedDate) {
        return null;
    }

    const formattedDate = format(selectedDate, 'M월 d일');

    // 각 스케줄 항목 클릭 시 ScheduleDetail 페이지로 이동하는 핸들러
    const handleScheduleItemClick = (schedule: ScheduleItem) => {
        // router.push의 params는 쿼리 파라미터로 처리되므로, 객체는 직렬화해야 합니다.
        const scheduleParam = encodeURIComponent(JSON.stringify(schedule));
        router.push({
            pathname: '/detail/personalScheduleDetail', // ScheduleDetail 스크린의 경로
            params: { schedule: scheduleParam },
        });
        onClose(); // 모달 닫기
    };

    return (
        <View style={modalStyles.modalContainer}>
            <Text style={modalStyles.modalDate}>{formattedDate}</Text>

            <ScrollView style={modalStyles.scheduleList}>
                {dailySchedules.length > 0 ? (
                    dailySchedules.map((schedule) => {
                        const startTime = format(new Date(schedule.startTime), 'HH:mm');
                        const endTime = format(new Date(schedule.endTime), 'HH:mm');
                        const durationMs = new Date(schedule.endTime).getTime() - new Date(schedule.startTime).getTime();
                        const durationHours = durationMs / (1000 * 60 * 60);

                        return (
                            // 각 스케줄 항목을 Pressable로 감싸서 클릭 가능하게 만듭니다.
                            <Pressable
                                key={schedule.id}
                                style={modalStyles.scheduleItem}
                                onPress={() => handleScheduleItemClick(schedule)} // 클릭 이벤트 핸들러 연결
                            >
                                <View style={[modalStyles.scheduleColorBar, { backgroundColor: scheduleColors[schedule.color]?.main || '#ccc' }]} />
                                <View style={modalStyles.scheduleDetails}>
                                    <Text style={modalStyles.scheduleName}>{schedule.name}</Text>
                                    <Text style={modalStyles.schedulePrice}>
                                        {schedule.hourlyWage?.toLocaleString() || '0'}원
                                    </Text>
                                </View>
                                <View style={modalStyles.scheduleTime}>
                                    <Text style={modalStyles.scheduleTimeRange}>{startTime} - {endTime}</Text>
                                    <Text style={modalStyles.scheduleDuration}>{durationHours}시간</Text>
                                </View>
                            </Pressable>
                        );
                    })
                ) : (
                    <Text style={modalStyles.noScheduleText}>이 날짜에는 일정이 없습니다.</Text>
                )}
            </ScrollView>

            <Pressable
                style={modalStyles.addScheduleButton}
                onPress={() => {
                    setCalType("편집")
                }}
            >
                <Text style={modalStyles.addScheduleButtonText}>일정 추가하기</Text>
            </Pressable>
        </View>
    );
};

const modalStyles = StyleSheet.create({
    modalContainer: {
        backgroundColor: 'white',
        padding: 20,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        width: '100%',
        maxHeight: screenHeight * 0.75,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 10,
    },
    closeButton: {
        position: 'absolute',
        top: 15,
        right: 20,
        padding: 5,
        zIndex: 10,
    },
    closeButtonText: {
        fontSize: 18,
        color: '#666',
        fontWeight: 'bold',
    },
    modalDate: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
        color: '#333',
    },
    scheduleList: {
        maxHeight: screenHeight * 0.45,
        marginBottom: 20,
    },
    scheduleItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        borderRadius: 8,
        padding: 10,
        backgroundColor: '#fff', // 클릭 가능한 영역을 명확히 하기 위해 배경색 추가
        // shadowColor: '#000',
        // shadowOffset: { width: 0, height: 1 },
        // shadowOpacity: 0.05,
        // shadowRadius: 2,
        // elevation: 1,
    },
    scheduleColorBar: {
        width: 6,
        height: '100%', // 부모 Pressable의 높이를 따르도록 수정
        borderRadius: 3,
        marginRight: 10,
    },
    scheduleDetails: {
        flex: 1,
    },
    scheduleName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    schedulePrice: {
        fontSize: 14,
        color: '#888',
        marginTop: 2,
    },
    scheduleTime: {
        alignItems: 'flex-end',
    },
    scheduleTimeRange: {
        fontSize: 15,
        fontWeight: '500',
        color: '#555',
    },
    scheduleDuration: {
        fontSize: 13,
        color: '#999',
        marginTop: 2,
    },
    noScheduleText: {
        textAlign: 'center',
        color: '#666',
        marginTop: 20,
        fontSize: 16,
    },
    addScheduleButton: {
        backgroundColor: '#007AFF',
        borderRadius: 8,
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
        marginBottom: 10,
    },
    addScheduleButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default DailyScheduleModalContent;