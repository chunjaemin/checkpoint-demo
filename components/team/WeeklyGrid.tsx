// WeeklyGrid.tsx (주별 셀 상태 외부 관리)
import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import {
  GestureDetector,
  Gesture,
} from 'react-native-gesture-handler';
import Animated, { runOnJS, useSharedValue } from 'react-native-reanimated';

interface WeeklyGridProps {
  hours: number[];
  CELL_WIDTH: number;
  selectedCells: Record<number, number[]>;
  onCellToggle: (col: number, row: number) => void;
}

const ROW_HEIGHT = 30;
const NUM_COLS = 7;

const WeeklyGrid: React.FC<WeeklyGridProps> = ({
  hours,
  CELL_WIDTH,
  selectedCells,
  onCellToggle,
}) => {
  const lastColRow = useSharedValue<{ col: number; row: number } | null>(null);

  const panGesture = Gesture.Pan()
    .minPointers(1)
    .maxPointers(1)
    .onStart(e => {
      'worklet';
      const col = Math.floor(e.x / CELL_WIDTH);
      const row = Math.floor(e.y / ROW_HEIGHT);
      if (col < 0 || col >= NUM_COLS || row < 0 || row >= hours.length) return;
      lastColRow.value = { col, row };
      runOnJS(onCellToggle)(col, row);
    })
    .onUpdate(e => {
      'worklet';
      const col = Math.floor(e.x / CELL_WIDTH);
      const row = Math.floor(e.y / ROW_HEIGHT);
      if (col < 0 || col >= NUM_COLS || row < 0 || row >= hours.length) return;
      const last = lastColRow.value;
      if (last && last.col === col && last.row === row) return;
      lastColRow.value = { col, row };
      runOnJS(onCellToggle)(col, row);
    })
    .onEnd(() => {
      'worklet';
      lastColRow.value = null;
    });

  return (
    <GestureDetector gesture={panGesture}>
      <View style={styles.rowWrapper}>
        {Array.from({ length: NUM_COLS }, (_, colIdx) => (
          <View key={colIdx} style={styles.column}>
            {hours.map((_, rowIdx) => (
              <View
                key={rowIdx}
                style={[
                  styles.cell,
                  {
                    width: CELL_WIDTH,
                    height: ROW_HEIGHT,
                    borderRightWidth: colIdx === NUM_COLS - 1 ? 0 : 0.2,
                    backgroundColor:
                      selectedCells[colIdx]?.includes(rowIdx) ? '#99ccff' : 'transparent',
                  },
                ]}
              />
            ))}
          </View>
        ))}
      </View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  rowWrapper: {
    flexDirection: 'row',
  },
  column: {
    flexDirection: 'column',
  },
  cell: {
    borderTopWidth: 0.2,
    borderLeftWidth: 0.2,
    borderBottomWidth: 0.2,
    borderColor: '#ccc',
  },
});

export default React.memo(WeeklyGrid);
