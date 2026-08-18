import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Video, Clock, ArrowRight, CheckCircle2, ChevronDown, ChevronUp, Play, Lock, FileText } from 'lucide-react';
import ProgressBar from '../common/ProgressBar';
import { formatDuration } from '../../utils/formatDuration';
import Badge from '../common/Badge';

export const ModuleCard = ({ module, index = 0 }) => {
  const [isExpanded, setIsExpanded] = useState(index === 0); // Default expand first module

  if (!module) return null;

  const lessons = module.lessons || [];
  const lessonCount = lessons.length;
  
  const totalDuration = lessons.reduce((sum, l) => sum + (l.duration || 0), 0);
  const completedLessons = lessons.filter((l) => l.progress?.completed).length;
  const progress = lessonCount > 0 ? Math.round((completedLessons / lessonCount) * 100) : 0;
  const isCompleted = progress === 100 && lessonCount > 0;
  const hasStarted = progress > 0;

  // Context aware CTA label
  let ctaLabel = 'Start →';
  if (isCompleted) {
    ctaLabel = 'Review →';
  } else if (hasStarted) {
    ctaLabel = 'Continue →';
  }

  return (
    <div className="rounded-2xl glass-panel border border-white/10 overflow-hidden transition-all duration-300 hover:border-pink-500/30">
      {/* Module Header Card */}
      <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left Section: Module info */}
        <div className="space-y-2 flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-extrabold uppercase tracking-wider font-mono text-pink-400 bg-pink-500/10 px-2.5 py-0.5 rounded-md border border-pink-500/20">
              Module {index + 1}
            </span>
            {isCompleted ? (
              <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20 font-mono">
                <CheckCircle2 size={12} />
                Completed ✓
              </span>
            ) : hasStarted ? (
              <span className="text-[11px] font-bold text-pink-400 bg-pink-500/10 px-2 py-0.5 rounded-md border border-pink-500/20 font-mono">
                In Progress
              </span>
            ) : null}
          </div>

          <h3 className="text-base sm:text-lg font-extrabold text-white leading-snug truncate">
            {module.title}
          </h3>

          {/* Metadata Line */}
          <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-gray-300">
            <span className="flex items-center gap-1">
              <Video size={13} className="text-pink-400 shrink-0" />
              <span>{lessonCount} Lessons</span>
            </span>
            <span className="text-gray-600">•</span>
            <span className="flex items-center gap-1">
              <Clock size={13} className="text-purple-400 shrink-0" />
              <span>{formatDuration(totalDuration)}</span>
            </span>
            <span className="text-gray-600">•</span>
            <span className="text-pink-400 font-bold">
              Progress {progress}%
            </span>
          </div>

          {module.description && (
            <p className="text-xs text-gray-400 line-clamp-1 leading-relaxed">
              {module.description}
            </p>
          )}

          {/* Prominent Progress Bar */}
          <div className="max-w-md pt-1">
            <ProgressBar progress={progress} showLabel={false} height="h-1.5" />
          </div>
        </div>

        {/* Right Section: Action CTA & Expand Toggle */}
        <div className="shrink-0 flex items-center gap-2 self-end md:self-center pt-2 md:pt-0">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <span>{isExpanded ? 'Hide Lessons' : `Lessons (${lessonCount})`}</span>
            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          <Link to={`/module/${module._id}`}>
            <div className={`py-2.5 px-5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-md ${
              isCompleted
                ? 'bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300'
                : hasStarted
                ? 'bg-gradient-to-r from-pink-500 via-purple-500 to-orange-500 hover:brightness-110 text-white shadow-pink-500/20 active:scale-95'
                : 'bg-white/10 hover:bg-pink-500/20 border border-white/15 hover:border-pink-500/30 text-white hover:text-pink-300'
            }`}>
              <span>{ctaLabel}</span>
            </div>
          </Link>
        </div>
      </div>

      {/* Expandable Lesson List Preview */}
      {isExpanded && lessons.length > 0 && (
        <div className="bg-black/40 border-t border-white/10 p-4 space-y-2 animate-fade-in">
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-gray-400 px-1 mb-2">
            Module {index + 1} Lesson Schedule
          </div>
          <div className="space-y-1.5">
            {lessons.map((lesson, lIndex) => {
              const lessonCompleted = lesson.progress?.completed;
              const isCurrent = !lessonCompleted && (lIndex === 0 || lessons[lIndex - 1]?.progress?.completed);
              const hasNotes = Boolean(lesson.notes && (lesson.notes.title || lesson.notes.fileKey));

              return (
                <Link
                  key={lesson._id || lIndex}
                  to={`/lesson/${lesson._id}`}
                  className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-xs transition-all hover:bg-white/5 ${
                    isCurrent
                      ? 'bg-pink-500/10 border-pink-500/30 text-white font-semibold'
                      : lessonCompleted
                      ? 'bg-white/5 border-white/5 text-gray-300'
                      : 'bg-black/20 border-white/5 text-gray-400'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-6 h-6 rounded-md flex items-center justify-center font-mono text-[10px] shrink-0 ${
                      lessonCompleted
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : isCurrent
                        ? 'bg-pink-500/20 text-pink-400'
                        : 'bg-white/5 text-gray-400'
                    }`}>
                      {lessonCompleted ? (
                        <CheckCircle2 size={13} />
                      ) : (
                        <Play size={12} className={isCurrent ? "fill-pink-400" : ""} />
                      )}
                    </div>

                    <span className="truncate hover:text-pink-300">
                      {lesson.title}
                    </span>

                    {hasNotes && (
                      <Badge variant="blue" className="text-[9px] py-0 px-1.5">
                        <FileText size={10} />
                        Notes
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-3 shrink-0 font-mono text-[11px]">
                    <span className="text-gray-400">{formatDuration(lesson.duration)}</span>
                    <ArrowRight size={13} className="text-gray-500 hover:text-pink-400" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ModuleCard;
