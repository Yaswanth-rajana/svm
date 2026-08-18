import React, { useState, useEffect } from 'react';
import { Search, X, Copy } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { courseService } from '../../../services/course.service';

const DuplicateCourseModal = ({ isOpen, onClose, onDuplicate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data, isLoading } = useQuery({
    queryKey: ['courses-duplicate-search', { search: debouncedSearch }],
    queryFn: async () => {
      const response = await courseService.getCourses({
        search: debouncedSearch,
        limit: 20
      });
      return response.data;
    },
    enabled: isOpen
  });

  if (!isOpen) return null;

  const courses = data?.courses || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#111111] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[80vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 shrink-0">
          <h2 className="text-lg font-bold text-white">Duplicate Existing Course</h2>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-white/5 shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search courses..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-[#ff0064] transition-colors"
              autoFocus
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-2">
          {isLoading ? (
            <div className="p-8 text-center text-gray-400">Loading courses...</div>
          ) : courses.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No courses found.</div>
          ) : (
            <div className="space-y-1">
              {courses.map(course => (
                <button
                  key={course._id}
                  onClick={() => onDuplicate(course._id)}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors group text-left"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-black/50 shrink-0">
                      {course.media?.thumbnail ? (
                        <img src={course.media.thumbnail} alt={course.title} className="w-full h-full object-cover opacity-80" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-600">No Img</div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate">{course.title}</p>
                      <p className="text-xs text-gray-500 truncate capitalize">{course.status}</p>
                    </div>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 p-2 text-[#ff0064] transition-opacity">
                    <Copy size={16} />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default DuplicateCourseModal;
