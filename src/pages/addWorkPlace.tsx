import React, { useState } from 'react';
import { View, Text, TextInput, Switch, Button, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { KeyboardAvoidingView, Platform } from 'react-native';
import { Keyboard, TouchableWithoutFeedback } from 'react-native';

type Allowances = {
    weekly: boolean;
    night: boolean;
    overtime: boolean;
    holiday: boolean;
    nightRate: number;
    overtimeRate: number;
    holidayRate: number;
};

export default function AddWorkPlace() {
    const [step, setStep] = useState(1);

    const [name, setName] = useState('');
    const [wage, setWage] = useState('');
    const [allowances, setAllowances] = useState<Allowances>({
        weekly: false,
        night: false,
        overtime: false,
        holiday: false,
        nightRate: 150,
        overtimeRate: 150,
        holidayRate: 150,
    });

    const isStep1Invalid = step === 1 && !name.trim();
    const isStep2Invalid = step === 2 && (!wage.trim() || parseInt(wage, 10) <= 0);
    const isDisabled = isStep1Invalid || isStep2Invalid;

    const handleNext = () => {
        if (step === 1) {
            if (!name.trim()) {
                return;
            }
            setStep(2);
        } else if (step === 2) {
            if (
                !wage.trim() ||                      // 빈칸
                isNaN(Number(wage)) ||               // 숫자가 아님
                parseInt(wage, 10) <= 0              // 0 이하
            ) {
                alert("숫자만 입력 해주세요.")
                return;
            }
            setStep(3);
        } else {
            // step === 3
            const newWorkPlace = {
                id: `wp_${Date.now()}`,
                name: name.trim(),
                color: "gray",
                hourlyWage: parseInt(wage, 10),
                weeklyAllowance: allowances.weekly,
                nightAllowance: allowances.night,
                nightRate: allowances.nightRate,
                overtimeAllowance: allowances.overtime,
                overtimeRate: allowances.overtimeRate,
                holidayAllowance: allowances.holiday,
                holidayRate: allowances.holidayRate,
                deductions: "4대 보험"
            };
            console.log(newWorkPlace);
            router.push("/personal/salary")
        }
    };

    const handleBack = () => {
        if (step > 1) {
            setStep(step - 1);
        }
    };

    const insets = useSafeAreaInsets();
    const router = useRouter();

    return (
        <View style={[styles.container, { marginTop: insets.top }]}>
            {step === 1 && (
                <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    keyboardVerticalOffset={40}
                >
                    <TouchableOpacity style={styles.backIcon} onPress={() => router.back()}>
                        <Ionicons name="chevron-back" size={28} color="#333" />
                    </TouchableOpacity>

                    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                        <View style={{ flex: 1, justifyContent: 'flex-start', marginTop: 80, paddingHorizontal: 20, }}>
                            <Text style={styles.title}>근무지 명을 입력해주세요</Text>
                            <Text style={styles.label}>근무지 명</Text>
                            <TextInput
                                style={styles.underlineInput}
                                placeholder="예) 근무지1"
                                value={name}
                                onChangeText={setName}
                            />
                        </View>
                    </TouchableWithoutFeedback>

                    <View style={{ paddingHorizontal: 20, marginBottom: insets.bottom }}>
                        <TouchableOpacity style={[styles.nextButton, { backgroundColor: isDisabled ? '#ccc' : '#007AFF' }]}
                            onPress={handleNext}
                            disabled={isDisabled}>
                            <Text style={styles.nextButtonText}>다음</Text>
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            )}

            {step === 2 && (
                <>
                    <KeyboardAvoidingView
                        style={{ flex: 1 }}
                        behavior={Platform.OS === "ios" ? "padding" : "height"}
                        keyboardVerticalOffset={40}
                    >
                        <TouchableOpacity style={styles.backIcon} onPress={handleBack}>
                            <Ionicons name="chevron-back" size={28} color="#333" />
                        </TouchableOpacity>


                        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                            <View style={{ flex: 1, justifyContent: 'flex-start', marginTop: 80, paddingHorizontal: 20 }}>
                                <Text style={styles.title}>시급을 입력해주세요</Text>
                                <Text style={styles.label}>시급</Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#ccc', paddingVertical: 8, marginBottom: 16 }}>
                                    <TextInput
                                        style={{ flex: 1 }}
                                        placeholder="10,030"
                                        keyboardType="numeric"
                                        value={wage}
                                        onChangeText={setWage}
                                    />
                                    <Text style={{ marginLeft: 8 }}>원</Text>
                                </View>
                                <Text style={styles.subText}>최저 10,030원</Text>
                            </View>
                        </TouchableWithoutFeedback>

                        <View style={{ paddingHorizontal: 20, marginBottom: insets.bottom }}>
                            <TouchableOpacity style={[styles.nextButton, { backgroundColor: isDisabled ? '#ccc' : '#007AFF' }]}
                                onPress={handleNext}
                                disabled={isDisabled}>
                                <Text style={styles.nextButtonText}>다음</Text>
                            </TouchableOpacity>
                        </View>
                    </KeyboardAvoidingView>
                </>
            )}

            {step === 3 && (
                <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    keyboardVerticalOffset={40}
                >
                    <TouchableOpacity style={styles.backIcon} onPress={handleBack}>
                        <Ionicons name="chevron-back" size={28} color="#333" />
                    </TouchableOpacity>

                    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                        <View style={{ flex: 1, justifyContent: 'flex-start', marginTop: 60, paddingHorizontal: 20 }}>
                            <Text style={styles.title}>추가 수당 여부를 설정해주세요</Text>

                            {/* 주휴 */}
                            <View style={styles.allowanceRow}>
                                <Text style={styles.allowanceLabel}>주휴 수당</Text>
                                <Switch
                                    style={{ marginTop: -2 }}
                                    value={allowances.weekly}
                                    onValueChange={val => setAllowances({ ...allowances, weekly: val })}
                                />
                            </View>

                            {/* 야간 */}
                            <View style={styles.allowanceRow}>
                                <Text style={styles.allowanceLabel}>야간 수당</Text>
                                <Switch
                                    style={{ marginTop: -2 }}
                                    value={allowances.night}
                                    onValueChange={val =>
                                        setAllowances({
                                            ...allowances,
                                            night: val,
                                            nightRate: val ? 150 : allowances.nightRate
                                        })
                                    }
                                />
                            </View>
                            {allowances.night && (
                                <>
                                    <Text style={styles.inputDesc}>야간 수당 금액</Text>
                                    <View style={styles.inputBelowRow}>
                                        <TextInput
                                            style={styles.rateInputFull}
                                            keyboardType="numeric"
                                            value={allowances.nightRate.toString()}
                                            onChangeText={text =>
                                                setAllowances({ ...allowances, nightRate: parseInt(text) || 0 })
                                            }
                                        />
                                        <Text style={styles.percent}>%</Text>
                                    </View>
                                </>
                            )}

                            {/* 연장 */}
                            <View style={styles.allowanceRow}>
                                <Text style={styles.allowanceLabel}>연장 수당</Text>
                                <Switch
                                    style={{ marginTop: -2 }}
                                    value={allowances.overtime}
                                    onValueChange={val =>
                                        setAllowances({
                                            ...allowances,
                                            overtime: val,
                                            overtimeRate: val ? 150 : allowances.overtimeRate
                                        })
                                    }
                                />
                            </View>
                            {allowances.overtime && (
                                <>
                                    <Text style={styles.inputDesc}>연장 수당 금액</Text>
                                    <View style={styles.inputBelowRow}>
                                        <TextInput
                                            style={styles.rateInputFull}
                                            keyboardType="numeric"
                                            value={allowances.overtimeRate.toString()}
                                            onChangeText={text =>
                                                setAllowances({ ...allowances, overtimeRate: parseInt(text) || 0 })
                                            }
                                        />
                                        <Text style={styles.percent}>%</Text>
                                    </View>
                                </>
                            )}

                            {/* 휴일 */}
                            <View style={styles.allowanceRow}>
                                <Text style={styles.allowanceLabel}>휴일 수당</Text>
                                <Switch
                                    style={{ marginTop: -2 }}
                                    value={allowances.holiday}
                                    onValueChange={val =>
                                        setAllowances({
                                            ...allowances,
                                            holiday: val,
                                            holidayRate: val ? 150 : allowances.holidayRate
                                        })
                                    }
                                />
                            </View>
                            {allowances.holiday && (
                                <>
                                    <Text style={styles.inputDesc}>휴일 수당 금액</Text>
                                    <View style={styles.inputBelowRow}>
                                        <TextInput
                                            style={styles.rateInputFull}
                                            keyboardType="numeric"
                                            value={allowances.holidayRate.toString()}
                                            onChangeText={text =>
                                                setAllowances({ ...allowances, holidayRate: parseInt(text) || 0 })
                                            }
                                        />
                                        <Text style={styles.percent}>%</Text>
                                    </View>
                                </>
                            )}
                        </View>
                    </TouchableWithoutFeedback>

                    <View style={{ paddingHorizontal: 20, marginBottom: insets.bottom }}>
                        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
                            <Text style={styles.nextButtonText}>다음</Text>
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            )}

            {/* <View style={styles.buttonRow}>
                {step > 1 && (
                    <TouchableOpacity style={[styles.button, styles.backButton]} onPress={handleBack}>
                        <Text style={styles.buttonText}>이전</Text>
                    </TouchableOpacity>
                )}
                <TouchableOpacity style={styles.button} onPress={handleNext}>
                    <Text style={styles.buttonText}>{step === 3 ? '저장' : '다음'}</Text>
                </TouchableOpacity>
            </View> */}
        </View>
    );
}

// 재사용 가능한 스위치 컴포넌트
function renderSwitch(label: string, value: boolean, onChange: (val: boolean) => void) {
    return (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 8 }}>
            <Text style={{ flex: 1 }}>{label}</Text>
            <Switch value={value} onValueChange={onChange} />
        </View>
    );
}

