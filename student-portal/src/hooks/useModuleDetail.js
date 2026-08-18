import { useState, useEffect, useCallback } from 'react';
import courseService from '../services/course.service';

export const useModuleDetail = (moduleId) => {
  const [module, setModule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchModule = useCallback(async () => {
    if (!moduleId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await courseService.getModuleDetail(moduleId);
      if (res.success) {
        setModule(res.module);
      } else {
        throw new Error(res.message || 'Module not found');
      }
    } catch (err) {
      console.error('Error fetching module detail:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load module');
    } finally {
      setLoading(false);
    }
  }, [moduleId]);

  useEffect(() => {
    fetchModule();
  }, [fetchModule]);

  return {
    module,
    lessons: module?.lessons || [],
    loading,
    error,
    refetch: fetchModule,
  };
};

export default useModuleDetail;
