import React from 'react';
import { Dimensions, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { format } from 'date-fns';
import { useRouter } from 'expo-router';

import { scheduleColors } from '@/shared/config/scheduleColors';
import { useCalTypeStore } from '../model/store';

const { height: screenHeight } = Dimensions.get('window');

export interface ScheduleItem {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  color?: string;
  hourlyWage?: number;
  memo?: string;
}

export interface DailyScheduleModalContentProps {
  selectedDate: Date | null;
  dailySchedules: ScheduleItem[];
  onAddSchedule: (date: Date) => void;
  onClose: () => void;
}

const DailyScheduleModalContent: React.FC<DailyScheduleModalContentProps> = ({
  selectedDate,
  dailySchedules,
  onClose,
}) => {
  const router = useRouter();
  const setCalType = useCalTypeStore((state) => state.setCalType);

  if (!selectedDate) return null;

  const formattedDate = format(selectedDate, 'M월 d일');

  const handleScheduleItemClick = (schedule: ScheduleItem) => {
    const scheduleParam = encodeURIComponent(JSON.stringify(schedule));
    router.push({
      pathname: '/detail/personalScheduleDetail',
      params: { schedule: scheduleParam },
    });
    onClose();
  };

  return (
    <View style={styles.modalContainer}>
      <Text style={styles.modalDate}>{formattedDate}</Text>

      <ScrollView style={styles.scheduleList}>
        {dailySchedules.length > 0 ? (
          dailySchedules.map((schedule) => {
            const startTime = format(new Date(schedule.startTime), 'HH:mm');
            const endTime = format(new Date(schedule.endTime), 'HH:mm');
            const durationMs =
              new Date(schedule.endTime).getTime() - new Date(schedule.startTime).getTime();
            const durationHours = durationMs / (1000 * 60 * 60);

            return (
              <Pressable
                key={schedule.id}
                style={styles.scheduleItem}
                onPress={() => handleScheduleItemClick(schedule)}
              >
                <View
                  style={[
                    styles.scheduleColorBar,
                    { backgroundColor: scheduleColors[(schedule.color as any) ?? '']?.main || '#ccc' },
                  ]}
                />
                <View style={styles.scheduleDetails}>
                  <Text style={styles.scheduleName}>{schedule.name}</Text>
                  <Text style={styles.schedulePrice}>
                    {schedule.hourlyWage?.toLocaleString() || '0'}원
                  </Text>
                </View>
                <View style={styles.scheduleTime}>
                  <Text style={styles.scheduleTimeRange}>
                    {startTime} - {endTime}
                  </Text>
                  <Text style={styles.scheduleDuration}>{durationHours}시간</Text>
                </View>
              </Pressable>
            );
          })
        ) : (
          <Text style={styles.noScheduleText}>이 날짜에는 일정이 없습니다.</Text>
        )}
      </ScrollView>

      <Pressable
        style={styles.addScheduleButton}
        onPress={() => {
          // 기존 동작 유지: "편집" 모드로 전환 (실제 추가 로직은 WeekEdit에서)
          setCalType('편집');
        }}
      >
        <Text style={styles.addScheduleButtonText}>일정 추가하기</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
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
  modalDate: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  scheduleList: {
    maxHeight: screenHeight * 0.45,
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  scheduleColorBar: {
    width: 6,
    height: 42,
    borderRadius: 3,
    marginRight: 12,
  },
  scheduleDetails: {
    flex: 1,
  },
  scheduleName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
  },
  schedulePrice: {
    marginTop: 4,
    fontSize: 13,
    color: '#777',
  },
  scheduleTime: {
    alignItems: 'flex-end',
  },
  scheduleTimeRange: {
    fontSize: 12,
    color: '#555',
  },
  scheduleDuration: {
    marginTop: 4,
    fontSize: 12,
    color: '#999',
  },
  noScheduleText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#999',
  },
  addScheduleButton: {
    marginTop: 16,
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 12,
  },
  addScheduleButtonText: {
    textAlign: 'center',
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default DailyScheduleModalContent;

