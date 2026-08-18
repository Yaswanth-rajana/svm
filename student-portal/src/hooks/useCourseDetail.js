import { useQuery } from '@tanstack/react-query';
import courseService from '../services/course.service';

const getFallbackCourse = (courseId) => ({
  success: true,
  progress: 35,
  course: {
    _id: courseId || 'c-demo-1',
    title: 'IT Infrastructure Mastery',
    slug: 'it-infrastructure-mastery',
    description: 'Master enterprise IT infrastructure, hardware, data centers, and systems architecture.',
    thumbnail: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&auto=format&fit=crop&q=80',
    banner: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&auto=format&fit=crop&q=80',
    difficulty: 'intermediate',
    estimatedHours: 40,
    status: 'published',
    instructor: 'Saurabh Singh',
  },
  modules: [
    {
      _id: 'mod-demo-1',
      title: 'Module 1: Fundamentals of Enterprise Hardware',
      description: 'Introduction to rack servers, blade chassis, and power redundancy.',
      order: 1,
      lessons: [
        {
          _id: 'les-demo-1',
          title: 'Lesson 1.1: Server Architecture & Form Factors',
          description: 'Detailed overview of 1U, 2U, 4U rack servers and server components.',
          duration: 1800,
          order: 1,
          videoUrl: 'https://www.youtube.com/embed/27ogV-fg_gk',
          progress: { completed: true, lastPosition: 1800 },
        },
        {
          _id: 'les-demo-2',
          title: 'Lesson 1.2: RAID Controllers & Storage Redundancy',
          description: 'Understanding RAID 0, 1, 5, 6, 10 and hot-swappable drives.',
          duration: 2100,
          order: 2,
          videoUrl: 'https://www.youtube.com/embed/27ogV-fg_gk',
          progress: { completed: false, lastPosition: 420 },
        },
      ],
    },
    {
      _id: 'mod-demo-2',
      title: 'Module 2: Data Center Operations & Power Management',
      description: 'HVAC cooling, UPS systems, PDU distribution, and tier standards.',
      order: 2,
      lessons: [
        {
          _id: 'les-demo-3',
          title: 'Lesson 2.1: Data Center Tiers (Tier I to IV)',
          description: 'Uptime Institute standards for redundant power and cooling.',
          duration: 2400,
          order: 1,
          videoUrl: 'https://www.youtube.com/embed/27ogV-fg_gk',
          progress: { completed: false, lastPosition: 0 },
        },
      ],
    },
  ],
});

export const useCourseDetail = (courseId) => {
  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: ['course', courseId],
    queryFn: async () => {
      if (!courseId) return getFallbackCourse(courseId);
      try {
        const res = await courseService.getCourseDetail(courseId);
        if (res?.success) return res;
        return getFallbackCourse(courseId);
      } catch (err) {
        console.warn('TanStack Query: Course detail fetch warning, using demo dataset:', err);
        return getFallbackCourse(courseId);
      }
    },
    enabled: Boolean(courseId),
  });

  const fallback = getFallbackCourse(courseId);

  return {
    course: data?.course || fallback.course,
    modules: data?.modules || fallback.modules,
    progress: data?.progress ?? fallback.progress,
    loading: isLoading,
    isFetching,
    error: error?.message || null,
    refetch,
  };
};

export default useCourseDetail;
