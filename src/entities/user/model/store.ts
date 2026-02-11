import { create } from 'zustand';
import type { User } from './types';

export type UserStoreState = {
  user: User | null;
  selected_space: number;
  setUser: (userData: User) => void;
  setSelectedSpace: (num: number) => void;
  removeSpace: (spaceIndex: number) => void;
};

export const useUserStore = create<UserStoreState>((set) => ({
  user: null,
  selected_space: 0,
  setUser: (userData) => set({ user: userData }),
  setSelectedSpace: (num) => set({ selected_space: num }),

  removeSpace: (spaceIndex) =>
    set((state) => {
      if (!state.user) return state;
      const updatedSpaces = [...state.user.spaces];
      updatedSpaces.splice(spaceIndex, 1);
      return {
        user: {
          ...state.user,
          spaces: updatedSpaces,
        },
        selected_space: Math.max(0, spaceIndex - 1),
      };
    }),
}));

