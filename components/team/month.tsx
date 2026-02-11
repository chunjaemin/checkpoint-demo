import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    Pressable,
    TouchableOpacity,
    FlatList,
    NativeScrollEvent,
    NativeSyntheticEvent,
} from 'react-native';
import {
    format,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    addMonths,
    isSameMonth,
    isSameDay
} from 'date-fns';

import { useUserStore } from '@/scripts/store/userStore';
import { useEditDateStore } from '@/scripts/store/teamStore';
import { userData } from '@/scripts/dummyData/userData';
import DailyScheduleModalContent from '../team/DailyScheduleModal';
import Modal from 'react-native-modal';
import Feather from '@expo/vector-icons/Feather';

import { scheduleColors } from '@/scripts/color/scheduleColor';

type Schedule = React.ComponentProps<typeof DailyScheduleModalContent>['dailySchedules'][number];
type DateKey = string; // yyyy-MM-dd
type MonthKey = string; // yyyy-MM
type MonthScheduleMap = Record<DateKey, Schedule[]>;
type SchedulesByMonth = Record<MonthKey, MonthScheduleMap>;

// PERF TEST: 날짜 셀마다 "더미 태그"를 추가 렌더해서 뷰 개수를 인위적으로 늘림
// 필요 시 숫자만 조절하면 됨 (프로덕션에서는 0)
const PERF_DUMMY_TAGS_PER_CELL = __DEV__ ? 4 : 0;
const PERF_DUMMY_TAG_COLORS = ['cherry', 'ocean', 'forest', 'plum', 'orange'] as const;

type SpaceLike = {
    type?: string;
    schedules?: Schedule[];
};

type MonthCalendarViewProps = {
    targetMonth: Date;
    calendarWidth: number;
    monthSchedulesMap: MonthScheduleMap;
    WEEK_DAYS: string[];
    currentMonthNumRows: number;
    styles: any;
    onDatePress: (date: Date, schedules: Schedule[]) => void;
    onTodayPress: () => void;
};

