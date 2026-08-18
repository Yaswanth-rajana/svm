import React, { memo } from 'react';
import { 
  Play, FileText, ClipboardList, Clipboard, 
  Code, Radio, CheckCircle2, Lock 
} from 'lucide-react';
import { formatDuration } from '../../utils/formatDuration';

const getLessonIcon = (type, className = "") => {
  switch (type?.toLowerCase()) {
    case 'text':
    case 'resource':
    case 'pdf': 
      return <FileText size={14} className={className} />;
    case 'quiz': return <ClipboardList size={14} className={className} />;
    case 'assignment': return <Clipboard size={14} className={className} />;
    case 'coding': return <Code size={14} className={className} />;
    case 'live': return <Radio size={14} className={className} />;
    case 'video':
    default:
      return <Play size={14} className={className} />;
  }
};

export const LessonRow = memo(({ lesson, isCompleted, isCurrent, isLocked, onSelect }) => {
  // Styles based on status
  let containerStyles = "p-3 sm:p-4 border-b border-white/5 last:border-0 flex items-center justify-between gap-3 text-xs transition-all hover:bg-white/5 cursor-pointer group";
  let iconStyles = "w-7 h-7 rounded-md flex items-center justify-center shrink-0 transition-colors";
  let titleStyles = "font-medium text-gray-200 group-hover:text-pink-300 truncate";
  let statusText = "";
  
  if (isCompleted) {
    statusText = "Completed";
    iconStyles += " bg-emerald-500/10 text-emerald-400";
    titleStyles = "font-medium text-gray-400 truncate";
  } else if (isCurrent) {
    statusText = "Current";
    containerStyles = "p-3 sm:p-4 border-b border-white/5 last:border-0 flex items-center justify-between gap-3 text-xs transition-all bg-gradient-to-r from-pink-500/10 to-purple-500/10 cursor-pointer group";
    iconStyles += " bg-pink-500/20 text-pink-400";
    titleStyles = "font-extrabold text-white truncate";
  } else if (isLocked) {
    statusText = "Locked";
    containerStyles += " opacity-60 pointer-events-none";
    iconStyles += " bg-white/5 text-gray-500";
    titleStyles = "font-medium text-gray-500 truncate";
  } else {
    // Not started, not current, but unlocked
    statusText = "Start";
    iconStyles += " bg-white/5 text-gray-400 group-hover:text-pink-400";
  }

  // If locked, we don't wrap in link, just a div
  const InnerContent = (
    <>
      <div className="flex items-center gap-3 min-w-0">
        <div className={iconStyles}>
          {isCompleted ? (
            <CheckCircle2 size={15} />
          ) : isLocked ? (
            <Lock size={14} />
          ) : (
            getLessonIcon(lesson.lessonType || lesson.type, isCurrent ? "fill-pink-400/20 text-pink-400" : "")
          )}
        </div>
        
        <div className="flex flex-col min-w-0">
          <span className={titleStyles}>
            {lesson.title}
          </span>
          {isCurrent && (
            <span className="text-[10px] font-mono font-bold text-pink-400 mt-0.5 tracking-wider uppercase">
              Current Lesson
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4 shrink-0 font-mono text-[11px] text-gray-400">
        {(lesson.lessonType || lesson.type) === 'video' && lesson.duration > 0 && (
          <span className="hidden sm:inline-block">{formatDuration(lesson.duration)}</span>
        )}
        <span className={`w-16 text-right ${isCompleted ? 'text-emerald-400' : isCurrent ? 'text-pink-400' : ''}`}>
          {statusText}
        </span>
      </div>
    </>
  );

  if (isLocked) {
    return <div className={containerStyles}>{InnerContent}</div>;
  }

  return (
    <div onClick={() => onSelect(lesson._id)} className={containerStyles}>
      {InnerContent}
    </div>
  );
});

export default LessonRow;
