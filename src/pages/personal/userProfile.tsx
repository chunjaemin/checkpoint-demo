import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useUserStore } from '../../scripts/store/userStore';

export default function MyProfile() {
  const user = useUserStore(state => state.user);

  return (
    <View style={styles.container}>
      {/* 프로필 */}
      <View style={styles.profileSection}>
        <Image
          source={require('../../assets/images/favicon.png')}
          style={styles.profileImage}
        />
        <Text style={styles.nameText}>{user.name}</Text>
      </View>

      {/* 정보 타이틀 */}
      <View style={styles.infoHeader}>
        <Text style={styles.infoTitle}>개인정보</Text>
        <TouchableOpacity>
          <Feather name="edit" size={18} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {/* 입력 필드 2열 */}
      <View style={styles.row}>
        <View style={styles.inputBox}>
          <Text style={styles.label}>이름</Text>
          <Text style={styles.underlineInput}>{user.name}</Text>
        </View>
        <View style={styles.inputBox}>
          <Text style={styles.label}>생년월일</Text>
          <Text style={styles.underlineInput}>{user.birth || '1990-05-15'}</Text>
        </View>
      </View>
      <View style={styles.row}>
        <View style={styles.inputBox}>
          <Text style={styles.label}>전화번호</Text>
          <Text style={styles.underlineInput}>{user.phone}</Text>
        </View>
        <View style={styles.inputBox}>
          <Text style={styles.label}>이메일</Text>
          <Text style={styles.underlineInput}>{user.email}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 48,
    backgroundColor: '#fff',
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 36,
  },
  profileImage: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#eee',
    marginBottom: 12,
  },
  nameText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#222',
  },
  infoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 24,
  },
  inputBox: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    color: '#888',
    marginBottom: 6,
  },
  underlineInput: {
    fontSize: 16,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    color: '#000',
  },
});

