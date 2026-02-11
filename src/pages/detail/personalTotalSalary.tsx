import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useUserStore } from '@/scripts/store/userStore';
import dayjs from 'dayjs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function PersonalTotalSalary() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const user = useUserStore(state => state.user);
    const selectedSpaceIndex = useUserStore(state => state.selected_space);
    const selectedSpace = user?.spaces[selectedSpaceIndex];

    const [currentMonth, setCurrentMonth] = useState(dayjs('2025-06-01'));

    // 현재 달 스케줄 필터
    const monthSchedules = useMemo(() => {
        if (!selectedSpace) return [];
        return selectedSpace.schedules.filter(schedule =>
            dayjs(schedule.startTime).isSame(currentMonth, 'month')
        );
    }, [selectedSpace, currentMonth]);

    // 근무 수당 계산
    const workPays = useMemo(() => {
        const pays = {};
        monthSchedules.forEach(sch => {
            const duration = dayjs(sch.endTime).diff(dayjs(sch.startTime), 'hour', true);
            if (!pays[sch.name]) {
                pays[sch.name] = { amount: 0, hours: 0, hourlyWage: sch.hourlyWage, days: 0 };
            }
            pays[sch.name].amount += duration * sch.hourlyWage;
            pays[sch.name].hours += duration;
            pays[sch.name].days += 1;
        });
        return pays;
    }, [monthSchedules]);
    const totalWorkAmount = Object.values(workPays).reduce((acc, w) => acc + w.amount, 0);

    // 근무지별 주 단위 주휴 수당
    const weeklyPayPerWorkPlace = useMemo(() => {
        if (!selectedSpace) return {};

        const pays = {};

        selectedSpace.workPlaces.forEach(work => {
            const workSchedules = monthSchedules.filter(sch => sch.workPlaceId === work.id);
            const weeks = {};

            workSchedules.forEach(sch => {
                const weekStart = dayjs(sch.startTime).startOf('week').format('M.D');
                const weekEnd = dayjs(sch.startTime).endOf('week').format('M.D');
                const key = `${weekStart}~${weekEnd}`;

                const duration = dayjs(sch.endTime).diff(dayjs(sch.startTime), 'hour', true);

                if (!weeks[key]) {
                    weeks[key] = { totalHours: 0, hourlyWage: sch.hourlyWage };
                }
                weeks[key].totalHours += duration;
            });

            pays[work.name] = weeks;
        });

        return pays;
    }, [selectedSpace, monthSchedules]);

    // 총 주휴 수당
    const totalWeeklyPay = Object.values(weeklyPayPerWorkPlace).reduce((acc, weeks) => {
        return acc + Object.values(weeks).reduce((innerAcc, w) => {
            const weeklyPay = w.totalHours >= 15 ? ((w.totalHours / 40) * 8 * w.hourlyWage) : 0;
            return innerAcc + weeklyPay;
        }, 0);
    }, 0);

    // 세금
    const taxes = useMemo(() => {
        const pays = {};
        Object.entries(workPays).forEach(([name, w]) => {
            const tax = w.amount * 0.0418;
            pays[name] = tax;
        });
        return pays;
    }, [workPays]);
    const totalTax = Object.values(taxes).reduce((acc, t) => acc + t, 0);

    // 총 금액 & 시간
    const totalAmount = totalWorkAmount + totalWeeklyPay - totalTax;
    const totalHours = Object.values(workPays).reduce((acc, w) => acc + w.hours, 0);

    return (
        <ScrollView style={[styles.container, { marginTop: insets.top }]}>
            {/* 헤더 */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="chevron-back" size={28} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>달별 급여 상세</Text>
                <View style={{ width: 28 }} />
            </View>

            {/* 월 선택 */}
            <View style={styles.monthContainer}>
                <TouchableOpacity onPress={() => setCurrentMonth(prev => prev.subtract(1, 'month'))}>
                    <Ionicons name="chevron-back" size={20} color="#333" />
                </TouchableOpacity>
                <Text style={styles.monthText}>{currentMonth.format('YYYY년 M월')}</Text>
                <TouchableOpacity onPress={() => setCurrentMonth(prev => prev.add(1, 'month'))}>
                    <Ionicons name="chevron-forward" size={20} color="#333" />
                </TouchableOpacity>
            </View>

            <Text style={styles.totalAmount}>{Math.round(totalAmount).toLocaleString()}원</Text>
            <Text style={styles.totalHours}>{Math.round(totalHours)}시간</Text>

            <View style={styles.divider} />

            {/* 근무 수당 */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>근무 수당</Text>
                {Object.entries(workPays).map(([name, w]) => (
                    <SalaryItem
                        key={name}
                        name={name}
                        amount={Math.round(w.amount)}
                        detail={`${Math.round(w.hours)}시간 (${w.days}일) ${w.hourlyWage.toLocaleString()} x ${Math.round(w.hours)}시간`}
                    />
                ))}
                <Text style={styles.totalLine}>총 액 {Math.round(totalWorkAmount).toLocaleString()}원</Text>
            </View>

            {/* 주휴 수당 */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>주휴 수당</Text>
                {Object.entries(weeklyPayPerWorkPlace).map(([workName, weeks]) => {
                    const totalWeeklyPay = Object.values(weeks).reduce((acc, w) => {
                        const weeklyPay = w.totalHours >= 15 ? ((w.totalHours / 40) * 8 * w.hourlyWage) : 0;
                        return acc + weeklyPay;
                    }, 0);

                    return (
                        <View key={workName} style={{ marginBottom: 12 }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                <Text style={styles.itemName}>{workName}</Text>
                                <Text style={styles.itemAmount}>{Math.round(totalWeeklyPay).toLocaleString()}원</Text>
                            </View>

                            {Object.entries(weeks).map(([weekRange, w], idx) => (
                                <View key={idx} style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
                                    <Text style={styles.itemDetail}>{`${weekRange} (${Math.round(w.totalHours)}시간)`}</Text>
                                    <Text style={styles.itemDetail}>
                                        {w.totalHours >= 15
                                            ? `(${Math.round(w.totalHours)}/40)x8x${w.hourlyWage.toLocaleString()}`
                                            : `주 15시간 미만`}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    );
                })}
                <Text style={styles.totalLine}>
                    총 액 {Math.round(totalWeeklyPay).toLocaleString()}원
                </Text>
            </View>

            {/* 세금 */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>세금</Text>
                {Object.entries(taxes).map(([name, tax]) => (
                    <SalaryItem
                        key={name}
                        name={name}
                        amount={-Math.round(tax)}
                        detail={`4대 보험(4.18%) ${Math.round(workPays[name].amount).toLocaleString()} x 4.18%`}
                    />
                ))}
                <Text style={styles.totalLine}>
                    총 액 -{Math.round(totalTax).toLocaleString()}원
                </Text>
            </View>
        </ScrollView>
    );
}

function SalaryItem({ name, amount, detail }) {
    return (
        <View style={{ marginBottom: 10 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={styles.itemName}>{name}</Text>
                <Text style={styles.itemAmount}>{amount.toLocaleString()}원</Text>
            </View>
            <Text style={styles.itemDetail}>{detail}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff', padding: 20 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
    headerTitle: { fontSize: 16, fontWeight: '600', color: '#333' },
    monthContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
    monthText: { fontSize: 20, fontWeight: '600', marginHorizontal: 12 },
    totalAmount: { fontSize: 26, fontWeight: '700', color: '#333', textAlign: 'center' },
    totalHours: { fontSize: 14, color: '#777', textAlign: 'center', marginBottom: 16 },
    divider: { height: 1, backgroundColor: '#eee', marginBottom: 16 },
    card: { backgroundColor: '#fafafa', borderRadius: 10, padding: 16, marginBottom: 20 },
    cardTitle: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 12 },
    itemName: { fontSize: 14, fontWeight: '600', color: '#333' },
    itemAmount: { fontSize: 14, fontWeight: '600', color: '#333' },
    itemDetail: { fontSize: 12, color: '#666', marginTop: 2 },
    totalLine: { textAlign: 'right', fontSize: 14, fontWeight: '600', color: '#000', marginTop: 8 },
});
