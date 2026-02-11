import { create } from 'zustand';
import { useUserStore } from '@/scripts/store/userStore';

export const useMemoStore = create((set, get) => ({
    // 상태
    memo: null,
    setMemo: (data) => set({ memo: data }),

    findNoteById: (noteId) => {
        const { memo } = get();

        const userState = useUserStore.getState();
        const selectedSpaceIndex = userState.selected_space;
        const user = userState.user;
        const selectedSpaceId = user?.spaces[selectedSpaceIndex]?.id;

        if (!selectedSpaceId) return null;

        const currentSpace = memo.spaces.find(space => space.spaceId === selectedSpaceId);
        if (!currentSpace) return null;

        // tabId 로 먼저 찾기
        const note = currentSpace.notes.find(n => n.id === noteId);
        return note ?? null;
    }
}));