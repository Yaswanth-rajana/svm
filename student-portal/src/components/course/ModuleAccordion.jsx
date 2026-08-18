import React, { memo } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { formatDuration } from '../../utils/formatDuration';
import LessonRow from './LessonRow';

export const ModuleAccordion = memo(({ 
  module, 
  index = 0, 
  isExpanded, 
  onToggle, 
  currentLessonId,
  isSequential = false,
  onSelectLesson
}) => {
  if (!module) return null;

  const lessons = module.lessons || [];
  const lessonCount = lessons.length;
  const totalDuration = lessons.reduce((sum, l) => sum + (l.duration || 0), 0);

  // Determine if previous lesson was completed to handle locking
  let hasLockedStarted = false;

  return (
    <div className="mb-3 rounded-xl glass-panel border border-white/10 overflow-hidden transition-all duration-300">
      {/* Accordion Header */}
      <div 
        onClick={onToggle}
        className="p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="text-pink-400 mt-0.5">
            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] font-extrabold uppercase tracking-wider font-mono text-gray-400">
              Module {index + 1}
            </span>
            <h3 className="text-base font-extrabold text-white leading-snug truncate">
              {module.title}
            </h3>
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-xs font-mono text-gray-400 shrink-0">
          <span>{lessonCount} Lessons</span>
        </div>
      </div>

      {/* Accordion Content (Lessons) */}
      <div 
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        {isExpanded && lessons.length > 0 && (
          <div className="bg-black/40 border-t border-white/5 flex flex-col">
            {lessons.map((lesson, lIndex) => {
              const isCompleted = lesson.progress?.completed;
              const isCurrent = lesson._id === currentLessonId;
              
              // Lesson locking logic
              let isLocked = false;
              if (isSequential) {
                if (isCurrent) {
                  isLocked = false;
                } else if (hasLockedStarted) {
                  isLocked = true;
                } else if (!isCompleted) {
                  hasLockedStarted = true; // The next lessons will be locked
                }
              }

              return (
                <LessonRow 
                  key={lesson._id || lIndex}
                  lesson={lesson}
                  isCompleted={isCompleted}
                  isCurrent={isCurrent}
                  isLocked={isLocked}
                  onSelect={onSelectLesson}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
});

export default ModuleAccordion;
