import { useParams } from 'react-router-dom';
import { Video, Clock, Layers } from 'lucide-react';
import useModuleDetail from '../../hooks/useModuleDetail';
import PageHeader from '../../components/common/PageHeader';
import LessonCard from '../../components/course/LessonCard';
import SkeletonPage from '../../components/common/SkeletonLoader';
import ErrorMessage from '../../components/common/ErrorMessage';
import EmptyState from '../../components/common/EmptyState';
import { formatDuration } from '../../utils/formatDuration';

export const ModuleDetails = () => {
  const { moduleId } = useParams();
  const { module, lessons, loading, error, refetch } = useModuleDetail(moduleId);

  const totalDuration = lessons.reduce((sum, l) => sum + (l.duration || 0), 0);

  if (loading) {
    return <SkeletonPage />;
  }

  if (error || !module) {
    return (
      <ErrorMessage
        title="Module Not Found"
        message={error || "The requested module could not be found."}
        onRetry={refetch}
      />
    );
  }

  return (
    <>
      <div className="space-y-6 animate-fade-in">
        {/* Page Header */}
        <PageHeader
          title={module.title}
          subtitle={module.description || 'Complete all published lessons in this module.'}
          breadcrumbs={[
            { label: 'My Courses', path: '/my-courses' },
            { label: 'Course', path: module.courseId ? `/course/${module.courseId}` : '/my-courses' },
            { label: module.title },
          ]}
        />

        {/* Module Summary Bar */}
        <div className="p-5 rounded-2xl glass-panel border border-white/10 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 font-mono font-bold">
              <Layers size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Module Overview</h3>
              <p className="text-xs text-gray-400">{module.description || 'Module Content'}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono text-gray-300">
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
              <Video size={14} className="text-pink-400" />
              {lessons.length} Lessons
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
              <Clock size={14} className="text-purple-400" />
              {formatDuration(totalDuration)}
            </span>
          </div>
        </div>

        {/* Lessons List */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Video size={18} className="text-pink-400" />
            <h3 className="text-base font-bold text-white">Module Lessons</h3>
          </div>

          {lessons.length === 0 ? (
            <EmptyState
              icon={Video}
              title="No Lessons Found"
              description="Lessons for this module are coming soon."
            />
          ) : (
            <div className="space-y-3">
              {lessons.map((lesson, index) => (
                <LessonCard key={lesson._id} lesson={lesson} index={index} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ModuleDetails;
