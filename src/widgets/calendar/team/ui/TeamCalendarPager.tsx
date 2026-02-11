import Topbar from '@/components/common/Topbar';
import Month from './month';
import Week from './Week';
import WeekEdit from './weekEdit';
import { CalendarTypeToggleFab } from '@/features/calendar/toggle-calendar-type';
import { TeamCalendarMenu } from '@/features/team/calendar-menu';
import { useCalTypeStore } from '@/features/calendar/team';
import React, { useContext } from 'react';
import { View } from 'react-native';

import { getCurrentUserRole, getMembers, getSelectedSpace, useUserStore } from '@/entities/user';
import { BottomTabBarHeightContext } from '@react-navigation/bottom-tabs';
import { Platform } from 'react-native';

export default function TeamCalendarPager() {
  const calendarTypeBtn = useCalTypeStore((state) => state.type);
  const setCalType = useCalTypeStore((state) => state.setCalType);

  const bottomBarHeight = useContext(BottomTabBarHeightContext);

  const user = useUserStore((state) => state.user);
  const selectedSpaceIndex = useUserStore((state) => state.selected_space);

  const selectedSpace = getSelectedSpace(user, selectedSpaceIndex);
  const currentUserRole = getCurrentUserRole(selectedSpace, user?.id);
  const members = getMembers(selectedSpace);

  return (
    <View
      style={[
        { flex: 1 },
        Platform.OS === 'ios' ? { marginBottom: bottomBarHeight } : null,
      ]}
    >
      <Topbar />

      {calendarTypeBtn === '월' ? (
        <Month />
      ) : calendarTypeBtn === '주' ? (
        <Week />
      ) : (
        <WeekEdit />
      )}

      <CalendarTypeToggleFab
        value={calendarTypeBtn}
        hidden={calendarTypeBtn === '편집'}
        onPress={() => (calendarTypeBtn === '월' ? setCalType('주') : setCalType('월'))}
      />
      <TeamCalendarMenu
        hidden={calendarTypeBtn === '편집'}
        members={members}
        currentUserRole={currentUserRole}
      />
    </View>
  );
}
