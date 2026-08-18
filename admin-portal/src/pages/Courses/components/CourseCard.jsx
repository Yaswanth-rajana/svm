import React from 'react';
import { MoreVertical, Edit, Copy, Archive, Trash2, Eye, PlaySquare, FileEdit, Users } from 'lucide-react';

const CourseCard = ({ course, onAction }) => {
  const statusColors = {
    published: 'bg-green-500/20 text-green-400 border-green-500/30',
    draft: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    review: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    hidden: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    archived: 'bg-red-500/20 text-red-400 border-red-500/30',
  };

  return (
    <div className="glass-panel rounded-xl overflow-hidden group hover:border-white/20 transition-colors flex flex-col">
      {/* Thumbnail */}
      <div className="relative aspect-video bg-black/40 border-b border-white/5 overflow-hidden">
        {course.media?.thumbnail ? (
          <img src={course.media.thumbnail} alt={course.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1a0b2e] to-black">
            <span className="text-gray-500 font-medium">No Thumbnail</span>
          </div>
        )}
        
        <div className="absolute top-3 left-3 flex gap-2">
          <span className={`px-2 py-1 text-[10px] font-semibold rounded-md border backdrop-blur-md uppercase ${statusColors[course.status] || statusColors.draft}`}>
            {course.status}
          </span>
          {course.settings?.visibility === 'private' && (
            <span className="px-2 py-1 text-[10px] font-semibold rounded-md border border-white/10 bg-black/50 text-white backdrop-blur-md uppercase">
              Private
            </span>
          )}
        </div>

        {/* Action Menu (simplified for now, full dropdown later) */}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="bg-black/60 backdrop-blur-md border border-white/10 rounded-lg p-1 flex gap-1">
            <button onClick={() => onAction('edit', course)} className="p-1.5 text-gray-300 hover:text-white hover:bg-white/10 rounded-md transition-colors" title="Edit">
              <Edit size={14} />
            </button>
            <button onClick={() => onAction('preview', course)} className="p-1.5 text-gray-300 hover:text-white hover:bg-white/10 rounded-md transition-colors" title="Preview">
              <Eye size={14} />
            </button>
            <button onClick={() => onAction('duplicate', course)} className="p-1.5 text-gray-300 hover:text-white hover:bg-white/10 rounded-md transition-colors" title="Duplicate">
              <Copy size={14} />
            </button>
            <button onClick={() => onAction('archive', course)} className="p-1.5 text-gray-300 hover:text-yellow-400 hover:bg-yellow-400/10 rounded-md transition-colors" title="Archive">
              <Archive size={14} />
            </button>
            <button onClick={() => onAction('delete', course)} className="p-1.5 text-gray-300 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-colors" title="Delete">
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-white font-semibold line-clamp-2 leading-tight">{course.title}</h3>
        </div>
        
        <p className="text-sm text-gray-400 mb-4">{course.instructor || 'SMVEN Faculty'}</p>
        
        <div className="mt-auto">
          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-2 py-3 border-y border-white/5 mb-3">
            <div className="flex flex-col items-center justify-center p-1 rounded bg-white/5">
              <span className="text-xs text-gray-500 font-medium mb-1">Modules</span>
              <span className="text-xs font-semibold text-white">{course.stats?.modules || 0}</span>
            </div>
            <div className="flex flex-col items-center justify-center p-1 rounded bg-white/5">
              <span className="text-xs text-gray-500 font-medium mb-1">Lessons</span>
              <span className="text-xs font-semibold text-white">{course.stats?.lessons || 0}</span>
            </div>
            <div className="flex flex-col items-center justify-center p-1 rounded bg-white/5">
              <span className="text-xs text-gray-500 font-medium mb-1">Videos</span>
              <span className="text-xs font-semibold text-white">{course.stats?.videos || 0}</span>
            </div>
          </div>
          
          <div className="flex justify-between items-center text-[10px] text-gray-500 font-medium">
            <span>Updated {new Date(course.updatedAt || Date.now()).toLocaleDateString()}</span>
            <span>v{course.version || '1.0'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
