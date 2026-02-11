import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

type Props = {
  value: string;
  onPress: () => void;
  hidden?: boolean;
};

export function CalendarTypeToggleFab({ value, onPress, hidden }: Props) {
  if (hidden) return null;

  return (
    <Pressable
      style={({ pressed }) => [styles.calendarTypeBtn, pressed && { opacity: 0.7 }]}
      onPress={onPress}
    >
      <Text style={styles.calendarTypeText}>{value}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  calendarTypeBtn: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: '12%',
    aspectRatio: '1/1',
    borderRadius: 25,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    zIndex: 5,
  },
  calendarTypeText: {
    fontSize: 15,
    color: 'white',
  },
});

