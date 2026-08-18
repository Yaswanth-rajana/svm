import React, { memo } from 'react';
import ProgressBar from '../common/ProgressBar';

export const CourseProgress = memo(({ progress, completedLessonsCount, totalLessons }) => {
  return (
    <div className="py-4 space-y-2">
      <div className="flex items-center text-lg font-extrabold text-pink-400 font-mono">
        {progress}%
      </div>
      <ProgressBar progress={progress} showLabel={false} height="h-2" />
      <div className="text-xs text-gray-400 font-mono pt-1">
        {completedLessonsCount} / {totalLessons} Lessons Completed
      </div>
    </div>
  );
});

export default CourseProgress;
