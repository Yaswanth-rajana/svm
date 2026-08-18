import React from 'react';
import { MoreHorizontal, Edit, Eye, Copy, Archive, Trash2 } from 'lucide-react';

const CourseTable = ({ courses, onAction }) => {
  const statusColors = {
    published: 'bg-green-500/10 text-green-400 border-green-500/20',
    draft: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
    review: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    hidden: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    archived: 'bg-red-500/10 text-red-400 border-red-500/20',
  };

  return (
    <div className="glass-panel rounded-xl overflow-hidden w-full overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-white/10 bg-white/5 text-xs uppercase tracking-wider text-gray-400">
            <th className="p-4 font-medium">Course Name</th>
            <th className="p-4 font-medium">Status</th>
            <th className="p-4 font-medium">Instructor</th>
            <th className="p-4 font-medium">Students</th>
            <th className="p-4 font-medium">Updated</th>
            <th className="p-4 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {courses.length === 0 ? (
            <tr>
              <td colSpan="6" className="p-8 text-center text-gray-500">
                No courses found
              </td>
            </tr>
          ) : (
            courses.map((course) => (
              <tr key={course._id} className="hover:bg-white/[0.02] transition-colors group">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-16 bg-black/40 rounded overflow-hidden flex-shrink-0">
                      {course.media?.thumbnail ? (
                        <img src={course.media.thumbnail} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-800 to-black"></div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white line-clamp-1">{course.title}</p>
                      <p className="text-xs text-gray-500">v{course.version || '1.0'}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <span className={`px-2.5 py-1 text-[10px] font-semibold rounded-full border ${statusColors[course.status] || statusColors.draft} uppercase`}>
                    {course.status}
                  </span>
                </td>
                <td className="p-4 text-sm text-gray-300">{course.instructor || 'SMVEN Faculty'}</td>
                <td className="p-4 text-sm text-gray-300">{course.stats?.students || 0}</td>
                <td className="p-4 text-xs text-gray-500">{new Date(course.updatedAt || Date.now()).toLocaleDateString()}</td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => onAction('edit', course)} className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors" title="Edit">
                      <Edit size={14} />
                    </button>
                    <button onClick={() => onAction('preview', course)} className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors" title="Preview">
                      <Eye size={14} />
                    </button>
                    <button onClick={() => onAction('duplicate', course)} className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors" title="Duplicate">
                      <Copy size={14} />
                    </button>
                    <button onClick={() => onAction('delete', course)} className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors" title="Delete">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default CourseTable;
