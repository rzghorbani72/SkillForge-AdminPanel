import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SidebarStore {
  isMinimized: boolean;
  toggle: () => void;
}

export const useSidebar = create<SidebarStore>()(
  persist(
    (set) => ({
      isMinimized: false,
      toggle: () => set((state) => ({ isMinimized: !state.isMinimized })),
    }),
    // Rehydrated after mount by the sidebar, so SSR markup always matches.
    { name: 'sidebar-minimized', skipHydration: true },
  ),
);
