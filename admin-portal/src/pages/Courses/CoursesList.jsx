import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Filter, Grid, List as ListIcon, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { courseService } from '../../services/course.service';
import CourseCard from './components/CourseCard';
import CourseTable from './components/CourseTable';
import DuplicateCourseModal from './components/DuplicateCourseModal';

const CoursesList = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  // State
  const [viewMode, setViewMode] = useState(() => localStorage.getItem('courseViewMode') || 'grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Persist view mode
  useEffect(() => {
    localStorage.setItem('courseViewMode', viewMode);
  }, [viewMode]);

  // Fetch Courses
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['courses', { search: debouncedSearch, status: statusFilter }],
    queryFn: async () => {
      const response = await courseService.getCourses({
        search: debouncedSearch,
        status: statusFilter,
        limit: 50 // simplistic pagination for now
      });
      return response.data;
    }
  });

  const courses = data?.courses || [];

  // Mutations
  const duplicateMutation = useMutation({
    mutationFn: (id) => courseService.duplicateCourse(id),
    onSuccess: () => {
      toast.success('Course duplicated successfully');
      queryClient.invalidateQueries(['courses']);
    },
    onError: () => toast.error('Failed to duplicate course')
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => courseService.deleteCourse(id),
    onSuccess: () => {
      toast.success('Course deleted (moved to trash)');
      queryClient.invalidateQueries(['courses']);
    },
    onError: () => toast.error('Failed to delete course')
  });

  const createDraftMutation = useMutation({
    mutationFn: () => courseService.createCourse({ 
      title: 'Untitled Course',
      shortDescription: '', 
      category: 'Uncategorized' 
    }),
    onSuccess: (res) => {
      navigate(`/courses/edit/${res.data.course._id}`);
    },
    onError: () => toast.error('Failed to create new course draft')
  });

  const handleAction = (action, course) => {
    switch(action) {
      case 'edit':
        navigate(`/courses/edit/${course._id}`);
        break;
      case 'duplicate':
        if(window.confirm('Are you sure you want to duplicate this course?')) {
          duplicateMutation.mutate(course._id);
        }
        break;
      case 'delete':
        if(window.confirm('Are you sure you want to delete this course?')) {
          deleteMutation.mutate(course._id);
        }
        break;
      case 'archive':
        toast('Archive functionality coming in wizard!', { icon: '📦' });
        break;
      case 'preview': {
        const studentPortalUrl = import.meta.env.VITE_STUDENT_PORTAL_URL || (
          window.location.hostname.includes('localhost')
            ? 'http://localhost:5174'
            : 'https://student.smven.com'
        );
        window.open(`${studentPortalUrl}/course/${course._id}`, '_blank');
        break;
      }
      default:
        break;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Courses</h1>
          <p className="text-gray-400 text-sm mt-1">Manage your course catalog</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button 
            onClick={() => setIsDuplicateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm font-medium text-white transition-colors"
          >
            Duplicate Existing Course
          </button>
          <button 
            onClick={() => createDraftMutation.mutate()}
            disabled={createDraftMutation.isPending}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#ff0064] to-[#8b5cf6] hover:opacity-90 rounded-lg text-sm font-medium text-white transition-opacity shadow-[0_0_20px_rgba(255,0,100,0.3)] disabled:opacity-50"
          >
            {createDraftMutation.isPending ? (
              <RefreshCw size={16} className="animate-spin" />
            ) : (
              <Plus size={16} />
            )}
            Create Course
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="glass-panel p-4 rounded-xl flex flex-col md:flex-row justify-between gap-4">
        <div className="flex flex-1 gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search courses..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-[#ff0064] transition-colors"
            />
          </div>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-[#ff0064] transition-colors"
          >
            <option value="">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="review">Review</option>
            <option value="published">Published</option>
            <option value="hidden">Hidden</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => refetch()} className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors" title="Refresh">
            <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
          </button>
          <div className="w-px h-6 bg-white/10 mx-1"></div>
          <div className="flex bg-black/40 border border-white/10 rounded-lg overflow-hidden p-0.5">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}
              title="Grid View"
            >
              <Grid size={16} />
            </button>
            <button 
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'table' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}
              title="Table View"
            >
              <ListIcon size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {isError ? (
        <div className="p-8 text-center text-red-400 glass-panel rounded-xl">
          Failed to load courses. Please try again.
        </div>
      ) : isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1,2,3,4,5,6,7,8].map(i => (
            <div key={i} className="glass-panel rounded-xl h-[300px] animate-pulse"></div>
          ))}
        </div>
      ) : (
        <>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {courses.map(course => (
                <CourseCard key={course._id} course={course} onAction={handleAction} />
              ))}
              {courses.length === 0 && (
                <div className="col-span-full p-12 text-center text-gray-500">
                  No courses found matching your criteria.
                </div>
              )}
            </div>
          ) : (
            <CourseTable courses={courses} onAction={handleAction} />
          )}
        </>
      )}

      <DuplicateCourseModal 
        isOpen={isDuplicateModalOpen}
        onClose={() => setIsDuplicateModalOpen(false)}
        onDuplicate={(id) => {
          duplicateMutation.mutate(id);
          setIsDuplicateModalOpen(false);
        }}
      />
    </div>
  );
};

export default CoursesList;
