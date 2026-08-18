import { create } from 'zustand';

export const useUIStore = create((set, get) => ({
  // Mobile Sidebar Menu
  mobileMenuOpen: false,
  setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),
  toggleMobileMenu: () => set((state) => ({ mobileMenuOpen: !state.mobileMenuOpen })),

  // Filter States
  courseSearchQuery: '',
  setCourseSearchQuery: (query) => set({ courseSearchQuery: query }),
  courseStatusFilter: 'all',
  setCourseStatusFilter: (filter) => set({ courseStatusFilter: filter }),
  courseSortBy: 'newest',
  setCourseSortBy: (sortBy) => set({ courseSortBy: sortBy }),

  // Announcement Filters
  announcementSearchQuery: '',
  setAnnouncementSearchQuery: (query) => set({ announcementSearchQuery: query }),
  announcementCategory: 'All',
  setAnnouncementCategory: (category) => set({ announcementCategory: category }),

  // Scroll Position Cache for Instant Back Navigation
  scrollPositions: {},
  saveScrollPosition: (path, pos) =>
    set((state) => ({
      scrollPositions: { ...state.scrollPositions, [path]: pos },
    })),
  getScrollPosition: (path) => get().scrollPositions[path] || 0,
}));

export default useUIStore;
