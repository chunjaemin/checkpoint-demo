import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import Modal from 'react-native-modal';
import { useRouter } from 'expo-router';

import type { MemberRole, SpaceMember } from '@/entities/user';
import { scheduleColors } from '@/shared/config/scheduleColors';

type Props = {
  members: SpaceMember[];
  currentUserRole: MemberRole | null;
  hidden?: boolean;
};

export function TeamCalendarMenu({ members, currentUserRole, hidden }: Props) {
  const router = useRouter();
  const [menuModalVisible, setMenuModalVisible] = useState(false);
  const [teamInfoModalVisible, setTeamInfoModalVisible] = useState(false);
  const [nextAction, setNextAction] = useState<null | (() => void)>(null);

  if (hidden) return null;

  return (
    <>
      <Pressable
        style={({ pressed }) => [styles.rightbottomMenuBtn, pressed && { opacity: 0.7 }]}
        onPress={() => setMenuModalVisible(true)}
      >
        <Feather name="menu" size={24} color="white" />
      </Pressable>

      <Modal
        isVisible={menuModalVisible}
        onBackdropPress={() => setMenuModalVisible(false)}
        onModalHide={() => {
          if (nextAction) {
            nextAction();
            setNextAction(null);
          }
        }}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        backdropOpacity={0.4}
        style={{ margin: 0, justifyContent: 'flex-end' }}
      >
        <View style={styles.menuModalContent}>
          <Text style={styles.menuHeader}>메뉴</Text>
          <Pressable
            onPress={() => {
              setNextAction(() => () => setTeamInfoModalVisible(true));
              setMenuModalVisible(false);
            }}
            style={styles.menuItem}
          >
            <Feather name="users" size={24} color="#333" />
            <Text style={styles.menuText}>팀원 정보</Text>
          </Pressable>
          <View style={styles.menuItem}>
            <Feather name="clock" size={24} color="#333" />
            <Text style={styles.menuText}>출/퇴근 관리</Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              router.push(`/handover`);
              setMenuModalVisible(false);
            }}
          >
            <View style={styles.menuItem}>
              <FontAwesome6 name="handshake" size={24} color="black" />
              <Text style={styles.menuText}>인수인계</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              router.push(`/memo`);
              setMenuModalVisible(false);
            }}
          >
            <View style={styles.menuItem}>
              <Feather name="edit-2" size={24} color="#333" />
              <Text style={styles.menuText}>개인 메모</Text>
            </View>
          </TouchableOpacity>
          {currentUserRole === 'admin' && (
            <TouchableOpacity
              onPress={() => {
                router.push(`/team/members`);
                setMenuModalVisible(false);
              }}
              style={styles.menuItem}
            >
              <Feather name="settings" size={24} color="#333" />
              <Text style={styles.menuText}>팀 정보 및 설정</Text>
            </TouchableOpacity>
          )}
        </View>
      </Modal>

      <Modal
        isVisible={teamInfoModalVisible}
        onBackdropPress={() => setTeamInfoModalVisible(false)}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        backdropOpacity={0.4}
        style={{ margin: 0, justifyContent: 'flex-end' }}
      >
        <View style={styles.teamInfoModalContent}>
          <Text style={styles.teamInfoHeader}>팀원 정보</Text>
          {members.map((member) => (
            <View key={member.id} style={styles.teamMemberRow}>
              <View
                style={[
                  styles.colorBar,
                  { backgroundColor: scheduleColors[member.color as any]?.main || '#ccc' },
                ]}
              />
              <Text style={styles.memberName}>{member.name}</Text>
              {member.role === 'admin' && <Text style={styles.managerLabel}>관리자</Text>}
              <View style={styles.memberIcons}>
                {currentUserRole === 'admin' && (
                  <TouchableOpacity
                    onPress={() => {
                      setTeamInfoModalVisible(false);
                      router.push(`/team/members/${member.id}`);
                    }}
                  >
                    <Feather name="user" size={22} color="#222" />
                  </TouchableOpacity>
                )}
                <Feather name="repeat" size={22} color="#222" style={{ marginLeft: 18 }} />
                <TouchableOpacity
                  onPress={() => {
                    router.push(`/team/members/${member.id}/schedule`);
                  }}
                >
                  <Feather name="calendar" size={22} color="#222" style={{ marginLeft: 18 }} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  rightbottomMenuBtn: {
    position: 'absolute',
    bottom: 24,
    right: 85,
    width: '12%',
    aspectRatio: '1/1',
    borderRadius: 25,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    zIndex: 5,
  },
  menuModalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
  },
  menuHeader: {
    textAlign: 'center',
    fontSize: 16,
    color: '#888',
    marginBottom: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  menuText: {
    fontSize: 18,
    marginLeft: 16,
    color: '#222',
  },
  teamInfoModalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
    minHeight: 350,
  },
  teamInfoHeader: {
    textAlign: 'center',
    fontSize: 18,
    color: '#888',
    marginBottom: 20,
    fontWeight: 'bold',
  },
  teamMemberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    marginLeft: 4,
  },
  colorBar: {
    width: 6,
    height: 24,
    borderRadius: 20,
    marginRight: 8,
  },
  memberName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    marginRight: 8,
    paddingBottom: 3,
  },
  managerLabel: {
    color: '#3CB371',
    fontWeight: 'bold',
    fontSize: 15,
    marginRight: 10,
  },
  memberIcons: {
    flexDirection: 'row',
    marginLeft: 'auto',
    alignItems: 'center',
  },
});

