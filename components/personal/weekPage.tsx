// 수정된 weekPage.tsx (useLayoutEffect로 날짜 깜빡임 방지)
import React, { useLayoutEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import WeeklyGrid from './WeeklyGrid';

const SCREEN_WIDTH = Dimensions.get('window').width;
const TIME_LABEL_WIDTH = 20;
const HORIZONTAL_PADDING = 20;
const CELL_WIDTH = (SCREEN_WIDTH - TIME_LABEL_WIDTH - HORIZONTAL_PADDING) / 7;
const CELL_HEIGHT = 50;

const WeekPage = React.memo(({ baseDate, offset, selectedSpace, setSpaceModalVisible, hours, displayDate, selectedCells, onCellToggle }) => {
  const [weekDates, setWeekDates] = useState([]);

  useLayoutEffect(() => {
    const weekStart = displayDate.startOf('week');
    const dates = Array.from({ length: 7 }, (_, i) => weekStart.add(i, 'day').format('M.D'));
    setWeekDates(dates);
  }, [displayDate]);

  return (
    <View style={styles.page}>
      <Text style={styles.dateRange}>{weekDates[0]} - {weekDates[6]}</Text>

      {/* 상단 요일 + 날짜 텍스트 */}
      <View style={styles.dayHeader}>
        <View style={{ width: TIME_LABEL_WIDTH }} />
        {['일', '월', '화', '수', '목', '금', '토'].map((day, i) => (
          <View key={i} style={{ width: CELL_WIDTH, alignItems: 'center' }}>
            <Text style={styles.dayText}>{day}</Text>
            <Text style={styles.dateText}>{weekDates[i]}</Text>
          </View>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scheduleGrid} horizontal={false}>
        <View style={{ flexDirection: 'row' }}>
          <View style={{ width: TIME_LABEL_WIDTH }}>
            {hours.map((h, rowIdx) => {
              const isHour = Number.isInteger(h);
              const hourText = isHour ? String(h).padStart(2, '0') : '';
              return (
                <Text key={rowIdx} style={styles.timeLabel}>
                  {hourText}
                </Text>
              );
            })}
          </View>
          <WeeklyGrid
            hours={hours}
            CELL_WIDTH={CELL_WIDTH}
            selectedCells={selectedCells}
            onCellToggle={onCellToggle}
            CELL_HEIGHT = {CELL_HEIGHT}
          />
        </View>
      </ScrollView>
    </View>
  );
});

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: 'white' },
  dateRange: { fontSize: 18, textAlign: 'center', marginBottom: 10 },
  dayHeader: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    alignItems: 'center',
    marginBottom: 5,
  },
  dayText: { textAlign: 'center', fontWeight: 'bold', fontSize: 13 },
  dateText: { fontSize: 12, color: '#666' },
  scheduleGrid: { paddingHorizontal: 10, paddingBottom: 30 },
  timeLabel: {
    height: CELL_HEIGHT,
    textAlign: 'center',
    fontSize: 12,
    color: '#555',
  },
});

export default WeekPage;