const MonthCalendarView = React.memo(({
    targetMonth,
    calendarWidth,
    monthSchedulesMap,
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

    const monthDays = useMemo(() => getMonthDays(targetMonth), [targetMonth]);
    const today = useMemo(() => new Date(), []);

    return (
        <View style={styles.monthContainer}>
            <View style={styles.headerRow}>
                <Text style={styles.monthText}>{format(targetMonth, 'yyyy년 M월')}</Text>
                {!isSameMonth(targetMonth, today) && (
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
                            const dummySchedules: Schedule[] =
                                PERF_DUMMY_TAGS_PER_CELL > 0 && dateKey && date
                                    ? Array.from({ length: PERF_DUMMY_TAGS_PER_CELL }, (_, i) => {
                                        const color = PERF_DUMMY_TAG_COLORS[i % PERF_DUMMY_TAG_COLORS.length];
                                        return {
                                            id: `dummy-${dateKey}-${i}`,
                                            name: `DUMMY ${i + 1}`,
                                            startTime: date.toISOString(),
                                            endTime: date.toISOString(),
                                            color,
                                        } as Schedule;
                                    })
                                    : [];
                            const tagSchedules = [...daySchedules.slice(0, 2), ...dummySchedules];
                            const isToday = date && isSameDay(date, today);

                            return (
                                <Pressable
                                    key={colIdx}
                                    style={[
                                        styles.dateCell,
                                        { width: calendarWidth / 7, height: `100%` },
                                    ]}
                                    onPress={() => date && onDatePress(date, daySchedules)}
                                >
                                    {date && (
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
                                            {tagSchedules.map((s: Schedule, idx: number) => (
                                                <View
                                                    key={(s as any)?.id ?? idx}
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
    const WEEK_DAYS = ['일', '월', '화', '수', '목', '금', '토'];

    const listRef = useRef<FlatList<number>>(null);

    // 무한 페이징을 위해 큰 "윈도우"를 잡고, 스와이프가 끝날 때마다 baseDate를 갱신한 뒤
    // FlatList를 중앙 인덱스로 되돌리는(recenter) 방식.
    const WINDOW_MONTHS = 120; // 앞뒤 120개월(10년) 폭
    const HALF = Math.floor(WINDOW_MONTHS / 2); // 60
    const OFFSETS = useMemo(
        () => Array.from({ length: WINDOW_MONTHS + 1 }, (_, i) => i - HALF),
        [HALF]
    );

    // 기준 월(현재 달). FlatList는 offset으로 targetMonth를 계산.
    const [baseDate, setBaseDate] = useState(() => startOfMonth(new Date()));
    const [calendarWidth, setCalendarWidth] = useState(screenWidth);
    const pageWidth = calendarWidth;

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedDateForModal, setSelectedDateForModal] = useState<Date | null>(null);
    const [schedulesForModal, setSchedulesForModal] = useState<Schedule[]>([]);

    const user = useUserStore((state) => state.user);
    const setUser = useUserStore((state) => state.setUser);
    const selected_space = useUserStore((state) => state.selected_space);
    const setEditDate = useEditDateStore((state) => state.setEditDate);

    const schedules: Schedule[] = useMemo(() => {
        const space = user?.spaces?.[selected_space];
        if (!space || space?.type === 'personal') return [];
        return (space.schedules || []) as Schedule[];
    }, [user?.spaces, selected_space]);

    // (1) 스케줄을 월/일 키로 한 번만 인덱싱 → 월 렌더 시 reduce 스캔 제거
    const schedulesByMonth: SchedulesByMonth = useMemo(() => {
        const idx: SchedulesByMonth = {};
        for (const s of schedules) {
            const d = new Date(s.startTime);
            const monthKey = format(d, 'yyyy-MM');
            const dateKey = format(d, 'yyyy-MM-dd');
            (idx[monthKey] ||= {});
            (idx[monthKey][dateKey] ||= []).push(s);
        }

        // 날짜별 정렬(옵션): 표시 순서를 안정화
        for (const monthKey of Object.keys(idx)) {
            const monthMap = idx[monthKey];
            for (const dateKey of Object.keys(monthMap)) {
                monthMap[dateKey].sort((a, b) => {
                    const ta = new Date(a.startTime).getTime();
                    const tb = new Date(b.startTime).getTime();
                    if (ta !== tb) return ta - tb;
                    return a.name.localeCompare(b.name);
                });
            }
        }

        return idx;
    }, [schedules]);

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

    const handleDatePress = (date: Date, schedules: Schedule[]) => {
        setSelectedDateForModal(date);
        setSchedulesForModal(schedules);
        setIsModalVisible(true);
        setEditDate(date);
    };

    const handleCloseModal = () => {
        setIsModalVisible(false);
        setTimeout(() => {
            setSelectedDateForModal(null);
            setSchedulesForModal([]);
        }, 300);
    };

    const handleAddSchedule = (date: Date) => {
        console.log(`일정 추가하기: ${format(date, 'yyyy-MM-dd')}`);
        handleCloseModal();
    };

    const renderOptimizedMonth = (offset: number) => {
        const targetMonth = addMonths(baseDate, offset);
        const monthDays = getMonthDays(targetMonth);
        const numRows = Math.ceil(monthDays.length / 7);
        const monthKey = format(targetMonth, 'yyyy-MM');
        const monthSchedulesMap = schedulesByMonth[monthKey] || {};

        return (
            <MonthCalendarView
                key={offset.toString()}
                targetMonth={targetMonth}
                calendarWidth={calendarWidth}
                monthSchedulesMap={monthSchedulesMap}
                WEEK_DAYS={WEEK_DAYS}
                currentMonthNumRows={numRows}
                styles={styles}
                onDatePress={handleDatePress}
                onTodayPress={handleGoToToday}
            />
        );
    };

    const scrollToCenter = useCallback(() => {
        listRef.current?.scrollToIndex({ index: HALF, animated: false });
    }, [HALF]);

    const handleGoToToday = useCallback(() => {
        setBaseDate(startOfMonth(new Date()));
        // state 반영 후 한 틱 뒤에 센터로 이동
        setTimeout(() => {
            scrollToCenter();
        }, 0);
    }, [scrollToCenter]);

    const handleMomentumEnd = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
        if (!pageWidth) return;
        const x = e.nativeEvent.contentOffset.x;
        const index = Math.round(x / pageWidth);

        // 매 스와이프마다 리센터링하면 "흰 화면(빈 영역)"이 보일 수 있어서,
        // 가장자리 근처로 갔을 때만 baseDate를 합치고 센터로 되돌림.
        const EDGE_THRESHOLD = 10;
        const lastIndex = OFFSETS.length - 1;

        if (index <= EDGE_THRESHOLD || index >= lastIndex - EDGE_THRESHOLD) {
            const offset = OFFSETS[index] ?? 0;
            if (offset !== 0) {
                setBaseDate((prev) => startOfMonth(addMonths(prev, offset)));
            }
            // state 반영 후 한 틱 뒤에 센터로 이동
            setTimeout(() => {
                scrollToCenter();
            }, 0);
        }
    }, [OFFSETS, pageWidth, scrollToCenter]);

    return (
        <View
            style={{ flex: 1 }}
            onLayout={(e: any) => setCalendarWidth(e.nativeEvent.layout.width)}
        >
            <FlatList
                ref={listRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                data={OFFSETS}
                keyExtractor={(offset) => String(offset)}
                initialScrollIndex={HALF}
                getItemLayout={(_data, index) => ({
                    length: pageWidth,
                    offset: pageWidth * index,
                    index,
                })}
                initialNumToRender={3}
                windowSize={5}
                maxToRenderPerBatch={2}
                updateCellsBatchingPeriod={16}
                removeClippedSubviews
                onMomentumScrollEnd={handleMomentumEnd}
                onScrollToIndexFailed={() => {
                    // 레이아웃 타이밍 이슈로 초기 scroll 실패할 수 있어 재시도
                    setTimeout(() => {
                        scrollToCenter();
                    }, 50);
                }}
                renderItem={({ item: offset }) => (
                    <View style={{ width: pageWidth, flex: 1 }}>
                        {renderOptimizedMonth(offset)}
                    </View>
                )}
                style={{ flex: 1 }}
            />

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
