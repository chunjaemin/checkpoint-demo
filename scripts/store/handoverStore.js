import { create } from 'zustand';
import { useUserStore } from '@/scripts/store/userStore';

export const useHandOverStore = create((set, get) => ({
  handovers: null,
  setHandovers: (data) => set({ handovers: data }),

  findNoteById: (tabId, noteId) => {
    const { handovers } = get();

    const userState = useUserStore.getState();
    const selectedSpaceIndex = userState.selected_space;
    const user = userState.user;
    const selectedSpaceId = user?.spaces[selectedSpaceIndex]?.id;

    if (!handovers || !selectedSpaceId) return null;

    const currentSpace = handovers.spaces.find(space => space.id === selectedSpaceId);
    if (!currentSpace) return null;

    // tabId 로 먼저 찾기
    const tab = currentSpace.handover.tabs.find(t => t.id === tabId);
    if (!tab) return null;

    // 그 tab 안에서 noteId 찾기
    const note = tab.notes.find(n => n.id === noteId);
    return note ?? null;
  }
}));