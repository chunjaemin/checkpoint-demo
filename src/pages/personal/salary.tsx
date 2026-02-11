import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useUserStore } from '@/scripts/store/userStore';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import dayjs from 'dayjs';
import { scheduleColors } from '@/scripts/color/scheduleColor';

export default function PersonalSalary() {
  const user = useUserStore(state => state.user);
  const selectedSpaceIndex = useUserStore(state => state.selected_space);
  // 도메인 타입이 아직 정리되지 않아 화면에서는 느슨하게 처리합니다.
  const selectedSpace = (user?.spaces?.[selectedSpaceIndex] as any) ?? null;
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [currentMonth, setCurrentMonth] = useState(dayjs());

  useEffect(() => {
    setCurrentMonth(prev => prev.clone()); // 강제 리렌더 유도
  }, [user]); // 또는 user.spaces.length 등

  if (!user || !selectedSpace) {
    return (
      <View style={styles.centered}>
        <Text>사용자 데이터를 불러오는 중...</Text>
      </View>
    );
  }

  const monthSchedules = useMemo(() => {
    const schedules = (selectedSpace?.schedules ?? []) as any[];
    return schedules.filter((schedule) => dayjs(schedule.startTime).isSame(currentMonth, 'month'));
  }, [selectedSpace, currentMonth]);

  const workPlaceStats = useMemo(() => {
    const stats: Record<string, { name: string; color: any; totalAmount: number; totalHours: number }> = {};
    monthSchedules.forEach(sch => {
      const duration = dayjs(sch.endTime).diff(dayjs(sch.startTime), 'hour', true);
      if (!stats[sch.workPlaceId]) {
        stats[sch.workPlaceId] = { name: sch.name, color: sch.color, totalAmount: 0, totalHours: 0 };
      }
      stats[sch.workPlaceId].totalAmount += duration * sch.hourlyWage;
      stats[sch.workPlaceId].totalHours += duration;
    });
    return stats;
  }, [monthSchedules]);

  const totalAmount = Object.values(workPlaceStats).reduce((acc, w) => acc + w.totalAmount, 0);
  const totalHours = Object.values(workPlaceStats).reduce((acc, w) => acc + w.totalHours, 0);

  const period = `${currentMonth.startOf('month').format('M.D')} - ${currentMonth.endOf('month').format('M.D')}`;

  return (
    <ScrollView style={[styles.container, { paddingTop: insets.top + 30 }]}>
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
        <Text style={styles.totalSubText}>근무 시간 : {Math.round(totalHours)}시간</Text>
        <Text style={styles.totalMainText}>{Math.round(totalAmount).toLocaleString()}원</Text>
        <View style={styles.totalButtonRow}>
          <TouchableOpacity style={styles.button}><Ionicons name="download-outline" size={16} color="#333" /><Text style={styles.buttonText}>  다운로드</Text></TouchableOpacity>
          <TouchableOpacity style={styles.button}><Ionicons name="share-social-outline" size={16} color="#333" /><Text style={styles.buttonText}>  공유하기</Text></TouchableOpacity>
        </View>
      </View>

      <Text style={styles.workTitle}>근무지별 급여 상세</Text>

      <View style={styles.workCard}>
        {(selectedSpace?.workPlaces ?? []).map((wp: any) => {
          const stats = workPlaceStats[wp.id] ?? { totalAmount: 0, totalHours: 0 };
          return (
            <TouchableOpacity
              key={wp.id}
              style={styles.salaryCard}
              onPress={() =>
                router.push({
                  // 상세 라우트: /personal/salary/workplace/[id]
                  pathname: '/personal/salary/workplace/[id]' as any,
                  params: {
                    id: wp.id,
                    year: currentMonth.year(),
                    month: currentMonth.month() + 1  // dayjs는 0-indexed month라서 +1
                  },
                })
              }
            >
              <View style={[styles.colorBar, { backgroundColor: (scheduleColors as any)[wp.color]?.main || '#ccc' }]} />
              <View style={styles.cardTextContainer}>
                <Text style={styles.workName}>{wp.name}</Text>
                <Text style={styles.period}>{period}</Text>
              </View>
              <View style={styles.rightInfo}>
                <Text style={styles.amount}>{Math.round(stats.totalAmount).toLocaleString()}원</Text>
                <Ionicons name="chevron-forward" size={16} color="#999" />
              </View>
            </TouchableOpacity>
          );
        })}

        <TouchableOpacity style={styles.addRow} onPress={() => router.push("/addWorkPlace")}>
          <Text style={styles.addText}>+ 근무지 추가하기</Text>
        </TouchableOpacity>
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
  totalButtonRow: {
    flexDirection: 'row', gap: 10
  },
  button: {
    backgroundColor: '#d3d3d3ff', justifyContent: "center", alignContent: "center", width: "45%", paddingVertical: 15, paddingHorizontal: 14, borderRadius: 8, flexDirection: 'row', alignItems: 'center'
  },
  buttonText: {
    fontSize: 13, color: '#333'
  },
  workCard: {
    backgroundColor: '#ecececff', borderRadius: 8, paddingVertical: 20, paddingHorizontal: 10,
  },
  workTitle: {
    fontSize: 16, color: '#575757ff', marginTop: 10, marginBottom: 16, marginLeft: 10,
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
  addRow: {
    flexDirection: 'row', alignItems: 'center'
  },
  addText: {
    color: '#555', fontSize: 14
  },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
