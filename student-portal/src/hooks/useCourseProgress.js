import { useQuery } from '@tanstack/react-query';
import courseService from '../services/course.service';

export const useCourseProgress = (courseId) => {
  return useQuery({
    queryKey: ['course-progress', courseId],
    queryFn: async () => {
      if (!courseId) return null;
      try {
        const res = await courseService.getCourseProgress(courseId);
        if (res?.success && res.data) {
          return res.data;
        }
        return null;
      } catch (err) {
        console.warn('TanStack Query: course progress fetch warning:', err);
        return null;
      }
    },
    enabled: Boolean(courseId),
  });
};

export default useCourseProgress;
