import { create } from 'zustand';

export type CalendarType = '월' | '주' | '편집';

export type CalTypeState = {
  type: CalendarType;
  setCalType: (type: CalendarType) => void;
};

export const useCalTypeStore = create<CalTypeState>((set) => ({
  type: '월',
  setCalType: (type) => set({ type }),
}));

export type EditDate = Date | string | null;

export type EditDateState = {
  date: EditDate;
  setEditDate: (date: EditDate) => void;
};

export const useEditDateStore = create<EditDateState>((set) => ({
  date: null,
  setEditDate: (date) => set({ date }),
}));

