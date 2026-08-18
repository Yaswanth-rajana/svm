import React from 'react';
import { User, Globe, BookOpen, Tag, Pin } from 'lucide-react';

const categoryStyles = {
  General: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  'Course Update': 'bg-pink-500/10 text-pink-400 border-pink-500/20',
  Maintenance: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  'Live Session': 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  Assignment: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  Exam: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  System: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
};

export const AnnouncementBadge = ({
  category = 'General',
  type = 'global',
  postedBy = 'SMVEN Admin',
  isPinned = false,
  courseTitle = null,
}) => {
  const style = categoryStyles[category] || categoryStyles.General;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Pinned Badge */}
      {isPinned && (
        <span className="flex items-center gap-1 text-[10px] font-bold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 rounded-full shadow-sm">
          <Pin size={11} className="fill-amber-400 text-amber-400 rotate-45" /> PINNED
        </span>
      )}

      {/* Posted By */}
      <span className="flex items-center gap-1 text-[10px] font-medium text-gray-300 bg-white/5 border border-white/10 px-2.5 py-0.5 rounded-full">
        <User size={11} className="text-pink-400" />
        <span>{postedBy}</span>
      </span>

      {/* Scope / Course Badge */}
      {courseTitle ? (
        <span className="flex items-center gap-1 text-[10px] font-semibold text-purple-300 bg-purple-500/10 border border-purple-500/20 px-2.5 py-0.5 rounded-full">
          <BookOpen size={11} className="text-purple-400" /> {courseTitle}
        </span>
      ) : type === 'course' ? (
        <span className="flex items-center gap-1 text-[10px] font-medium text-purple-300 bg-purple-500/10 border border-purple-500/20 px-2.5 py-0.5 rounded-full">
          <BookOpen size={11} className="text-purple-400" /> Course
        </span>
      ) : (
        <span className="flex items-center gap-1 text-[10px] font-medium text-cyan-300 bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-0.5 rounded-full">
          <Globe size={11} className="text-cyan-400" /> Global
        </span>
      )}

      {/* Category Badge */}
      <span className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${style}`}>
        <Tag size={10} /> {category}
      </span>
    </div>
  );
};

export default AnnouncementBadge;
