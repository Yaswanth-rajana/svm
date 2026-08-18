import React from 'react';
import { Edit, Copy, Archive, Trash2, GripVertical, ChevronRight, PlaySquare, FileEdit, Users, Clock } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { formatDuration } from '../../../../utils/formatters';
import { CSS } from '@dnd-kit/utilities';

const ModuleCard = ({ module, onAction }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: module._id });

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

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`glass-panel rounded-xl overflow-hidden group hover:border-white/20 transition-all ${
        isDragging ? 'shadow-2xl ring-2 ring-[#ff0064] opacity-80' : ''
      }`}
    >
      <div className="flex flex-col md:flex-row h-full">
        {/* Drag Handle */}
        <div 
          className="w-10 flex items-center justify-center cursor-grab active:cursor-grabbing text-gray-500 hover:text-white transition-colors border-r border-white/5 bg-black/40 shrink-0"
          {...attributes}
          {...listeners}
        >
          <GripVertical size={20} />
        </div>

        {/* Content */}
        <div className="p-4 flex-1 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded border backdrop-blur-md uppercase ${statusColors[module.status] || statusColors.draft}`}>
                    {module.status}
                  </span>
                  {module.settings?.allowPreview && (
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded border border-white/10 bg-black/50 text-white backdrop-blur-md uppercase">
                      Preview
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-bold text-white leading-tight">{module.title}</h3>
                <p className="text-xs text-gray-400 mt-1 line-clamp-1">{module.shortDescription || 'No description provided.'}</p>
              </div>
              <div className="flex bg-black/60 backdrop-blur-md border border-white/10 rounded-lg p-1">
                <button onClick={() => onAction('edit', module)} className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-md transition-colors" title="Edit">
                  <Edit size={14} />
                </button>
                <button onClick={() => onAction('duplicate', module)} className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-md transition-colors" title="Duplicate">
                  <Copy size={14} />
                </button>
                <button onClick={() => onAction('archive', module)} className="p-1.5 text-gray-400 hover:text-yellow-400 hover:bg-yellow-400/10 rounded-md transition-colors" title="Archive">
                  <Archive size={14} />
                </button>
                <button onClick={() => onAction('delete', module)} className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-colors" title="Delete">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
          
          <div className="mt-4 flex flex-wrap gap-4 items-center justify-between border-t border-white/5 pt-3">
            {/* Stats */}
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <span className="text-xs text-gray-500 font-medium mb-0.5">Lessons</span>
                <div className="flex items-center gap-1.5 text-white font-semibold">
                  <PlaySquare size={14} className="text-[#ff0064]" /> {module.stats?.lessons || 0}
                </div>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-xs text-gray-500 font-medium mb-0.5">Videos</span>
                <div className="flex items-center gap-1.5 text-white font-semibold">
                  <PlaySquare size={14} className="text-[#8b5cf6]" /> {module.stats?.videos || 0}
                </div>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-xs text-gray-500 font-medium mb-0.5">Assignments</span>
                <div className="flex items-center gap-1.5 text-white font-semibold">
                  <FileEdit size={14} className="text-green-400" /> {module.stats?.assignments || 0}
                </div>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-xs text-gray-500 font-medium mb-0.5">Duration</span>
                <div className="flex items-center gap-1.5 text-white font-semibold">
                  <Clock size={14} className="text-yellow-400" /> {formatDuration(module.stats?.totalDuration)}
                </div>
              </div>
            </div>

            {/* Manage Lessons Button */}
            <button 
              onClick={() => onAction('manage', module)}
              className="flex items-center gap-2 px-4 py-2 bg-[#ff0064]/10 hover:bg-[#ff0064]/20 border border-[#ff0064]/30 rounded-lg text-sm font-medium text-[#ff0064] hover:text-white transition-colors group"
            >
              {module.stats?.lessons > 0 ? 'Manage Content' : 'Add Lessons'}
              <ChevronRight size={16} className="text-[#ff0064] group-hover:text-white transition-colors" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModuleCard;
