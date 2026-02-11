import {
    addMonths,
    eachDayOfInterval,
    endOfMonth,
    format,
    isSameDay,
    isSameMonth,
    startOfMonth
} from 'date-fns';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Dimensions, InteractionManager, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import PagerView from 'react-native-pager-view';

import { scheduleColors } from '@/scripts/color/scheduleColor';
import { userData } from '@/scripts/dummyData/userData';
import { useEditDateStore } from '@/scripts/store/personalStore';
import { useUserStore } from '@/scripts/store/userStore';
import Feather from '@expo/vector-icons/Feather';
import Modal from 'react-native-modal';
import DailyScheduleModalContent from './DailyScheduleModal';

type Schedule = React.ComponentProps<typeof DailyScheduleModalContent>['dailySchedules'][number];
type ScheduleMap = Record<string, Schedule[]>;
type SpaceLike = { type?: string; schedules?: Schedule[] };

// PERF TEST: 날짜 셀마다 "더미 태그"를 추가 렌더해서 뷰 개수를 인위적으로 늘림
// 필요 시 숫자만 조절하면 됨 (프로덕션에서는 0)
const PERF_DUMMY_TAGS_PER_CELL = __DEV__ ? 4 : 0;
const PERF_DUMMY_TAG_COLORS = ['cherry', 'ocean', 'forest', 'plum', 'orange'] as const;

type MonthCalendarViewProps = {
    targetMonth: Date;
    calendarWidth: number;
    allUserSchedules: SpaceLike[];
    selectedSpaceIndex: number;
    WEEK_DAYS: readonly string[];
    currentMonthNumRows: number;
    styles: any;
    onDatePress: (date: Date, schedules: Schedule[]) => void;
    onTodayPress: () => void;
};

const MonthCalendarView = React.memo(({
    targetMonth,
    calendarWidth,
    allUserSchedules,
    selectedSpaceIndex,
    WEEK_DAYS,
    currentMonthNumRows,
    styles,
    onDatePress,
    onTodayPress
}: MonthCalendarViewProps) => {
    const getMonthDays = (date: Date): Array<Date | null> => {
        const start = startOfMonth(date);
        const end = endOfMonth(date);
        const days = eachDayOfInterval({ start, end });
        const prefix = Array(start.getDay()).fill(null);
        return [...prefix, ...days];
    };

    const monthSchedulesMap = useMemo((): ScheduleMap => {
        if (selectedSpaceIndex == null || !allUserSchedules[selectedSpaceIndex] || allUserSchedules[selectedSpaceIndex]?.type === "team") return {};
        const schedules: Schedule[] = allUserSchedules[selectedSpaceIndex].schedules || [];
        const monthStart = startOfMonth(targetMonth);
        const monthEnd = endOfMonth(targetMonth);

        return schedules.reduce<ScheduleMap>((acc, schedule: Schedule) => {
            const scheduleDate = new Date(schedule.startTime);
            if (scheduleDate >= monthStart && scheduleDate <= monthEnd) {
                const dateKey = format(scheduleDate, 'yyyy-MM-dd');
                if (!acc[dateKey]) acc[dateKey] = [];
                acc[dateKey].push(schedule);
            }
            return acc;
        }, {});
    }, [targetMonth, allUserSchedules, selectedSpaceIndex]);

    const monthDays = getMonthDays(targetMonth);


    return (
        <View style={styles.monthContainer}>
            <View style={styles.headerRow}>
                <Text style={styles.monthText}>{format(targetMonth, 'yyyy년 M월')}</Text>
                {!isSameMonth(targetMonth, new Date()) && (
                    <TouchableOpacity
                        onPress={onTodayPress}
                        activeOpacity={0.6} // 눌렀을 때 투명도 조절 (기본은 0.2~0.3)
                        style={{ flexDirection: 'row', alignItems: 'center' }}
                    >
                        <Text style={styles.todayBtn}>Today</Text>
                        <Feather name="rotate-ccw" size={16} color="#007AFF" style={{ marginLeft: 4 }} />
                    </TouchableOpacity>
                )}
            </View>

            <View style={styles.weekRow}>
                {WEEK_DAYS.map((day: string, index: number) => {
                    const isWeekend = index === 0 || index === 6; // 일요일(index 0) 또는 토요일(index 6)
                    return (
                        <Text
                            key={day}
                            style={[
                                styles.weekday,
                                { width: calendarWidth / 7 },
                                isWeekend && { color: '#fc3c3cff' }, // 빨간색
                            ]}
                        >
                            {day}
                        </Text>
                    );
                })}
            </View>

            <View style={[styles.dateGrid, { flex: 1 }]}>
                {Array(currentMonthNumRows).fill(null).map((_, rowIdx) => (
                    <View key={rowIdx} style={styles.dateRow}>
                        {Array(7).fill(null).map((_, colIdx) => {
                            const dateIndex = rowIdx * 7 + colIdx;
                            const date = monthDays[dateIndex];
                            const dateKey = date ? format(date, 'yyyy-MM-dd') : null;
                            const daySchedules = dateKey ? monthSchedulesMap[dateKey] || [] : [];
                            const dummySchedules =
                                PERF_DUMMY_TAGS_PER_CELL > 0 && dateKey && date
                                    ? Array.from({ length: PERF_DUMMY_TAGS_PER_CELL }, (_, i) => ({
                                        id: `dummy-${dateKey}-${i}`,
                                        name: `DUMMY ${i + 1}`,
                                        startTime: date.toISOString(),
                                        endTime: date.toISOString(),
                                        color: PERF_DUMMY_TAG_COLORS[i % PERF_DUMMY_TAG_COLORS.length],
                                    }) as Schedule)
                                    : [];
                            const tagSchedules: Schedule[] = [...daySchedules.slice(0, 2), ...dummySchedules];
                            const isToday = date && isSameDay(date, new Date());

                            return (
                                <Pressable
                                    key={colIdx}
                                    style={[
                                        styles.dateCell,
                                        { width: calendarWidth / 7, height: `100%` },
                                    ]}
                                    onPress={() => date && onDatePress(date, daySchedules)}
                                >
                                    {date && ( //각 날짜를 표현하는 구역 
                                        <>
                                            <View
                                                style={{
                                                    width: 28,
                                                    height: 28,
                                                    borderRadius: 14,
                                                    overflow: 'hidden', // ✅ 강제 클리핑
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                    backgroundColor: isToday ? '#007AFF' : 'transparent', // 현재날짜에 동그라미
                                                }}
                                            >
                                                <Text
                                                    style={{
                                                        fontWeight: 'bold',
                                                        textAlign: 'center',
                                                        color: isToday
                                                            ? 'white'
                                                            : colIdx === 0 || colIdx === 6
                                                                ? '#fc3c3cff' // 일/토 빨간색
                                                                : 'black',
                                                        fontSize: 14,
                                                    }}
                                                >
                                                    {date.getDate()}
                                                </Text>
                                            </View>

                                            {tagSchedules.map((s, idx) => (
                                                <View
                                                    key={s?.id ?? idx}
                                                    style={[
                                                        styles.scheduleTag,
                                                        { backgroundColor: scheduleColors[(s.color as keyof typeof scheduleColors)]?.background || '#ccc' },
                                                    ]}
                                                >
                                                    <Text style={[
                                                        styles.scheduleTitleText,
                                                        { color: scheduleColors[(s.color as keyof typeof scheduleColors)]?.font }
                                                    ]}>{s.name}</Text>
                                                </View>
                                            ))}
                                            {daySchedules.length > 2 && (
                                                <Text style={styles.moreText}>
                                                    +{daySchedules.length - 2} more
                                                </Text>
                                            )}
                                        </>
                                    )}
                                </Pressable>
                            );
                        })}
                    </View>
                ))}
            </View>
        </View>
    );
});

