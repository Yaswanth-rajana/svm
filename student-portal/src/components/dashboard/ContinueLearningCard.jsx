import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Play, Sparkles, ArrowRight, User } from 'lucide-react';
import ProgressBar from '../common/ProgressBar';
import courseService from '../../services/course.service';

export const ContinueLearningCard = ({ enrollment }) => {
  if (!enrollment || !enrollment.course) return null;

  const course = enrollment.course;
  const progress = enrollment.progress || 0;

  const [thumbnailUrl, setThumbnailUrl] = useState(null);

  useEffect(() => {
    if (course.thumbnailKey) {
      courseService.getCourseThumbnail(course._id)
        .then(res => {
          if (res.success) {
            setThumbnailUrl(res.url);
          }
        })
        .catch(err => {
          console.error("Failed to load thumbnail URL in ContinueLearningCard:", err);
        });
    }
  }, [course.thumbnailKey, course._id]);
  
  // Extract or generate current active lesson / module label
  const currentLessonText =
    enrollment.currentLessonTitle ||
    (course.modules && course.modules[0]?.title) ||
    'Resume Active Module & Lesson';

  return (
    <Link to={`/course/${course._id}`} className="block relative overflow-hidden rounded-2xl glass-panel border border-pink-500/30 p-5 sm:p-6 shadow-2xl hover:shadow-pink-500/10 transition-all duration-300 group cursor-pointer">
      {/* Background Subtle Gradient Backdrop */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-pink-500/20 transition-all duration-700" />
      <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Badge */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10 relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-pink-500/20 border border-pink-500/40 flex items-center justify-center text-pink-400">
            <Play size={14} className="fill-pink-400 ml-0.5" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-pink-400 font-mono">
            Continue Learning
          </span>
          <span className="px-2 py-0.5 rounded-full bg-pink-500/10 text-pink-300 border border-pink-500/20 text-[10px] font-semibold">
            Featured
          </span>
        </div>
      </div>

      {/* Main Content Layout (Netflix Style) */}
      <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center relative z-10">
        {/* Course Thumbnail */}
        <div className="relative w-full sm:w-44 h-28 sm:h-28 rounded-xl overflow-hidden bg-black/60 border border-white/15 shrink-0 group-hover:border-pink-500/40 transition-colors">
          <img
            src={thumbnailUrl || course.media?.thumbnail || course.thumbnail || 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&auto=format&fit=crop&q=80'}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
          <div className="absolute bottom-2 left-2 flex items-center gap-1 text-[10px] font-semibold text-white/90 bg-black/60 px-2 py-0.5 rounded-md backdrop-blur-sm">
            <Sparkles size={10} className="text-pink-400" />
            <span>Active</span>
          </div>
        </div>

        {/* Course Details & Progress */}
        <div className="flex-1 space-y-3 w-full">
          <div>
            <h3 className="text-base sm:text-lg font-extrabold text-white group-hover:text-pink-300 transition-colors leading-snug">
              {course.title}
            </h3>
            <div className="flex items-center gap-3 text-xs text-gray-400 mt-1 flex-wrap">
              <span className="flex items-center gap-1 text-gray-300">
                <User size={12} className="text-pink-400" />
                {course.instructor || 'SMVEN Faculty'}
              </span>
              <span className="text-gray-500">•</span>
              <span className="text-pink-400 font-medium truncate max-w-xs">
                Current: {currentLessonText}
              </span>
            </div>
          </div>

          {/* Prominent Progress Bar */}
          <div className="space-y-1">
            <ProgressBar progress={progress} height="h-2.5" />
          </div>
        </div>

        {/* Resume Button */}
        <div className="w-full sm:w-auto shrink-0 pt-2 sm:pt-0 self-stretch sm:self-center flex items-center justify-end">
          <div className="w-full sm:w-auto">
            <div className="py-3 px-6 rounded-xl bg-gradient-to-r from-pink-500 via-purple-500 to-orange-500 hover:brightness-110 active:scale-95 text-white font-extrabold text-xs transition-all shadow-lg shadow-pink-500/25 flex items-center justify-center gap-2.5 cursor-pointer">
              <span>Resume Course</span>
              <ArrowRight size={15} />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ContinueLearningCard;
