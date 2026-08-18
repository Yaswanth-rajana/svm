import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import announcementService from '../services/announcement.service';
import useUIStore from '../store/useUIStore';

const DEMO_ANNOUNCEMENTS_FALLBACK = [];

export const useAnnouncements = () => {
  const queryClient = useQueryClient();

  // Persisted UI Filters via Zustand
  const selectedCategory = useUIStore((state) => state.announcementCategory);
  const setSelectedCategory = useUIStore((state) => state.setAnnouncementCategory);
  const searchQuery = useUIStore((state) => state.announcementSearchQuery);
  const setSearchQuery = useUIStore((state) => state.setAnnouncementSearchQuery);

  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: ['announcements'],
    queryFn: async () => {
      try {
        const res = await announcementService.getAnnouncements();
        if (res?.success && Array.isArray(res.announcements)) return res.announcements;
        return DEMO_ANNOUNCEMENTS_FALLBACK;
      } catch (err) {
        console.warn('TanStack Query: Announcements fetch warning, using demo dataset:', err);
        return DEMO_ANNOUNCEMENTS_FALLBACK;
      }
    },
    staleTime: 1000 * 60 * 5,
  });

  const allAnnouncements = data || DEMO_ANNOUNCEMENTS_FALLBACK;

  // Optimistic Mutation for Mark as Read
  const markAsReadMutation = useMutation({
    mutationFn: async (id) => {
      await announcementService.markAsRead(id);
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['announcements'] });
      const previous = queryClient.getQueryData(['announcements']);

      queryClient.setQueryData(['announcements'], (old) => {
        if (!Array.isArray(old)) return old;
        return old.map((item) =>
          item._id === id || item.id === id ? { ...item, read: true } : item
        );
      });

      return { previous };
    },
    onError: (err, id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['announcements'], context.previous);
      }
    },
  });

  // Optimistic Mutation for Mark All as Read
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      await announcementService.markAllAsRead();
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['announcements'] });
      const previous = queryClient.getQueryData(['announcements']);

      queryClient.setQueryData(['announcements'], (old) => {
        if (!Array.isArray(old)) return old;
        return old.map((item) => ({ ...item, read: true }));
      });

      return { previous };
    },
    onError: (err, variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['announcements'], context.previous);
      }
    },
  });

  const filteredAnnouncements = useMemo(() => {
    return allAnnouncements
      .filter((item) => {
        if (selectedCategory === 'Unread') return !item.read;
        if (selectedCategory === 'Course')
          return item.targetType === 'COURSE' || item.announcementType === 'course' || item.category === 'Course Update';
        if (selectedCategory === 'General')
          return (item.targetType === 'GLOBAL' || item.announcementType === 'global') && item.category !== 'Course Update';
        if (selectedCategory === 'Live') return item.category === 'Live Session';
        if (selectedCategory !== 'All') return item.category === selectedCategory;
        return true;
      })
      .filter((item) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        const courseTitle = typeof item.courseId === 'object' ? item.courseId?.title : '';
        const moduleTitle = typeof item.moduleId === 'object' ? item.moduleId?.title : '';
        const lessonTitle = typeof item.lessonId === 'object' ? item.lessonId?.title : '';

        return (
          item.title?.toLowerCase().includes(q) ||
          item.message?.toLowerCase().includes(q) ||
          (courseTitle && courseTitle.toLowerCase().includes(q)) ||
          (moduleTitle && moduleTitle.toLowerCase().includes(q)) ||
          (lessonTitle && lessonTitle.toLowerCase().includes(q))
        );
      })
      .sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return new Date(b.publishedAt || b.createdAt || 0) - new Date(a.publishedAt || a.createdAt || 0);
      });
  }, [allAnnouncements, selectedCategory, searchQuery]);

  const unreadCount = useMemo(() => {
    return allAnnouncements.filter((item) => !item.read).length;
  }, [allAnnouncements]);

  return {
    announcements: filteredAnnouncements,
    allAnnouncements,
    loading: isLoading,
    isFetching,
    error: error?.message || null,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    unreadCount,
    markAsRead: (id) => markAsReadMutation.mutate(id),
    markAllAsRead: () => markAllAsReadMutation.mutate(),
    refetch,
  };
};

export default useAnnouncements;