export default function PersonalMonth() {
    const { width: screenWidth } = Dimensions.get('window');
    const WEEK_DAYS = useMemo(() => (['일', '월', '화', '수', '목', '금', '토'] as const), []);

    const pagerRef = useRef<any>(null);
    // rotate 방식: 항상 [prev, current, next] 3개만 유지하면서 1개만 새로 생성
    const [pageMonths, setPageMonths] = useState<[Date, Date, Date]>(() => {
        const current = startOfMonth(new Date());
        const prev = startOfMonth(addMonths(current, -1));
        const next = startOfMonth(addMonths(current, 1));
        return [prev, current, next];
    });
    const [calendarWidth, setCalendarWidth] = useState(screenWidth);
    const [scrollEnabled, setScrollEnabled] = useState(true);

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedDateForModal, setSelectedDateForModal] = useState<Date | null>(null);
    const [schedulesForModal, setSchedulesForModal] = useState<Schedule[]>([]);

    const user = useUserStore((state) => state.user);
    const setUser = useUserStore((state) => state.setUser);
    const selected_space = useUserStore((state) => state.selected_space);
    const setEditDate = useEditDateStore((state) => state.setEditDate);

    useEffect(() => {
        if (!user || user.spaces.length === 0) {
            setUser(userData); // ✅ 진짜 초기 진입일 때만 세팅
        }
    }, []);
    const getMonthDays = (date: Date): Array<Date | null> => {
        const start = startOfMonth(date);
        const end = endOfMonth(date);
        const days = eachDayOfInterval({ start, end });
        const prefix = Array(start.getDay()).fill(null);
        return [...prefix, ...days];
    };

    const handlePageSelected = useCallback((e: any) => {
        const newPage = e.nativeEvent.position;
        // 0: prev, 1: current, 2: next
        if (newPage === 1) return;

        setScrollEnabled(false);

        setPageMonths((prev) => {
            const [mPrev, mCurrent, mNext] = prev;

            if (newPage === 0) {
                // 사용자가 "이전달"로 이동: [newPrev, prev, current]
                const newPrev = startOfMonth(addMonths(mPrev, -1));
                return [newPrev, mPrev, mCurrent];
            }

            // newPage === 2
            // 사용자가 "다음달"로 이동: [current, next, newNext]
            const newNext = startOfMonth(addMonths(mNext, 1));
            return [mCurrent, mNext, newNext];
        });

        // children 순서가 바뀐 후 가운데(1)로 리센터링
        setTimeout(() => {
            pagerRef.current?.setPageWithoutAnimation(1);
            InteractionManager.runAfterInteractions(() => {
                setScrollEnabled(true);
            });
        }, 0);
    }, []);

    const handleDatePress = useCallback((date: Date, schedules: Schedule[]) => {
        setSelectedDateForModal(date);
        setSchedulesForModal(schedules);
        setIsModalVisible(true);
        setEditDate(date);
    }, [setEditDate]);

    const handleCloseModal = () => {
        setIsModalVisible(false);
        setTimeout(() => {
            setSelectedDateForModal(null);
            setSchedulesForModal([]);
        }, 300);
    };

    const handleAddSchedule = useCallback((date: Date) => {
        console.log(`일정 추가하기: ${format(date, 'yyyy-MM-dd')}`);
        handleCloseModal();
    }, []);

    const renderOptimizedMonth = (targetMonth: Date) => {
        const monthDays = getMonthDays(targetMonth);
        const numRows = Math.ceil(monthDays.length / 7);

        return (
            <MonthCalendarView
                key={format(targetMonth, 'yyyy-MM')}
                targetMonth={targetMonth}
                calendarWidth={calendarWidth}
                allUserSchedules={user?.spaces || []}
                selectedSpaceIndex={selected_space}
                WEEK_DAYS={WEEK_DAYS}
                currentMonthNumRows={numRows}
                styles={styles}
                onDatePress={handleDatePress}
                onTodayPress={handleGoToToday}
            />
        );
    };

    const handleGoToToday = useCallback(() => {
        const current = startOfMonth(new Date());
        const prev = startOfMonth(addMonths(current, -1));
        const next = startOfMonth(addMonths(current, 1));
        setPageMonths([prev, current, next]);
        setTimeout(() => {
            pagerRef.current?.setPageWithoutAnimation(1);
        }, 0);
    }, []);

    return (
        <View
            style={{ flex: 1 }}
            onLayout={(e) => setCalendarWidth(e.nativeEvent.layout.width)}
        >
            <PagerView
                ref={pagerRef}
                initialPage={1}
                onPageSelected={handlePageSelected}
                scrollEnabled={scrollEnabled}
                style={{ flex: 1 }}
            >
                {pageMonths.map((m) => renderOptimizedMonth(m))}
            </PagerView>

            <Modal
                isVisible={isModalVisible}
                onBackdropPress={handleCloseModal}
                onSwipeComplete={handleCloseModal}
                style={modalStyles.bottomModal}
                animationIn="slideInUp"
                animationOut="slideOutDown"
                backdropOpacity={0.4}
                onModalHide={() => {
                    setSelectedDateForModal(null);
                    setSchedulesForModal([]);
                }}
            >
                <DailyScheduleModalContent
                    selectedDate={selectedDateForModal}
                    dailySchedules={schedulesForModal}
                    onAddSchedule={handleAddSchedule}
                    onClose={handleCloseModal}
                />
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        marginTop: 16,
        backgroundColor: '#fff',
    },
    monthText: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    todayBtn: {
        fontSize: 14,
        color: '#007AFF', // ✅ 파란색으로
        fontWeight: '500',
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 5,
    },
    weekRow: {
        flexDirection: 'row',
        paddingBottom: 4,
        paddingTop: 8,
    },
    weekday: {
        textAlign: 'center',
        fontWeight: '600',
        color: '#666',
    },
    dateGrid: {
        flexDirection: 'column',
    },
    dateRow: {
        flexDirection: 'row',
        flex: 1,
        borderTopWidth: 1,
        borderTopColor: '#ddd',
    },
    dateCell: {
        alignItems: 'center',
        justifyContent: 'flex-start',
        padding: 4,
        flexGrow: 1,
    },
    monthContainer: {
        flex: 1,
        paddingTop: 16,
        backgroundColor: '#fff',
    },
    scheduleTag: {
        borderRadius: 4,
        marginTop: 2,
        width: '100%',
        aspectRatio: "2.5/1",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 2,
    },
    scheduleTitleText: {
        fontSize: 11,
        color: 'white',
        fontWeight: 'bold',
        textAlign: "center",
    },
    moreText: {
        fontSize: 10,
        color: '#555',
        marginTop: 2,
    },
});

const modalStyles = StyleSheet.create({
    bottomModal: {
        justifyContent: 'flex-end',
        margin: 0,
    },
});
