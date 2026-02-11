import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  InteractionManager,
  Pressable,
} from 'react-native';
import Modal from 'react-native-modal';

import PagerView from 'react-native-pager-view';
import { addWeeks, startOfWeek, format, addDays, parseISO } from 'date-fns';
import { useUserStore } from '@/scripts/store/userStore';
import { scheduleColors } from '@/scripts/color/scheduleColor';
import DailyScheduleModalContent from './DailyScheduleModal';


const { height } = Dimensions.get('window');
const WEEK_DAYS = ['일', '월', '화', '수', '목', '금', '토'];

export default function PersonalWeek() {
  const pagerRef = useRef(null);
  const [baseDate, setBaseDate] = useState(new Date());
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const user = useUserStore((state) => state.user);
  const selected_space = useUserStore((state) => state.selected_space);

  // 모달 상태
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showModal, setShowModal] = useState(false);

  const [showCover, setShowCover] = useState(false);
  const [coverDate, setCoverDate] = useState(null);

  const getCurrentWeek = (date: Date) => {
    const start = startOfWeek(date, { weekStartsOn: 0 });
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  };

  const getSchedulesForDate = (date: Date | null) => {
    if (!date) return [];
    const dateStr = format(date, 'yyyy-MM-dd');
    return user?.spaces?.[selected_space]?.schedules?.filter((s) =>
      format(parseISO(s.startTime), 'yyyy-MM-dd') === dateStr
    ) || [];
  };

  const getTimeBounds = (weekDates: Date[]) => {
    const schedules = user?.spaces?.[selected_space]?.schedules || [];
    let startHour = 9;
    let endHour = 18;

    const weekDateStrs = weekDates.map((d) => format(d, 'yyyy-MM-dd'));
    schedules.forEach((s) => {
      const localStart = parseISO(s.startTime);
      const localEnd = parseISO(s.endTime);
      const dateStr = format(localStart, 'yyyy-MM-dd');
      if (weekDateStrs.includes(dateStr)) {
        const start = localStart.getHours() + localStart.getMinutes() / 60;
        const end = localEnd.getHours() + localEnd.getMinutes() / 60;
        startHour = Math.min(startHour, Math.floor(start - 1));
        endHour = Math.max(endHour, Math.ceil(end + 1));
      }
    });

    const hourBlockHeight = (height - 180) / 8;
    const totalHours = endHour - startHour;
    const totalHeight = hourBlockHeight * totalHours;

    return [startHour, endHour, hourBlockHeight, totalHours, totalHeight];
  };

  const renderWeek = (targetDate: Date) => {
    const weekDates = getCurrentWeek(targetDate);
    const [startHour, endHour, hourBlockHeight, , totalHeight] = getTimeBounds(weekDates);
    const schedules = user?.spaces?.[selected_space]?.schedules || [];

    const scheduleMap = schedules.reduce((acc, s) => {
      const localStart = parseISO(s.startTime);
      const dateKey = format(localStart, 'yyyy-MM-dd');
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(s);
      return acc;
    }, {} as Record<string, any[]>);

    const timeSlots = [];
    for (let t = startHour; t <= endHour; t += 0.5) {
      timeSlots.push(t);
    }

    return (
      <View style={styles.weekContainer}>
        <Text style={styles.dateRangeText}>
          {format(weekDates[0], 'M월 d일')} - {format(weekDates[6], 'M월 d일')}
        </Text>

        <View style={styles.weekdayRow}>
          <View style={styles.timeLabelColumn} />
          {WEEK_DAYS.map((day, idx) => (
            <View key={idx} style={styles.weekdayCell}>
              <Text style={styles.weekdayText}>{day}</Text>
            </View>
          ))}
        </View>

        <ScrollView style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', height: totalHeight }}>
            <View style={styles.timeLabelColumn}>
              {timeSlots.map((t, i) =>
                Number.isInteger(t) ? (
                  <View key={i} style={[styles.timeLabelRow, { height: hourBlockHeight }]}>
                    <Text style={styles.timeText}>{`${t}`}</Text>
                  </View>
                ) : null
              )}
            </View>

            {weekDates.map((date, idx) => {
              const dateKey = format(date, 'yyyy-MM-dd');
              const daySchedules = scheduleMap[dateKey] || [];

              return (
                <Pressable
                  key={idx}
                  style={styles.dayColumn}
                  onPress={() => {
                    setSelectedDate(date);
                    setShowModal(true);
                  }}
                >
                  {daySchedules.map((s, i) => {
                    const start = parseISO(s.startTime);
                    const end = parseISO(s.endTime);
                    const startTotal = start.getHours() + start.getMinutes() / 60;
                    const endTotal = end.getHours() + end.getMinutes() / 60;
                    const top = (startTotal - startHour) * hourBlockHeight;
                    const height = (endTotal - startTotal) * hourBlockHeight;

                    return (
                      <View
                        key={i}
                        style={[
                          styles.scheduleBlock,
                          {
                            top,
                            height,
                            backgroundColor: scheduleColors[s.color]?.background || '#ccc',
                          },
                        ]}
                      >
                        <Text style={[
                          styles.scheduleText,
                          { color: scheduleColors[s.color]?.font || '#fff' }
                        ]}>{s.name}</Text>
                      </View>
                    );
                  })}
                </Pressable>
              );
            })}
          </View>
        </ScrollView>
      </View>
    );
  };

  const renderWeekPage = (offset: number) => {
    const targetDate = addWeeks(baseDate, offset);
    return (
      <View key={offset} style={{ flex: 1 }}>
        {renderWeek(targetDate)}
      </View>
    );
  };

  const handlePageSelected = (e: any) => {
    const newPage = e.nativeEvent.position;
    const offset = newPage - 1;

    if (offset !== 0) {
      setScrollEnabled(false);
      const newBase = addWeeks(baseDate, offset);
      setCoverDate(newBase);
      setShowCover(true);

      setTimeout(() => {
        setBaseDate(newBase);
        pagerRef.current?.setPageWithoutAnimation(1);
        InteractionManager.runAfterInteractions(() => {
          setScrollEnabled(true);
          setShowCover(false);
        });
      }, 0);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <PagerView
        ref={pagerRef}
        initialPage={1}
        onPageSelected={handlePageSelected}
        scrollEnabled={scrollEnabled}
        style={{ flex: 1 }}
      >
        {[-1, 0, 1].map((offset) => renderWeekPage(offset))}
      </PagerView>

      {showCover && coverDate && (
        <View style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: '#fff', zIndex: 1
        }}>
          {renderWeek(coverDate)}
        </View>
      )}
      <Modal
        isVisible={showModal}
        onBackdropPress={() => setShowModal(false)} // ✅ 배경 클릭 시 닫힘
        onBackButtonPress={() => setShowModal(false)} // ✅ 안드로이드 백버튼 시 닫힘
        style={{ justifyContent: 'flex-end', margin: 0 }} // ✅ 하단 정렬
        backdropOpacity={0.5} // ✅ 배경 어둡게
        animationIn="slideInUp"
        animationOut="slideOutDown"
        useNativeDriver
      >
        <DailyScheduleModalContent
          selectedDate={selectedDate}
          dailySchedules={getSchedulesForDate(selectedDate)}
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
  timeLabelColumn: {
    width: 40,
  },
  timeLabelRow: {
    alignItems: 'center',
  },
  timeText: {
    fontSize: 12,
    color: '#888',
  },
  dayColumn: {
    flex: 1,
    position: 'relative',
  },
  scheduleBlock: {
    position: 'absolute',
    left: 2,
    right: 2,
    borderRadius: 4,
    padding: 2,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  scheduleText: {
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
