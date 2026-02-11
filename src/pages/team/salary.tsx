import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useUserStore } from '@/scripts/store/userStore';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import dayjs from 'dayjs';
import { scheduleColors } from '@/scripts/color/scheduleColor';

export default function TeamSpaceSalary() {
  const user = useUserStore(state => state.user);
  const selectedSpaceIndex = useUserStore(state => state.selected_space);
  const selectedSpace = user?.spaces[selectedSpaceIndex];
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [currentMonth, setCurrentMonth] = useState(dayjs());

  const monthSchedules = useMemo(() => {
    return selectedSpace?.schedules?.filter(schedule =>
      dayjs(schedule.startTime).isSame(currentMonth, 'month')
    );
  }, [selectedSpace, currentMonth]);

  const memberStats = useMemo(() => {
    const stats = {};

    // 모든 멤버 먼저 초기화
    selectedSpace?.members?.forEach(member => {
      stats[member.id] = {
        name: member.name,
        color: member.color,
        totalAmount: 0,
        totalHours: 0,
      };
    });

    // 스케줄에 따라 누적 계산
    monthSchedules?.forEach(sch => {
      const memberId = sch.memberId;
      const duration = dayjs(sch.endTime).diff(dayjs(sch.startTime), 'hour', true);

      if (stats[memberId]) {
        stats[memberId].totalAmount += duration * sch.hourlyWage;
        stats[memberId].totalHours += duration;
      }
    });

    return stats;
  }, [monthSchedules, selectedSpace.members]);

  const totalAmount = Object.values(memberStats).reduce((acc, m) => acc + m.totalAmount, 0);
  const totalHours = Object.values(memberStats).reduce((acc, m) => acc + m.totalHours, 0);

  const period = `${currentMonth.startOf('month').format('M.D')} - ${currentMonth.endOf('month').format('M.D')}`;

  if (!user || !selectedSpace || selectedSpace.type !== 'team') {
    return (
      <View style={styles.centered}>
        <Text>팀 데이터를 불러오는 중...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top + 30 }]}
      contentContainerStyle={{ paddingBottom: insets.bottom + 60 }}
    >
      <View style={{ flex: 1, alignItems: 'center', marginBottom: 15 }}>
        <Text style={{ fontSize: 16, color: "#747474ff" }}>월별 급여 상세</Text>
      </View>

      <View style={styles.monthHeader}>
        <TouchableOpacity onPress={() => setCurrentMonth(currentMonth.subtract(1, 'month'))}>
          <Ionicons name="chevron-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.monthHeaderText}>{currentMonth.format('YYYY년 M월')}</Text>
        <TouchableOpacity onPress={() => setCurrentMonth(currentMonth.add(1, 'month'))}>
          <Ionicons name="chevron-forward" size={24} color="black" />
        </TouchableOpacity>
      </View>

      <View style={styles.totalCard}>
        <Text style={styles.totalSubText}>총 근무 시간 : {Math.round(totalHours)}시간</Text>
        <Text style={styles.totalMainText}>{Math.round(totalAmount).toLocaleString()}원</Text>
        <View style={styles.totalButtonRow}>
          <TouchableOpacity style={styles.button} onPress={() => {/* 너가 ViewShot 연결 */ }}>
            <Ionicons name="download-outline" size={16} color="#333" />
            <Text style={styles.buttonText}>  다운로드</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => {/* 너가 ViewShot 연결 */ }}>
            <Ionicons name="share-social-outline" size={16} color="#333" />
            <Text style={styles.buttonText}>  공유하기</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.workTitle}>멤버별 급여 상세</Text>

      <View style={styles.workCard}>
        {Object.entries(memberStats).map(([memberId, stat]) => (
          <TouchableOpacity
            key={memberId}
            style={styles.salaryCard}
            onPress={() =>
              router.push({
                pathname: '/detail/memberSalaryDetail',
                params: {
                  userId: memberId,
                  year: currentMonth.year(),
                  month: currentMonth.month() + 1
                }
              })
            }
          >
            <View style={[styles.colorBar, { backgroundColor: scheduleColors[stat.color]?.main || '#ccc' }]} />
            <View style={styles.cardTextContainer}>
              <Text style={styles.workName}>{stat.name}</Text>
              <Text style={styles.period}>{period}</Text>
            </View>
            <View style={styles.rightInfo}>
              <Text style={styles.amount}>{Math.round(stat.totalAmount).toLocaleString()}원</Text>
              <Ionicons name="chevron-forward" size={16} color="#999" />
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 16 },
  monthHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16
  },
  monthHeaderText: {
    fontSize: 18, fontWeight: '700', color: '#222'
  },
  totalCard: {
    backgroundColor: '#ecececff', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 20, marginBottom: 20, alignItems: 'center'
  },
  totalSubText: {
    fontSize: 14, color: '#666', marginBottom: 8
  },
  totalMainText: {
    fontSize: 24, fontWeight: 'bold', color: '#111', marginBottom: 16
  },
  workTitle: {
    fontSize: 16, color: '#575757ff', marginTop: 10, marginBottom: 16, marginLeft: 10,
  },
  workCard: {
    backgroundColor: '#ecececff', borderRadius: 8, paddingVertical: 20, paddingHorizontal: 10,
  },
  salaryCard: {
    flexDirection: 'row', alignItems: 'center', marginBottom: 16, backgroundColor: '#f9f9f9', borderRadius: 8, padding: 12
  },
  colorBar: {
    width: 4, height: 40, borderRadius: 2, marginRight: 12
  },
  cardTextContainer: {
    flex: 1
  },
  workName: {
    fontSize: 15, fontWeight: '600', color: '#333'
  },
  period: {
    fontSize: 12, color: '#999'
  },
  rightInfo: {
    flexDirection: 'row', alignItems: 'center', gap: 4
  },
  amount: {
    fontSize: 14, fontWeight: '600', color: '#222'
  },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  totalButtonRow: {
    flexDirection: 'row', gap: 10
  },
  button: {
    backgroundColor: '#d3d3d3ff',
    justifyContent: "center",
    alignItems: "center",
    width: "45%",
    paddingVertical: 15,
    paddingHorizontal: 14,
    borderRadius: 8,
    flexDirection: 'row'
  },
});
