import { useUserStore } from '@/scripts/store/userStore';
import { Feather } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scheduleColors } from '@/scripts/color/scheduleColor';

import { useLocalSearchParams, useRouter } from 'expo-router';

// navigation param: memberId
export default function TeamScheduleDetail() {
  const route = useRoute();
  const navigation = useNavigation();
  const router = useRouter();
  const params = useLocalSearchParams();

  const insets = useSafeAreaInsets();

  // memberId는 route.params로 전달됨
  const memberId =
    (route.params as any)?.memberId ??
    (params.memberId ?? params.id);
  const user = useUserStore((state) => state.user);
  const selectedSpaceId = useUserStore((state) => state.selected_space)
  // 팀 멤버 찾기
  const teamSpace = user?.spaces[selectedSpaceId];
  const member = teamSpace?.members?.find((m) => m.id === memberId);

  if (!member) {
    return (
      <View style={styles.centered}><Text>팀원 정보를 찾을 수 없습니다.</Text></View>
    );
  }

  return (
    <View style={styles.container}>

      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={22} color="#222" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>사용자 정보</Text>
        <TouchableOpacity onPress={() => router.push(`/team/members/${member.id}/edit`)}>
          <Text style={styles.editBtn}>수정</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>개인 정보</Text>
        <View style={styles.infoRow}><Text style={styles.label}>이름</Text><Text style={styles.value}>{member.name}</Text></View>
        <View style={styles.infoRow}><Text style={styles.label}>이메일</Text><Text style={styles.value}>{member.email || '-'}</Text></View>
        <View style={styles.infoRow}><Text style={styles.label}>전화번호</Text><Text style={styles.value}>{member.phone || '-'}</Text></View>
      </View>

      <View style={styles.card}>
        <View style={styles.infoRow}>
          <Text style={styles.label}>색상</Text>
          <View style={[styles.colorDot, { backgroundColor: scheduleColors[member.color].main || '#ccc' }]} />
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>직급</Text>
          <Text style={styles.value}>
            {
              member.role === "admin" ? "관리자" : "직원"
            }
          </Text></View>
        <View style={styles.infoRow}><Text style={styles.label}>시급</Text><Text style={styles.value}>{member.hourlyWage?.toLocaleString()} 원</Text></View>
      </View>

      <View style={styles.card}>
        <View style={styles.infoRow}>
          <Text style={styles.label}>주휴 수당</Text>
          <Text style={[styles.appliedOption, member.weeklyAllowance ? styles.applied : styles.notApplied]}>{member.weeklyAllowance ? '적용' : '미적용'}</Text>
          <Text style={styles.labelRight}>근무 시간(주) / 40</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>야간 수당</Text>
          <Text style={[styles.appliedOption, member.nightAllowance ? styles.applied : styles.notApplied]}>{member.nightAllowance ? '적용' : '미적용'}</Text>
          <Text style={styles.valueRight}>{member.nightRate || 150}%</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>연장 수당</Text>
          <Text style={[styles.appliedOption, member.overtimeAllowance ? styles.applied : styles.notApplied]}>{member.overtimeAllowance ? '적용' : '미적용'}</Text>
          <Text style={styles.valueRight}>{member.overtimeRate || 150}%</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>휴일 수당</Text>
          <Text style={[styles.appliedOption, member.holidayAllowance ? styles.applied : styles.notApplied]}>{member.holidayAllowance ? '적용' : '미적용'}</Text>
          <Text style={styles.valueRight}>{member.holidayRate || 150}%</Text>
        </View>
      </View>
      <View style={styles.card}>
        <View style={styles.infoRow}>
          <Text style={styles.label}>세금 적용</Text>
          <Text style={styles.value}>
            {member.deductions ? member.deductions : '미적용'}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafbfc',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
  },
  editBtn: {
    color: '#888',
    fontSize: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  sectionTitle: {
    color: '#888',
    fontSize: 13,
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    color: '#222',
    fontSize: 15,
    minWidth: 70,
    textAlign: 'left',
  },
  appliedOption: {
    color: '#222',
    fontSize: 15,
    marginLeft: 8,
    flex: 1,
    textAlign: 'left',
  },
  value: {
    color: '#222',
    fontSize: 15,
    marginLeft: 8,
    flex: 1,
    textAlign: 'right',
  },
  colorDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginLeft: 8,
  },
  applied: {
    color: '#007AFF',
  },
  notApplied: {
    color: '#FF3B30',
  },
  labelRight: {
    color: '#888',
    fontSize: 13,
    marginLeft: 'auto',
  },
  valueRight: {
    color: '#888',
    fontSize: 15,
    marginLeft: 'auto',
    minWidth: 40,
    textAlign: 'right',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 