import React from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import Modal from 'react-native-modal'; // ✅ 여기
import { scheduleColors } from '../../scripts/color/scheduleColor';

const ColorPickerModal = ({ visible, onClose, onSelect }) => {
  const colorList = Object.entries(scheduleColors).map(([key, val]) => ({
    name: key,
    color: val.main,
  }));

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={onClose}
      onBackButtonPress={onClose}
      style={styles.modalContainer}
      animationIn="slideInUp"      // ✅ 아래에서 올라오기
      animationOut="slideOutDown"  // ✅ 아래로 사라지기
    >
      <View style={styles.modalContent}>
        <Text style={styles.title}>색상 지정</Text>

        <FlatList
          data={colorList}
          keyExtractor={(item) => item.name}
          numColumns={5}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.circle, { backgroundColor: item.color }]}
              onPress={() => {
                onSelect(item.name);
                onClose();
              }}
            />
          )}
          contentContainerStyle={styles.grid}
        />

        <TouchableOpacity onPress={onClose}>
          <Text style={styles.close}>닫기</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

export default ColorPickerModal;

const styles = StyleSheet.create({
  modalContainer: {
    justifyContent: 'flex-end', // ✅ 아래에서 뜨도록
    margin: 0, // 전체 화면을 덮도록
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  grid: {
    alignItems: 'center',
  },
  circle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    margin: 8,
  },
  close: {
    marginTop: 16,
    color: '#888',
  },
});
