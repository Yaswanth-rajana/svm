import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, CheckCircle2, Clock, ArrowRight, BookOpen, GraduationCap } from 'lucide-react';
import AnnouncementBadge from './AnnouncementBadge';
import AnnouncementAttachment from './AnnouncementAttachment';

const getRelativeTimeString = (dateStr) => {
  if (!dateStr) return 'Just now';
  const now = new Date();
  const past = new Date(dateStr);
  const diffMs = now - past;
  const diffMins = Math.max(0, Math.floor(diffMs / (1000 * 60)));
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} ${diffMins === 1 ? 'min' : 'mins'} ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
  return past.toLocaleDateString();
};

export const AnnouncementCard = ({ announcement, onMarkRead }) => {
  if (!announcement) return null;

  const {
    _id,
    id,
    type,
    targetType,
    courseId,
    moduleId,
    lessonId,
    title,
    message,
    category = 'General',
    announcementType = 'global',
    postedBy = 'SMVEN Admin',
    isPinned = false,
    createdAt,
    read = false,
    attachments = [],
  } = announcement;

  const annId = _id || id;

  // Extract reference objects/IDs
  const courseObj = typeof courseId === 'object' ? courseId : null;
  const moduleObj = typeof moduleId === 'object' ? moduleId : null;
  const lessonObj = typeof lessonId === 'object' ? lessonId : null;

  const rawCourseId = courseObj?._id || courseId;
  const rawModuleId = moduleObj?._id || moduleId;
  const rawLessonId = lessonObj?._id || lessonId;

  const courseTitle = courseObj?.title || '';
  const moduleTitle = moduleObj?.title || '';

  const isModulePublished = type === 'COURSE_MODULE_PUBLISHED';
  const isLessonPublished = type === 'COURSE_LESSON_PUBLISHED';

  const exactDate = createdAt
    ? new Date(createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Recent Broadcast';

  const relativeTime = getRelativeTimeString(createdAt);

  const handleClick = () => {
    if (!read && onMarkRead) {
      onMarkRead(annId);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`
        relative p-5 rounded-2xl transition-all duration-300 backdrop-blur-xl border overflow-hidden
        ${
          !read
            ? 'border-pink-500/30 bg-gradient-to-r from-pink-500/10 via-[#161c24] to-[#11161d] shadow-lg shadow-pink-500/5'
            : 'border-white/10 bg-[#11161d]/80 hover:border-white/20 hover:bg-[#161c24]'
        }
      `}
    >
      {/* Unread Left Accent Strip */}
      {!read && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-pink-500 via-purple-500 to-pink-500" />
      )}

      {/* Header Info Bar: Badges + Timestamp */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <AnnouncementBadge
            category={category}
            type={targetType === 'COURSE' || announcementType === 'course' ? 'course' : 'global'}
            postedBy={postedBy}
            isPinned={isPinned}
            courseTitle={courseTitle}
          />
        </div>

        {/* Timestamp */}
        <div className="flex items-center gap-2 text-xs text-gray-400 font-mono">
          <Clock size={12} className="text-pink-400" />
          <span className="font-bold text-gray-300">{relativeTime}</span>
          <span className="opacity-40">•</span>
          <span className="text-[11px] text-gray-400">{exactDate}</span>
          {read ? (
            <span className="flex items-center gap-1 text-emerald-400 text-[10px] bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              <CheckCircle2 size={11} /> Read
            </span>
          ) : (
            <span className="text-pink-400 font-bold text-[10px] bg-pink-500/10 px-2 py-0.5 rounded-full border border-pink-500/20">
              Unread
            </span>
          )}
        </div>
      </div>

      {/* Announcement Title */}
      <h3
        className={`text-base mb-2 leading-snug transition-colors ${
          !read
            ? 'font-black text-white hover:text-pink-300'
            : 'font-semibold text-gray-200 hover:text-white'
        }`}
      >
        {title}
      </h3>

      {/* Announcement Body */}
      <p className="text-xs text-gray-300 leading-relaxed whitespace-pre-line mb-3">
        {message}
      </p>

      {/* Action Navigation Links for Module / Lesson Publications */}
      {isModulePublished && rawCourseId && (
        <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
          <div className="text-[11px] text-gray-400 font-mono">Published: Today</div>
          <Link
            to={`/course/${rawCourseId}${rawModuleId ? `?moduleId=${rawModuleId}` : ''}`}
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-pink-500/20 hover:bg-pink-500/30 border border-pink-500/40 text-pink-300 text-xs font-bold transition-all shadow-md active:scale-95"
          >
            <span>View Course</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      )}

      {isLessonPublished && rawCourseId && rawLessonId && (
        <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
          <div className="text-[11px] text-gray-400 font-mono">Published: Today</div>
          <Link
            to={`/course/${rawCourseId}?lessonId=${rawLessonId}`}
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:brightness-110 text-white text-xs font-extrabold transition-all shadow-md active:scale-95"
          >
            <span>Open Lesson</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      )}

      {/* Attachments Section */}
      {attachments && attachments.length > 0 && (
        <div className="space-y-2 pt-3 border-t border-white/5">
          {attachments.map((att, idx) => (
            <AnnouncementAttachment key={att.url || idx} attachment={att} />
          ))}
        </div>
      )}
    </div>
  );
};

export default AnnouncementCard;
