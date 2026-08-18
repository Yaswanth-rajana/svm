import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Clock, FileText, CheckCircle2, ArrowRight } from 'lucide-react';
import Badge from '../common/Badge';
import { formatDuration } from '../../utils/formatDuration';
import courseService from '../../services/course.service';

export const LessonCard = memo(({ lesson, index = 0 }) => {
  const queryClient = useQueryClient();
  if (!lesson) return null;

  const isCompleted = lesson.progress?.completed;
  const hasNotes = Boolean(lesson.notes && (lesson.notes.title || lesson.notes.fileKey));

  const handlePrefetch = () => {
    if (!lesson._id) return;
    queryClient.prefetchQuery({
      queryKey: ['lesson', lesson._id],
      queryFn: async () => {
        const res = await courseService.getLessonDetail(lesson._id);
        return res.lesson;
      },
      staleTime: 1000 * 60 * 5,
    });
  };

  return (
    <div
      onMouseEnter={handlePrefetch}
      onFocus={handlePrefetch}
      onTouchStart={handlePrefetch}
      className="py-3 px-4 rounded-xl glass-panel glass-panel-hover border border-white/10 flex items-center justify-between gap-4 transition-all duration-200 hover:border-pink-500/30 group"
    >
      <div className="flex items-center gap-3.5 min-w-0 flex-1">
        <div className={`w-8 h-8 rounded-lg border flex items-center justify-center font-mono font-bold text-xs shrink-0 transition-colors ${
          isCompleted
            ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
            : 'bg-white/5 text-pink-400 border-white/10 group-hover:border-pink-500/40 group-hover:text-pink-300'
        }`}>
          {isCompleted ? <CheckCircle2 size={16} /> : index + 1}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-4 min-w-0 flex-1">
          <h4 className="text-sm font-bold text-white truncate group-hover:text-pink-300 transition-colors">
            {lesson.title}
          </h4>

          <div className="flex items-center gap-2 shrink-0">
            <span className="flex items-center gap-1 text-[11px] font-mono text-gray-400">
              <Clock size={12} className="text-purple-400" />
              {formatDuration(lesson.duration)}
            </span>

            <Badge variant={isCompleted ? 'emerald' : 'pink'} className="text-[10px] py-0 px-2">
              {isCompleted ? 'Completed' : 'In Progress'}
            </Badge>

            {hasNotes && (
              <Badge variant="blue" className="text-[10px] py-0 px-2">
                <FileText size={11} />
                📄 Notes
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="shrink-0">
        <Link to={`/lesson/${lesson._id}`}>
          <div className="w-8 h-8 rounded-lg bg-white/5 group-hover:bg-gradient-to-r group-hover:from-pink-500 group-hover:to-orange-500 border border-white/10 group-hover:border-transparent text-gray-300 group-hover:text-white transition-all flex items-center justify-center cursor-pointer shadow-sm">
            <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
          </div>
        </Link>
      </div>
    </div>
  );
});

export default LessonCard;
