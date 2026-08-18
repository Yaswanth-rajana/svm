import { useQuery } from '@tanstack/react-query';
import courseService from '../services/course.service';

const getFallbackLesson = (lessonId) => ({
  _id: lessonId || 'les-demo-1',
  title: 'Lesson 1.1: Server Architecture & Form Factors',
  description: 'Detailed overview of 1U, 2U, 4U rack servers and server components.',
  duration: 1800,
  order: 1,
  videoUrl: 'https://www.youtube.com/embed/27ogV-fg_gk',
  progress: { completed: true, lastPosition: 350 },
  notes: {
    title: 'Server_Architecture_CheatSheet.pdf',
    fileKey: 'notes/infra_mod1_les1.pdf',
    size: 2450000,
  },
});

export const useLessonDetail = (lessonId) => {
  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: ['lesson', lessonId],
    queryFn: async () => {
      if (!lessonId) return getFallbackLesson(lessonId);
      try {
        const res = await courseService.getLessonDetail(lessonId);
        if (res?.success) return res.lesson;
        return getFallbackLesson(lessonId);
      } catch (err) {
        console.warn('TanStack Query: Lesson detail fetch warning, using demo dataset:', err);
        return getFallbackLesson(lessonId);
      }
    },
    enabled: Boolean(lessonId),
  });

  const fallback = getFallbackLesson(lessonId);

  return {
    lesson: data || fallback,
    loading: isLoading,
    isFetching,
    error: error?.message || null,
    refetch,
  };
};

export default useLessonDetail;
