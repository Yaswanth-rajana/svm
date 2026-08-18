import React, { useState } from 'react';
import {
  Clock, BookOpen, Download, HelpCircle, MessageSquare, FileText, Lock
} from 'lucide-react';
import Badge from '../../components/common/Badge';
import LessonPlayer from '../../components/lesson/LessonPlayer';
import NotesCard from '../../components/lesson/NotesCard';
import SkeletonPage from '../../components/common/SkeletonLoader';
import useLessonDetail from '../../hooks/useLessonDetail';
import { formatDuration } from '../../utils/formatDuration';
import courseService from '../../services/course.service';
import { formatFileSize } from '../../utils/formatFileSize';

export const LessonWorkspace = ({ lessonId, course = {} }) => {
  const { lesson, loading, error } = useLessonDetail(lessonId);
  const [activeTab, setActiveTab] = useState('notes');

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
            <span className="text-xs text-gray-400 font-mono flex items-center gap-1">
              <Clock size={13} className="text-purple-400" />
              {formatDuration(lesson.duration)}
            </span>
          </div>
          <h2 className="text-lg font-extrabold text-white">{lesson.title}</h2>
        </div>
      </div>

      {/* Tabbed Sections */}
      <div className="p-5 rounded-2xl glass-panel border border-white/10 space-y-4">
        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-white/10 pb-3 overflow-x-auto">
          {[
            { id: 'notes', label: 'PDF & Notes', icon: FileText },
            { id: 'quizzes', label: 'Quizzes & Assignments', icon: HelpCircle },
            { id: 'discussion', label: 'Discussion & Q&A', icon: MessageSquare },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-3.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-2 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-pink-500/20 text-pink-400 border border-pink-500/30 shadow-md shadow-pink-500/10'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab 1: Overview & PDF Notes */}
        {activeTab === 'notes' && (
          <div className="space-y-4 animate-fade-in">
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
        )}

        {/* Tab 3: Quizzes & Assignments Placeholder */}
        {activeTab === 'quizzes' && (
          <div className="p-6 rounded-xl bg-black/40 border border-white/10 text-center space-y-3 animate-fade-in">
            <HelpCircle size={28} className="mx-auto text-purple-400" />
            <h4 className="text-sm font-bold text-white">Module Checkpoint Quiz</h4>
            <button className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs font-bold shadow-lg shadow-pink-500/20 hover:brightness-110 transition-all">
              Start Knowledge Check
            </button>
          </div>
        )}

        {/* Tab 4: Discussion & Q&A Placeholder */}
        {activeTab === 'discussion' && (
          <div className="p-6 rounded-xl bg-black/40 border border-white/10 text-center space-y-3 animate-fade-in">
            <MessageSquare size={28} className="mx-auto text-pink-400" />
            <h4 className="text-sm font-bold text-white">Student Q&A Community</h4>
            <button className="px-4 py-2 rounded-xl bg-white/10 border border-white/15 text-white text-xs font-bold hover:bg-white/20 transition-all">
              Post Question
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LessonWorkspace;
