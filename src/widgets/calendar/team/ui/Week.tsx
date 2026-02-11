import React, { useState, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  useWindowDimensions,
  Pressable,
} from 'react-native';
import { addWeeks, startOfWeek, format, addDays, parseISO } from 'date-fns';
import { useUserStore } from '@/scripts/store/userStore';
import { scheduleColors } from '@/shared/config/scheduleColors';
import DailyScheduleModalContent from '@/features/calendar/team/ui/DailyScheduleModalContent';
import Modal from 'react-native-modal';
import { indexSchedulesByDate, ByDate } from '@/entities/schedule';

const WEEK_DAYS = ['일', '월', '화', '수', '목', '금', '토'];

type Schedule = React.ComponentProps<typeof DailyScheduleModalContent>['dailySchedules'][number];
type ScheduleMap = Record<string, Schedule[]>;

export default function PersonalWeek() {
  const listRef = useRef<FlatList<number>>(null);
  const { width: pageWidth } = useWindowDimensions();

  // 1년치(대략 52주) + 현재 주까지 포함해서 53개로 구성
  // 예: offsets = [-26..+26], initial index = 26
  const YEAR_WEEKS = 52;
  const HALF = Math.floor(YEAR_WEEKS / 2); // 26
  const OFFSETS = useMemo(
    () => Array.from({ length: YEAR_WEEKS + 1 }, (_, i) => i - HALF),
    [HALF]
  );

  // 기준 날짜(현재 주). FlatList는 offset으로 target week를 계산.
  const [baseDate] = useState(() => startOfWeek(new Date(), { weekStartsOn: 0 }));

  const user = useUserStore((state) => state.user);
  const selected_space = useUserStore((state) => state.selected_space);

  const [showModal, setShowModal] = useState(false); // ✅ 모달 상태
  const [selectedDate, setSelectedDate] = useState<Date | null>(null); // ✅ 선택된 날짜
  const [modalSchedules, setModalSchedules] = useState<Schedule[]>([]); // ✅ 선택된 날짜의 스케줄

  // (1) 스케줄을 날짜 키로 한 번만 인덱싱 → 주 페이지마다 reduce/sort 반복 제거
  const scheduleMap: ByDate<Schedule> = useMemo(() => {
    const schedules: Schedule[] = user?.spaces?.[selected_space]?.schedules || [];
    return indexSchedulesByDate(schedules);
  }, [user?.spaces, selected_space]);

  const getCurrentWeek = (date: Date): Date[] => {
    const start = startOfWeek(date, { weekStartsOn: 0 });
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  };

  const openModalForDate = (date: Date, scheduleMap: ScheduleMap) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    setSelectedDate(date);
    setModalSchedules(scheduleMap[dateKey] || []);
    setShowModal(true);
  };

  const renderWeek = (targetDate: Date) => {
    const weekDates = getCurrentWeek(targetDate);

    return (
      <View style={styles.weekContainer}>
        <Text style={styles.dateRangeText}>
          {format(weekDates[0], 'M월 d일')} - {format(weekDates[6], 'M월 d일')}
        </Text>

        <View style={styles.weekdayRow}>
          {WEEK_DAYS.map((day, idx) => (
            <View key={idx} style={styles.weekdayCell}>
              <Text style={styles.weekdayText}>{day}</Text>
            </View>
          ))}
        </View>

        <ScrollView style={styles.scheduleScrollView}>
          <View style={styles.scheduleGrid}>
            {weekDates.map((date, idx) => {
              const dateKey = format(date, 'yyyy-MM-dd');
              const daySchedules = scheduleMap[dateKey] || [];
              return (
                <Pressable
                  key={idx}
                  style={styles.dayColumn}
                  onPress={() => openModalForDate(date, scheduleMap)} // ✅ 날짜 클릭 시 모달 열기
                >
                  {daySchedules.map((s, i) => (
                    <View
                      key={i}
                      style={[
                        styles.scheduleBlockStacked,
                        { backgroundColor: scheduleColors[(s.color as keyof typeof scheduleColors)]?.background || '#ccc' },
                      ]}
                    >
                      <Text style={[
                        styles.scheduleText,
                        { color: scheduleColors[(s.color as keyof typeof scheduleColors)]?.font || '#fff' }
                      ]}>{s.name}</Text>
                      <Text style={[
                        styles.scheduleTimeText,
                        { color: scheduleColors[(s.color as keyof typeof scheduleColors)]?.font || '#fff' }
                      ]}>
                        {format(parseISO(s.startTime), 'HH:mm')} - {format(parseISO(s.endTime), 'HH:mm')}
                      </Text>
                    </View>
                  ))}
                </Pressable>
              );
            })}
          </View>
        </ScrollView>
      </View>
    );
  };

  const getItemLayout = (_data: ArrayLike<number> | null | undefined, index: number) => ({
    length: pageWidth,
    offset: pageWidth * index,
    index,
  });

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        ref={listRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        data={OFFSETS}
        keyExtractor={(offset) => String(offset)}
        initialScrollIndex={HALF}
        getItemLayout={getItemLayout}
        initialNumToRender={3}
        windowSize={5}
        maxToRenderPerBatch={2}
        updateCellsBatchingPeriod={16}
        removeClippedSubviews
        renderItem={({ item: offset }) => {
          const targetDate = addWeeks(baseDate, offset);
          return (
            <View style={{ width: pageWidth, flex: 1 }}>
              {renderWeek(targetDate)}
            </View>
          );
        }}
        style={{ flex: 1 }}
      />

      {/* ✅ 모달: 하단 슬라이드 + 배경 어둡게 + 클릭 시 닫힘 */}
      <Modal
        isVisible={showModal}
        onBackdropPress={() => setShowModal(false)}
        onBackButtonPress={() => setShowModal(false)}
        style={{ justifyContent: 'flex-end', margin: 0 }}
        backdropOpacity={0.5}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        useNativeDriver
      >
        <DailyScheduleModalContent
          selectedDate={selectedDate}
          dailySchedules={modalSchedules}
          onAddSchedule={() => setShowModal(false)}
          onClose={() => setShowModal(false)}
        />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  weekContainer: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 8,
  },
  dateRangeText: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
    marginVertical: 8,
  },
  weekdayRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#ddd',
    paddingBottom: 10,
  },
  weekdayCell: {
    flex: 1,
    alignItems: 'center',
  },
  weekdayText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#555',
  },
  scheduleScrollView: {
    flex: 1,
  },
  scheduleGrid: {
    flexDirection: 'row',
    flex: 1,
  },
  dayColumn: {
    flex: 1,
    borderRightWidth: 1,
    borderColor: '#eee',
    paddingHorizontal: 4,
    paddingVertical: 8,
    alignItems: 'center',
  },
  scheduleBlockStacked: {
    width: '100%',
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 4,
    marginBottom: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scheduleText: {
    fontSize: 11,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  scheduleTimeText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginTop: 2,
  },
});

