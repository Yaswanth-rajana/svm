import React from 'react';
import { BookOpen } from 'lucide-react';
import Badge from '../../components/common/Badge';
import LessonPlayer from '../../components/lesson/LessonPlayer';
import NotesCard from '../../components/lesson/NotesCard';
import SkeletonPage from '../../components/common/SkeletonLoader';
import useLessonDetail from '../../hooks/useLessonDetail';

export const LessonWorkspace = ({ lessonId, course = {} }) => {
  const { lesson, loading, error } = useLessonDetail(lessonId);

  if (loading) return <div className="p-8"><SkeletonPage /></div>;
  if (error || !lesson) return <div className="p-8 text-gray-400">Failed to load lesson content.</div>;

  const isCompleted = lesson.progress?.completed;
  const hasNotes = Boolean(lesson.notes && (lesson.notes.pdf || lesson.notes.fileKey));

  return (
    <div className="space-y-5 w-full min-w-0 animate-fade-in">
      {/* Embedded Lesson Video Player */}
      {(!lesson.lessonType || lesson.lessonType === 'video') && (
        <LessonPlayer
          lesson={lesson}
          videoUrl={lesson?.video?.url || lesson?.videoUrl}
          title={lesson?.title}
        />
      )}

      {/* Lesson Action Controls Header Bar */}
      <div className="p-4 rounded-2xl glass-panel border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant={isCompleted ? 'emerald' : 'pink'}>
              {isCompleted ? 'Completed ✓' : 'In Progress'}
            </Badge>
          </div>
          <h2 className="text-lg font-extrabold text-white">{lesson.title}</h2>
        </div>
      </div>

      {/* Lesson Description & PDF Notes Section */}
      <div className="p-5 rounded-2xl glass-panel border border-white/10 space-y-4">
        <div className="space-y-2">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <BookOpen size={16} className="text-pink-400" />
            Lesson Description & Objectives
          </h3>
          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
            {lesson.description ||
              'In this lesson, you will master fundamental architectural principles, configuration best practices, and enterprise troubleshooting techniques.'}
          </p>
        </div>

        {hasNotes ? (
          <NotesCard courseId={lesson.courseId} lessonId={lessonId} notes={lesson.notes} />
        ) : (
          <div className="p-4 rounded-xl bg-black/40 border border-white/10 flex items-center justify-between text-xs">
            <span className="text-gray-400 font-mono">PDF Reference Notes: Not available.</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default LessonWorkspace;
