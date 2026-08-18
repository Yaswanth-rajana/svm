import React, { useMemo } from 'react';
import { Search, SlidersHorizontal, BookOpen } from 'lucide-react';
import useCourses from '../../hooks/useCourses';
import useStudent from '../../hooks/useStudent';
import CourseCard from '../../components/course/CourseCard';
import EmptyState from '../../components/common/EmptyState';
import ErrorMessage from '../../components/common/ErrorMessage';
import { SkeletonCard } from '../../components/common/SkeletonLoader';
import ContinueLearningCard from '../../components/dashboard/ContinueLearningCard';


export const Home = () => {
  const {
    courses,
    totalCount,
    loading: coursesLoading,
    error: coursesError,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    sortBy,
    setSortBy,
    refetch,
  } = useCourses();

  const { student, enrollments, announcements, loading: studentLoading } = useStudent();

  const loading = coursesLoading || studentLoading;
  const error = coursesError;

  // Find last accessed course for Continue Learning widget
  const lastActiveEnrollment = useMemo(() => {
    if (!enrollments || enrollments.length === 0) return null;
    return (
      [...enrollments].sort(
        (a, b) => new Date(b.lastAccessed || b.updatedAt || 0) - new Date(a.lastAccessed || a.updatedAt || 0)
      )[0] || enrollments[0]
    );
  }, [enrollments]);

  const hasProgress = Boolean(lastActiveEnrollment && (lastActiveEnrollment.lastAccessed || lastActiveEnrollment.progress > 0));

  // Determine first name for greeting
  const firstName = student?.name ? student.name.split(' ')[0] : 'Student';

  return (
    <>
      <div className="space-y-6 animate-fade-in">
        {/* Section 1: Greeting Section */}
        <div className="pt-2 text-center">
          <h1 className="text-xl sm:text-2xl font-extrabold text-white leading-tight">
            Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}, {firstName} 👋
          </h1>
          <p className="text-sm text-gray-400 mt-1.5 font-medium">
            Continue your learning journey.
          </p>
        </div>

        {/* Section 2: Continue Learning */}
        {hasProgress && !loading && (
          <div className="w-full">
            <ContinueLearningCard enrollment={lastActiveEnrollment} />
          </div>
        )}



        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        )}

        {/* Error State */}
        {error && (
          <ErrorMessage
            title="Failed to load courses"
            message={error}
            onRetry={refetch}
          />
        )}

        {/* Section 4 & 6: Course Grid and Empty State */}
        {!loading && !error && (
          <>
            {totalCount === 0 && enrollments.length === 0 ? (
              <EmptyState
                icon={BookOpen}
                title="No courses available."
                description="Your enrolled courses will appear here."
              />
            ) : courses.length === 0 ? (
              <EmptyState
                icon={BookOpen}
                title={searchQuery || statusFilter !== 'all' ? 'No matching courses' : 'No courses enrolled'}
                description={
                  searchQuery || statusFilter !== 'all'
                    ? 'No enrolled courses match your current search or filter criteria. Try clearing filters.'
                    : 'Your enrolled courses will appear here.'
                }
                action={
                  (searchQuery || statusFilter !== 'all') && (
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setStatusFilter('all');
                      }}
                      className="px-4 py-2 rounded-xl bg-pink-500/20 border border-pink-500/30 text-pink-400 text-xs font-semibold hover:bg-pink-500/30 transition-colors"
                    >
                      Clear Filters
                    </button>
                  )
                }
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {courses.map((item) => (
                  <CourseCard key={item.enrollmentId || item.id || item.course?._id} enrollment={item} />
                ))}
              </div>
            )}
          </>
        )}


      </div>
    </>
  );
};

export default Home;
