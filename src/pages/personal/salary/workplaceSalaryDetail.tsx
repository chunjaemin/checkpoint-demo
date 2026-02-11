import React, { useMemo, useState, useEffect } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useUserStore } from '@/scripts/store/userStore';
import dayjs from 'dayjs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function WorkPlaceSalaryDetail() {
    const { id, year, month } = useLocalSearchParams();
    const router = useRouter();
    const user = useUserStore(state => state.user);
    const selectedSpaceId = useUserStore(state => state.selected_space);
    const selectedSpace = user?.spaces[selectedSpaceId];

    const initialMonth = useMemo(() => {
        if (year && month) {
            return dayjs(`${year}-${month}-01`);
        }
        return dayjs();
    }, [year, month]);

    const [currentMonth, setCurrentMonth] = useState(initialMonth);
    const insets = useSafeAreaInsets();

    const workPlace = selectedSpace?.workPlaces.find(w => w.id === id);
    const schedules = useMemo(() => {
        return selectedSpace?.schedules.filter(s =>
            s.workPlaceId === id &&
            dayjs(s.startTime).isSame(currentMonth, 'month')
        ) || [];
    }, [selectedSpace, id, currentMonth]);

    const stats = useMemo(() => {
        let totalAmount = 0;
        let totalHours = 0;
        const breakdown = {
            '기본 수당': { amount: 0, hours: 0, rate: 0, icon: 'ellipse', color: '#007aff' },
            '주휴 수당': { amount: 0, hours: 0, rate: 0, icon: 'calendar-outline', color: '#f39c12' },
            '야간 수당': { amount: 0, hours: 0, rate: 0, icon: 'moon-outline', color: '#9b59b6' },
            '초과근무 수당': { amount: 0, hours: 0, rate: 0, icon: 'time-outline', color: '#e74c3c' },
            '공휴일 수당': { amount: 0, hours: 0, rate: 0, icon: 'sunny-outline', color: '#27ae60' },
        };

        schedules.forEach(sch => {
            const start = dayjs(sch.startTime);
            const end = dayjs(sch.endTime);
            const dur = end.diff(start, 'hour', true);
            totalHours += dur;
            const base = sch.hourlyWage ?? workPlace?.hourlyWage ?? 10000;
            const basePay = base * dur;
            totalAmount += basePay;

            breakdown['기본 수당'].amount += basePay;
            breakdown['기본 수당'].hours += dur;
            breakdown['기본 수당'].rate = base;

            if (workPlace?.weeklyAllowance) {
                breakdown['주휴 수당'].amount += base * 1.1;
                breakdown['주휴 수당'].hours += 1;
                breakdown['주휴 수당'].rate = base;
            }
            if (workPlace?.nightAllowance && (start.hour() < 6 || end.hour() > 22)) {
                const extra = base * dur * ((workPlace.nightRate ?? 150) - 100) / 100;
                breakdown['야간 수당'].amount += extra;
                breakdown['야간 수당'].hours += dur;
                breakdown['야간 수당'].rate = base;
            }
            if (workPlace?.overtimeAllowance && dur > 8) {
                const extra = base * (dur - 8) * ((workPlace.overtimeRate ?? 150) - 100) / 100;
                breakdown['초과근무 수당'].amount += extra;
                breakdown['초과근무 수당'].hours += dur - 8;
                breakdown['초과근무 수당'].rate = base;
            }
            if (workPlace?.holidayAllowance && start.day() === 0) {
                const extra = base * dur * ((workPlace.holidayRate ?? 150) - 100) / 100;
                breakdown['공휴일 수당'].amount += extra;
                breakdown['공휴일 수당'].hours += dur;
                breakdown['공휴일 수당'].rate = base;
            }
        });

        return { totalAmount, totalHours, breakdown };
    }, [schedules]);

    const tax = Math.round(stats.totalAmount * 0.033);
    const afterTax = Math.round(stats.totalAmount) - tax;

    return (
        <ScrollView style={styles.container}>

            <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                <TouchableOpacity onPress={() => router.back()} style={[styles.backButton, { paddingTop: insets.top + 10 }]}>
                    <Ionicons name="chevron-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>
                    {workPlace?.name} 월별 급여 상세
                </Text>
            </View>

            <View style={styles.monthHeader}>
                <TouchableOpacity onPress={() => setCurrentMonth(prev => prev.subtract(1, 'month'))}>
                    <Ionicons name="chevron-back" size={20} color="#333" />
                </TouchableOpacity>
                <Text style={styles.monthText}>{currentMonth.format('YYYY년 M월')}</Text>
                <TouchableOpacity onPress={() => setCurrentMonth(prev => prev.add(1, 'month'))}>
                    <Ionicons name="chevron-forward" size={20} color="#333" />
                </TouchableOpacity>
            </View>

            <View style={styles.outerBox}>
                <View style={styles.sectionBox}>
                    <View style={styles.summaryCard}>
                        <Text style={styles.summaryTitle}>근무 시간: {Math.round(stats.totalHours)}시간</Text>
                        <Text style={styles.summaryAmount}>{afterTax.toLocaleString()}원</Text>
                    </View>
                    <View style={styles.actions}>
                        <TouchableOpacity style={styles.actionBtn}>
                            <Ionicons name="download-outline" size={20} />
                            <Text style={styles.actionText}>다운로드</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionBtn}>
                            <Ionicons name="share-social-outline" size={20} />
                            <Text style={styles.actionText}>공유하기</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {workPlace?.name && (
                    <Text style={styles.workplaceName}>{workPlace.name + currentMonth.format(' M월') + " 급여 상세"}</Text>
                )}

                <View style={styles.sectionBox}>
                    {Object.entries(stats.breakdown).map(([label, data]) => (
                        <View key={label} style={styles.card}>
                            <View style={styles.cardLeft}>
                                <Ionicons name={data.icon} size={20} color={data.color} style={{ marginRight: 8 }} />
                                <View>
                                    <Text style={styles.cardLabel}>{label}</Text>
                                    <Text style={styles.cardInfo}>
                                        {Math.round(data.rate).toLocaleString()}원 × {data.hours.toFixed(1)}시간
                                    </Text>
                                </View>
                            </View>
                            <Text style={styles.cardAmount}>{Math.round(data.amount).toLocaleString()}원</Text>
                        </View>
                    ))}
                </View>

                <View style={[styles.taxBoxRow]}>
                    <View style={styles.taxCard}>
                        <View style={styles.taxCardIconBoxGreen}>
                            <Ionicons name="wallet-outline" size={20} color="#fff" />
                        </View>
                        <View>
                            <Text style={styles.taxCardLabel}>세전 금액</Text>
                            <Text style={styles.taxCardAmount}>{Math.round(stats.totalAmount).toLocaleString()}원</Text>
                        </View>
                    </View>

                    <View style={styles.taxCard}>
                        <View style={styles.taxCardIconBoxRed}>
                            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>–</Text>
                        </View>
                        <View>
                            <Text style={styles.taxCardLabel}>세금 공제</Text>
                            <Text style={styles.taxCardAmount}>-{tax.toLocaleString()}원</Text>
                            <Text style={styles.taxCardSub}>
                                {Math.round(stats.totalAmount).toLocaleString()} × 3.3%
                            </Text>
                        </View>
                    </View>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#ffffff', padding: 20 },
    monthHeader: {
        flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 20, marginBottom: 20,
    },
    monthText: { fontSize: 18, fontWeight: 'bold' },
    sectionBox: {
        backgroundColor: '#F5F5F5',
        borderRadius: 12,
        padding: 10,
        marginBottom: 16,
    },
    summaryCard: {
        padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 20,
    },
    summaryTitle: { fontSize: 14, color: '#555' },
    summaryAmount: { fontSize: 30, fontWeight: 'bold', color: '#000', marginTop: 8 },
    actions: {
        flexDirection: 'row', justifyContent: 'space-around',
    },
    actionBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: "center", width: "45%", paddingVertical: 15, backgroundColor: '#e7e7e7ff', borderRadius: 8,
        shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
    },
    actionText: { fontSize: 13, marginLeft: 6 },
    card: {
        backgroundColor: '#ffffff', borderRadius: 12, padding: 16, marginBottom: 12,
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    },
    cardLeft: { flexDirection: 'row', alignItems: 'center' },
    cardLabel: { fontSize: 14, fontWeight: '600' },
    cardInfo: { fontSize: 12, color: '#888' },
    cardAmount: { fontSize: 16, fontWeight: 'bold' },
    taxBox: {
        backgroundColor: '#ffffff', borderRadius: 12, padding: 16, marginTop: 20,
    },
    taxRow: {
        flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8,
    },
    taxLabel: { fontSize: 14 },
    taxValue: { fontSize: 14 },
    taxBoxRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
        marginTop: 20,
    },
    taxCard: {
        flex: 1,
        backgroundColor: '#F5F5F5',
        borderRadius: 12,
        padding: 12,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 100,
    },
    taxCardIconBoxGreen: {
        width: 40,
        height: 40,
        backgroundColor: '#7adda3d9',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    taxCardIconBoxRed: {
        width: 40,
        height: 40,
        backgroundColor: '#ffb5b5ff',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    taxCardLabel: {
        fontSize: 13,
        color: '#333',
    },
    taxCardAmount: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#111',
    },
    taxCardSub: {
        fontSize: 11,
        color: '#999',
        marginTop: 2,
    },
    workplaceName: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'left',
        marginBottom: 8,
        color: '#222',
        marginTop: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
        position: 'relative',
    },
    backButton: {
        position: 'absolute',
        left: 0,
        paddingHorizontal: 10,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#222',
    },
});