// 재사용 가능한 퍼센트 입력
function renderRateInput(label: string, rate: number, onChange: (val: number) => void) {
    return (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 4 }}>
            <Text style={{ flex: 1 }}>{label} 금액</Text>
            <TextInput
                style={[styles.input, { width: 60 }]}
                keyboardType="numeric"
                value={rate.toString()}
                onChangeText={text => onChange(parseInt(text) || 0)}
            />
            <Text>%</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, paddingTop: 20, backgroundColor: "white" },
    backIcon: { marginBottom: 20 },
    title: { fontSize: 18, fontWeight: 'bold', marginBottom: 24, textAlign: "center" },
    label: { fontSize: 14, color: '#555', marginBottom: 4 },
    underlineInput: {
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        paddingVertical: 8,
        marginBottom: 16
    },
    nextButton: {
        backgroundColor: '#007AFF',
        paddingVertical: 14,
        alignItems: 'center',
        borderRadius: 6,
        width: '100%',
    },
    nextButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    allowanceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
    },
    allowanceLabel: {
        fontSize: 16,
        lineHeight: 24,
        color: '#333'
    },
    inputDesc: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
        marginLeft: 8
    },
    inputBelowRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        marginLeft: 8
    },
    rateInputFull: {
        borderBottomWidth: 1,
        borderBottomColor: '#007AFF',
        paddingVertical: 4,
        flex: 1,
        marginRight: 6,
        fontSize: 16,
        color: '#333'
    },
    percent: {
        fontSize: 16,
        color: '#333'
    }
});
