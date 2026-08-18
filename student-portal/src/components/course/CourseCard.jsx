import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowRight } from 'lucide-react';
import ProgressBar from '../common/ProgressBar';
import Badge from '../common/Badge';
import courseService from '../../services/course.service';

export const CourseCard = memo(({ enrollment }) => {
  const queryClient = useQueryClient();
  const course = enrollment?.course;
  if (!course) return null;

  const [thumbnailUrl, setThumbnailUrl] = React.useState(null);

  React.useEffect(() => {
    if (course.thumbnailKey) {
      courseService.getCourseThumbnail(course._id)
        .then(res => {
          if (res.success) {
            setThumbnailUrl(res.url);
          }
        })
        .catch(err => {
          console.error("Failed to load thumbnail URL:", err);
        });
    }
  }, [course.thumbnailKey, course._id]);

  const progress = enrollment.progress || 0;
  const isCompleted = progress === 100;
  const hasStarted = progress > 0;

  // Dynamic CTA label
  let ctaLabel = 'Start Course';
  if (isCompleted) {
    ctaLabel = 'Review Course';
  } else if (hasStarted) {
    ctaLabel = 'Continue Learning';
  }

  const accessExpiry = enrollment.accessEnd 
    ? `Expires: ${new Date(enrollment.accessEnd).toLocaleDateString()}` 
    : 'Lifetime Access';

  // Multi-device Prefetch Trigger: hover, focus, or touch
  const handlePrefetch = () => {
    if (!course._id) return;
    queryClient.prefetchQuery({
      queryKey: ['course', course._id],
      queryFn: async () => {
        const res = await courseService.getCourseDetail(course._id);
        return res;
      },
      staleTime: 1000 * 60 * 5,
    });
  };

  return (
    <Link
      to={`/course/${course._id}`}
      onMouseEnter={handlePrefetch}
      onFocus={handlePrefetch}
      onTouchStart={handlePrefetch}
      className="group block rounded-3xl glass-panel glass-panel-hover border border-white/10 flex flex-col justify-between overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-pink-500/10 hover:-translate-y-1.5 h-full cursor-pointer"
    >
      {/* Banner with Lazy Loading & WebP Optimization */}
      <div className="relative aspect-video w-full overflow-hidden bg-black/50 shrink-0">
        <img
          src={thumbnailUrl || course.media?.thumbnail || course.thumbnail || 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&auto=format&fit=crop&q=80'}
          alt={course.title}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b0f14] via-transparent to-black/30 opacity-80" />

        {/* Single Access Badge */}
        <div className="absolute top-3 right-3 z-10">
          <Badge variant="emerald" className="text-[10px] py-1 px-2.5 font-bold tracking-wide shadow-lg shadow-emerald-500/20 backdrop-blur-md bg-emerald-500/20">
            {accessExpiry}
          </Badge>
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between space-y-5">
        <div className="space-y-2.5">
          <h3 className="text-base font-extrabold text-white group-hover:text-pink-400 transition-colors line-clamp-2 leading-tight">
            {course.title}
          </h3>
          <p className="text-xs text-gray-400 line-clamp-3 leading-relaxed">
            {course.shortDescription || course.description?.replace(/<[^>]*>/g, '') || ''}
          </p>
        </div>

        <div className="space-y-4 pt-1">
          {/* Progress Section */}
          <div className="pt-2">
            <ProgressBar progress={progress} height="h-2" />
          </div>

          {/* Primary Button */}
          <div className="block">
            <div className={`w-full py-3 px-4 rounded-xl text-xs font-extrabold transition-all duration-300 flex items-center justify-center gap-2 ${
              isCompleted
                ? 'bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20'
                : hasStarted
                ? 'bg-gradient-to-r from-pink-500 via-purple-500 to-orange-500 text-white shadow-xl shadow-pink-500/25 hover:shadow-pink-500/40 hover:brightness-110 active:scale-95'
                : 'bg-white/5 hover:bg-pink-500/20 border border-white/10 hover:border-pink-500/30 text-white hover:text-pink-300'
            }`}>
              <span>{ctaLabel}</span>
              <ArrowRight size={14} className="group-hover:translate-x-1.5 transition-transform duration-300" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
});

export default CourseCard;
