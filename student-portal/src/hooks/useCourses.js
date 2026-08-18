import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import courseService from '../services/course.service';
import useUIStore from '../store/useUIStore';

const DEMO_COURSES_FALLBACK = [
  {
    id: 'enr-demo-1',
    progress: 35,
    status: 'active',
    daysRemaining: 18,
    isExpiringSoon: true,
    course: {
      _id: 'c-demo-1',
      title: 'IT Infrastructure Mastery',
      slug: 'it-infrastructure-mastery',
      description: 'Master enterprise IT infrastructure, hardware, data centers, and systems architecture.',
      thumbnail: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&auto=format&fit=crop&q=80',
      difficulty: 'intermediate',
      estimatedHours: 40,
    },
  },
  {
    id: 'enr-demo-2',
    progress: 60,
    status: 'active',
    daysRemaining: 120,
    isExpiringSoon: false,
    course: {
      _id: 'c-demo-2',
      title: 'Networking Fundamentals & Architecture',
      slug: 'networking-fundamentals',
      description: 'Comprehensive guide to TCP/IP, OSI model, VLANs, routing, and network firewalls.',
      thumbnail: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600&auto=format&fit=crop&q=80',
      difficulty: 'beginner',
      estimatedHours: 35,
    },
  },
  {
    id: 'enr-demo-3',
    progress: 15,
    status: 'active',
    daysRemaining: 90,
    isExpiringSoon: false,
    course: {
      _id: 'c-demo-3',
      title: 'Windows Server Administration',
      slug: 'windows-server-administration',
      description: 'Active Directory, Group Policy, DNS, DHCP, and Windows Server 2022 deployment.',
      thumbnail: 'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=600&auto=format&fit=crop&q=80',
      difficulty: 'intermediate',
      estimatedHours: 45,
    },
  },
];

export const useCourses = () => {
  // Persisted UI Filter State via Zustand
  const searchQuery = useUIStore((state) => state.courseSearchQuery);
  const setSearchQuery = useUIStore((state) => state.setCourseSearchQuery);
  const statusFilter = useUIStore((state) => state.courseStatusFilter);
  const setStatusFilter = useUIStore((state) => state.setCourseStatusFilter);
  const sortBy = useUIStore((state) => state.courseSortBy);
  const setSortBy = useUIStore((state) => state.setCourseSortBy);

  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      try {
        const res = await courseService.getMyCourses();
        if (res?.success) return res.courses || [];
        return DEMO_COURSES_FALLBACK;
      } catch (err) {
        console.warn('TanStack Query: Courses fetch warning, using demo dataset:', err);
        return DEMO_COURSES_FALLBACK;
      }
    },
  });

  const rawCourses = data || DEMO_COURSES_FALLBACK;

  const filteredCourses = useMemo(() => {
    return rawCourses
      .filter((item) => {
        const course = item.course;
        if (!course) return false;

        const matchesSearch =
          course.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          course.description?.toLowerCase().includes(searchQuery.toLowerCase());

        if (!matchesSearch) return false;

        if (statusFilter === 'in-progress') {
          return item.progress >= 0 && item.progress < 100;
        } else if (statusFilter === 'completed') {
          return item.progress === 100;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'progress') {
          return b.progress - a.progress;
        }
        if (sortBy === 'oldest') {
          return new Date(a.course?.createdAt || 0) - new Date(b.course?.createdAt || 0);
        }
        return new Date(b.course?.createdAt || 0) - new Date(a.course?.createdAt || 0);
      });
  }, [rawCourses, searchQuery, statusFilter, sortBy]);

  return {
    courses: filteredCourses,
    rawCourses,
    totalCount: rawCourses.length,
    loading: isLoading,
    isFetching,
    error: error?.message || null,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    sortBy,
    setSortBy,
    refetch,
  };
};

export default useCourses;
