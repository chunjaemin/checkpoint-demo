import { create } from 'zustand'

export const useUserStore = create((set) => ({
  user: null,
  selected_space: 0,
  setUser: (userData) => set({ user: userData }),
  setSelectedSpace: (num) => set({ selected_space: num }),

  removeSpace: (spaceIndex) => set((state) => {
    const updatedSpaces = [...state.user.spaces];
    updatedSpaces.splice(spaceIndex, 1); // 인덱스 기반 삭제
    return {
      user: {
        ...state.user,
        spaces: updatedSpaces,
      },
      selected_space: Math.max(0, spaceIndex - 1), // 선택 공간 변경
    };
  }),
}))