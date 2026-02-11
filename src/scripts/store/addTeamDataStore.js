// scripts/store/addTeamDataStore.js
import { create } from 'zustand';

export const useAddTeamDataStore = create((set) => ({
  teamData: {
    id: '',                  // teamSpaceId
    type: 'team',
    name: '',                // teamName
    imageUrl: null,
    lastUpdatedAt: '',       // ISO string
    location: null,          // { lat, lng }
    members: [],             // [{...}]
    schedules: [],           // 초기엔 비어 있음
  },

  // 병합 업데이트
  setTeamData: (data) =>
    set((state) => ({
      teamData: {
        ...state.teamData,
        ...data,
      },
    })),

  // 완전 덮어쓰기 (옵션)
  overwriteTeamData: (data) =>
    set(() => ({
      teamData: { ...data },
    })),

  // 초기화
  resetTeamData: () =>
    set(() => ({
      teamData: {
        id: '',
        type: 'team',
        name: '',
        imageUrl: null,
        lastUpdatedAt: '',
        location: null,
        members: [],
        schedules: [],
      },
    })),
}));
