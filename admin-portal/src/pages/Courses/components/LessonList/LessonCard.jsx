import React from 'react';
import { Edit, Copy, Archive, Trash2, GripVertical, PlayCircle, FileText, Download, Clock, Calendar } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const LessonCard = ({ lesson, onAction }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lesson._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
  };

  const statusColors = {
    published: 'bg-green-500/20 text-green-400 border-green-500/30',
    draft: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    archived: 'bg-red-500/20 text-red-400 border-red-500/30',
  };

  const TypeIcon = lesson.lessonType === 'video' ? PlayCircle : lesson.lessonType === 'text' ? FileText : Download;

  // Format date
  const updatedDate = new Date(lesson.updatedAt || lesson.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`glass-panel rounded-xl overflow-hidden group hover:border-white/20 transition-all ${
        isDragging ? 'shadow-2xl ring-2 ring-[#ff0064] opacity-80' : ''
      }`}
    >
      <div className="flex items-center p-3">
        {/* Drag Handle */}
        <div 
          className="px-2 flex items-center justify-center cursor-grab active:cursor-grabbing text-gray-500 hover:text-white transition-colors"
          {...attributes}
          {...listeners}
        >
          <GripVertical size={20} />
        </div>

        {/* Thumbnail */}
        <div className="w-24 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-black/40 border border-white/5 mx-3 relative">
          {lesson.video?.thumbnail ? (
            <img src={lesson.video.thumbnail} alt={lesson.title} className="w-full h-full object-cover opacity-80" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-600">
              <TypeIcon size={24} />
            </div>
          )}
          {lesson.settings?.allowPreview && (
            <div className="absolute top-1 left-1">
              <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-yellow-500/80 text-white uppercase backdrop-blur-md">
                Preview
              </span>
            </div>
          )}
        </div>

        {/* Main Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-white font-semibold truncate">{lesson.title}</h3>
            <span className={`px-2 py-0.5 text-[10px] font-bold rounded border backdrop-blur-md uppercase ${statusColors[lesson.status] || statusColors.draft}`}>
              {lesson.status}
            </span>
          </div>
          
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <div className="flex items-center gap-1.5">
              <TypeIcon size={12} className="text-[#ff0064]" />
              <span>
                {lesson.lessonType === 'video' ? 'Video Lesson' : lesson.lessonType === 'text' ? 'Text Lesson' : 'PDF or Notes'}
                {lesson.video?.provider ? ` • ${lesson.video.provider}` : ''}
              </span>
            </div>
            {lesson.video?.duration > 0 && (
              <div className="flex items-center gap-1.5">
                <Clock size={12} />
                {Math.floor(lesson.video.duration / 60)}m {lesson.video.duration % 60}s
              </div>
            )}
            {lesson.resources?.length > 0 && (
              <div className="flex items-center gap-1.5">
                <Download size={12} className="text-blue-400" />
                {lesson.resources.length} Resource{lesson.resources.length !== 1 ? 's' : ''}
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <Calendar size={12} />
              {updatedDate}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center ml-4 gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onAction('edit', lesson)} className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-md transition-colors" title="Edit">
            <Edit size={16} />
          </button>
          <button onClick={() => onAction('duplicate', lesson)} className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-md transition-colors" title="Duplicate">
            <Copy size={16} />
          </button>
          {lesson.status !== 'archived' && (
            <button onClick={() => onAction('archive', lesson)} className="p-2 text-gray-400 hover:text-yellow-400 hover:bg-yellow-400/10 rounded-md transition-colors" title="Archive">
              <Archive size={16} />
            </button>
          )}
          <button onClick={() => onAction('delete', lesson)} className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-colors" title="Delete">
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default LessonCard;
