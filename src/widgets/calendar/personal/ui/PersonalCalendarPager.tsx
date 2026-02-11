import Topbar from '@/components/common/Topbar';
import Month from './month';
import Week from './week';
import WeekEdit from './weekEdit';
import { CalendarTypeToggleFab } from '@/features/calendar/toggle-calendar-type';
import { useCalTypeStore } from '@/features/calendar/personal';
import React, { useContext } from 'react';
import { View } from 'react-native';

import { BottomTabBarHeightContext } from '@react-navigation/bottom-tabs';
import { Platform } from 'react-native';

export default function PersonalCalendarPager() {
  const calendarTypeBtn = useCalTypeStore((state) => state.type);
  const setCalType = useCalTypeStore((state) => state.setCalType);
  const bottomBarHeight = useContext(BottomTabBarHeightContext);

  return (
    <View
      style={[
        { flex: 1 },
        Platform.OS === 'ios' ? { marginBottom: bottomBarHeight } : null,
      ]}
    >
      {calendarTypeBtn !== '편집' && <Topbar />}

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
    </View>
  );
}
