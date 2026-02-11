// WeekEdit.tsx (주별로 셀 상태 관리 및 일정 저장 - 디버깅 코드 제거, 방어 코드 적용)
import React, { useState, useRef, useMemo } from 'react';
import { View, Text, TouchableOpacity, Pressable, StyleSheet, InteractionManager } from 'react-native';
import { useUserStore } from '@/scripts/store/userStore';
import { useCalTypeStore, useEditDateStore } from '@/scripts/store/personalStore';

import PagerView from 'react-native-pager-view';
import Modal from 'react-native-modal';
import dayjs from 'dayjs';
import { Ionicons } from '@expo/vector-icons';
import WeekPage from '@/components/personal/weekPage';
import { is } from 'date-fns/locale';
import { scheduleColors } from '@/scripts/color/scheduleColor';

export default function WeekEdit() {
    const pagerRef = useRef(null);
    const { date: initialEditDate } = useEditDateStore();
    const [baseDate, setBaseDate] = useState(
        initialEditDate ? dayjs(initialEditDate).startOf('week') : dayjs().startOf('week')
    );

    const user = useUserStore((state) => state.user);
    const selectedSpaceIndex = useUserStore((state) => state.selected_space);
    const setUser = useUserStore((state) => state.setUser);
    const spaces = user?.spaces[selectedSpaceIndex]?.workPlaces;

    const calendarTypeBtn = useCalTypeStore((state) => state.type);
    const setCalType = useCalTypeStore((state) => state.setCalType);

    const [currentOffset, setCurrentOffset] = useState(0);
    const [spaceModalVisible, setSpaceModalVisible] = useState(false);
    const [selectedSpace, setSelectedSpace] = useState("선택 안함"); // 기본값으로 첫 번째 근무지 이름 설정
    const [scrollEnabled, setScrollEnabled] = useState(true);
    const [selectedCellsMap, setSelectedCellsMap] = useState<{
        [weekStart: string]: Record<number, number[]>;
    }>({});

    function isAllCellsEmpty(selectedCellsMap) {
        if (!selectedCellsMap || typeof selectedCellsMap !== 'object') {
            return true; 
        }

        const weekKeys = Object.keys(selectedCellsMap);

        if (weekKeys.length === 0) {
            return true;
        }

        for (const weekKey of weekKeys) {
            const dailyCells = selectedCellsMap[weekKey]; 

            if (!dailyCells || typeof dailyCells !== 'object') {
                return false;
            }

            const dayKeys = Object.keys(dailyCells); 

            if (dayKeys.length === 0) {
                continue; 
            }

            for (const dayKey of dayKeys) {
                const cellsArray = dailyCells[dayKey]; 
                if (!Array.isArray(cellsArray) || cellsArray.length > 0) {
                    return false; 
                }
            }
        }
        return true;
    }


    const hours = useMemo(() => Array.from({ length: 48 }, (_, i) => i * 0.5), []);

    const handlePageSelected = (e) => {
        const newPage = e.nativeEvent.position;
        const offset = newPage - 1;

        if (offset !== 0) {
            setScrollEnabled(false);
            const newBase = baseDate.add(offset * 7, 'day');
            setTimeout(() => {
                setBaseDate(newBase);
                setCurrentOffset(0);
                pagerRef.current?.setPageWithoutAnimation(1);
                InteractionManager.runAfterInteractions(() => {
                    setScrollEnabled(true);
                });
            }, 0);
        }
    };

    const handleSave = () => {
        if (selectedSpace === "선택 안함") {
            alert("수정할 근무지를 선택해주세요.");
            return;
        }
        if (isAllCellsEmpty(selectedCellsMap)) {
            alert("시간을 선택해 주세요.");
            return;
        }
        const weekKey = baseDate.startOf('week').format('YYYY-MM-DD');
        const cells = selectedCellsMap[weekKey];
        if (!user || !user.spaces || !user.spaces[selectedSpaceIndex] || !cells) return;

        const currentSpace = user.spaces[selectedSpaceIndex];
        const updatedSchedules = [];

        for (const col in cells) {
            const colIdx = parseInt(col);
            if (!cells[colIdx] || cells[colIdx].length === 0) continue;

            const rows = [...cells[colIdx]].sort((a, b) => a - b);
            let startIdx = null;

            for (let i = 0; i <= rows.length; i++) {
                if (startIdx === null) startIdx = rows[i];

                if (i === rows.length || rows[i] + 1 !== rows[i + 1]) {
                    const rowStart = startIdx;
                    const rowEnd = rows[i];
                    const startHour = hours[rowStart];
                    const endHour = hours[rowEnd] + 0.5;

                    if (!Number.isFinite(startHour) || !Number.isFinite(endHour)) {
                        startIdx = null;
                        continue;
                    }

                    const date = baseDate.startOf('week').add(colIdx, 'day');
                    const startTime = date.add(startHour, 'hour').toISOString();
                    const endTime = date.add(endHour, 'hour').toISOString();

                    const workPlace = currentSpace.workPlaces.find(wp => wp.name === selectedSpace);

                    updatedSchedules.push({
                        id: `schedule_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
                        name: selectedSpace,
                        workPlaceId: workPlace?.id || null,
                        startTime,
                        endTime,
                        memo: '',
                        color: workPlace?.color || '#CCCCCC',
                        hourlyWage: workPlace?.hourlyWage || null,
                    });

                    startIdx = null;
                }
            }
        }
        //유저 정보에 넣는 부분, 로컬에서 반영 된 것 처럼 보이게 해줌 
        const newUser = { ...user };
        newUser.spaces[selectedSpaceIndex].schedules = [
            ...newUser.spaces[selectedSpaceIndex].schedules,
            ...updatedSchedules
        ];
        setUser(newUser);
        setCalType('월')
    };


    return (
        <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', padding: 10, backgroundColor: 'white' }}>
                {calendarTypeBtn === '편집' && (
                    <Pressable onPress={() => setCalType('월')}>
                        <Text style={styles.closeIcon}>×</Text>
                    </Pressable>
                )}
            </View>

            <PagerView
                ref={pagerRef}
                initialPage={1}
                onPageSelected={handlePageSelected}
                scrollEnabled={scrollEnabled}
                style={{ flex: 1 }}
            >
                {[-1, 0, 1].map((offset) => {
                    const targetDate = baseDate.add(offset * 7, 'day');
                    const weekKey = targetDate.startOf('week').format('YYYY-MM-DD');
                    return (
                        <WeekPage
                            key={offset}
                            offset={offset}
                            baseDate={baseDate}
                            selectedSpace={selectedSpace}
                            setSpaceModalVisible={setSpaceModalVisible}
                            hours={hours}
                            displayDate={targetDate}
                            selectedCells={selectedCellsMap[weekKey] || {}}
                            onCellToggle={(col, row) => {
                                setSelectedCellsMap((prev) => {
                                    const prevCells = prev[weekKey] || {};
                                    const colSelection = prevCells[col] || [];
                                    const updated = colSelection.includes(row)
                                        ? colSelection.filter((r) => r !== row)
                                        : [...colSelection, row];
                                    return {
                                        ...prev,
                                        [weekKey]: { ...prevCells, [col]: updated },
                                    };
                                });
                            }}
                        />
                    );
                })}
            </PagerView>

            <TouchableOpacity style={styles.dropdown} onPress={() => setSpaceModalVisible(true)}>
                <View style={styles.dropdownContent}>
                    <Text style={styles.dropdownText}>{selectedSpace}</Text>
                    <Ionicons name="chevron-down" size={18} color="#555" />
                </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveText}>저장 하기</Text>
            </TouchableOpacity>

            <Modal
                isVisible={spaceModalVisible}
                onBackdropPress={() => setSpaceModalVisible(false)}
                animationIn="slideInUp"
                animationOut="slideOutDown"
                backdropOpacity={0.4}
                style={{ margin: 0, justifyContent: 'flex-end' }}
            >
                <View style={{ backgroundColor: 'white', padding: 20, paddingBottom: 100, borderTopLeftRadius: 12, borderTopRightRadius: 12 }}>
                    <View style={{ alignItems: 'center', marginBottom: 16 }}>
                        <Text style={{ fontSize: 16 }}>수정할 근무지</Text>
                    </View>

                    {spaces.map((space, i) => (
                        <View key={i} style={{ flexDirection: 'row', alignItems: 'center', overflow: 'hidden', marginBottom: 8 }}>
                            <View style={{
                                width: 6,
                                height: '100%',
                                backgroundColor: scheduleColors[space.color].main,
                                borderTopLeftRadius: 4,
                                borderBottomLeftRadius: 4,
                                borderTopRightRadius: 4,
                                borderBottomRightRadius: 4,
                            }} />
                            <TouchableOpacity
                                onPress={() => {
                                    setSelectedSpace(space.name);
                                    setSpaceModalVisible(false);
                                }}
                                style={{ flex: 1, paddingVertical: 10, paddingHorizontal: 12 }}
                            >
                                <Text>{space.name}</Text>
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    dropdown: {
        margin: 10,
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 6,
        backgroundColor: '#f9f9f9',
    },
    dropdownContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    dropdownText: { fontSize: 14, color: '#000' },
    saveButton: {
        backgroundColor: '#3399ff',
        padding: 12,
        marginHorizontal: 10,
        marginBottom: 20,
        borderRadius: 6,
    },
    saveText: { color: 'white', textAlign: 'center', fontWeight: 'bold' },
    closeIcon: {
        fontSize: 24,
        color: 'red',
        fontWeight: 'bold',
        marginRight: 8,
    },
});
