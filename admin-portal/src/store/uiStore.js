import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useUIStore = create(
  persist(
    (set) => ({
      theme: 'dark', // Default to dark as per SMVEN branding
      sidebarCollapsed: false,
      sidebarMobileOpen: false,
      notificationsOpen: false,
      
      setTheme: (theme) => set({ theme }),
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setSidebarMobileOpen: (isOpen) => set({ sidebarMobileOpen: isOpen }),
      setNotificationsOpen: (isOpen) => set({ notificationsOpen: isOpen }),
    }),
    {
      name: 'smven-admin-ui',
    }
  )
);
