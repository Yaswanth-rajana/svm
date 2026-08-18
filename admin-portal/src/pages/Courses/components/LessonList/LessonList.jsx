import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Filter, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { lessonService } from '../../../../services/lesson.service';
import LessonCard from './LessonCard';
import LessonWizard from '../LessonWizard/LessonWizard';

const LessonList = ({ courseId, moduleId }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [lessons, setLessons] = useState([]);
  const [isSavingOrder, setIsSavingOrder] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  const [selectedLessonId, setSelectedLessonId] = useState(null);

  // Sensors for drag-and-drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Fetch Lessons
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['lessons', moduleId],
    queryFn: async () => {
      const response = await lessonService.getLessons(moduleId);
      return response.data;
    }
  });

  useEffect(() => {
    if (data?.lessons) {
      setLessons(data.lessons);
    }
  }, [data?.lessons]);

  // Mutations
  const reorderMutation = useMutation({
    mutationFn: (updates) => lessonService.reorderLessons(updates),
    onSuccess: () => {
      toast.success('Order saved successfully', { id: 'reorder' });
      queryClient.invalidateQueries(['lessons', moduleId]);
      queryClient.invalidateQueries(['module', moduleId]);
      queryClient.invalidateQueries(['course', courseId]);
      queryClient.invalidateQueries(['dashboard']);
      setIsSavingOrder(false);
    },
    onError: () => {
      toast.error('Failed to save order', { id: 'reorder' });
      setIsSavingOrder(false);
      // Revert optimism
      if (data?.lessons) setLessons(data.lessons);
    }
  });

  const duplicateMutation = useMutation({
    mutationFn: (id) => lessonService.duplicateLesson(id),
    onSuccess: () => {
      toast.success('Lesson duplicated successfully');
      queryClient.invalidateQueries(['lessons', moduleId]);
      queryClient.invalidateQueries(['module', moduleId]);
      queryClient.invalidateQueries(['course', courseId]);
      queryClient.invalidateQueries(['dashboard']);
    },
    onError: () => toast.error('Failed to duplicate lesson')
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => lessonService.deleteLesson(id),
    onSuccess: () => {
      toast.success('Lesson deleted');
      queryClient.invalidateQueries(['lessons', moduleId]);
      queryClient.invalidateQueries(['module', moduleId]);
      queryClient.invalidateQueries(['course', courseId]);
      queryClient.invalidateQueries(['dashboard']);
    },
    onError: () => toast.error('Failed to delete lesson')
  });

  const handleAction = (action, lesson) => {
    switch(action) {
      case 'edit':
        setSelectedLessonId(lesson._id);
        setShowWizard(true);
        break;
      case 'duplicate':
        if(window.confirm('Are you sure you want to duplicate this lesson?')) {
          duplicateMutation.mutate(lesson._id);
        }
        break;
      case 'delete':
        if(window.confirm('Are you sure you want to delete this lesson?')) {
          deleteMutation.mutate(lesson._id);
        }
        break;
      case 'archive':
        lessonService.updateStatus(lesson._id, 'archived')
          .then(() => {
            toast.success('Lesson archived');
            queryClient.invalidateQueries(['lessons', moduleId]);
            queryClient.invalidateQueries(['module', moduleId]);
            queryClient.invalidateQueries(['course', courseId]);
            queryClient.invalidateQueries(['dashboard']);
          })
          .catch(() => toast.error('Failed to archive lesson'));
        break;
      default:
        break;
    }
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setLessons((items) => {
        const oldIndex = items.findIndex((i) => i._id === active.id);
        const newIndex = items.findIndex((i) => i._id === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);
        
        const updates = newItems.map((item, index) => ({
          _id: item._id,
          order: index + 1
        }));

        setIsSavingOrder(true);
        toast.loading('Saving order...', { id: 'reorder' });
        reorderMutation.mutate(updates);

        return newItems;
      });
    }
  };

  const filteredLessons = lessons.filter(lesson => {
    const matchesSearch = lesson.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter ? lesson.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  if (showWizard) {
    return (
      <LessonWizard
        courseId={courseId}
        moduleId={moduleId}
        lessonId={selectedLessonId}
        onClose={() => {
          setShowWizard(false);
          setSelectedLessonId(null);
          refetch();
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col md:flex-row justify-between gap-4 items-center">
        <div className="flex w-full md:w-auto gap-4 flex-1 max-w-xl">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search lessons..." 
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
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          {isSavingOrder && <span className="text-sm text-gray-400 animate-pulse">Saving order...</span>}
          <button onClick={() => refetch()} className="p-2 text-gray-400 hover:text-white transition-colors" title="Refresh">
            <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
          </button>
          <button 
            onClick={() => {
              setSelectedLessonId(null);
              setShowWizard(true);
            }}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-[#ff0064] hover:bg-[#ff0064]/90 rounded-lg text-sm font-medium text-white transition-colors"
          >
            <Plus size={16} />
            Create Lesson
          </button>
        </div>
      </div>

      {/* Content */}
      {isError ? (
        <div className="p-8 text-center text-red-400 glass-panel rounded-xl">
          Failed to load lessons. Please try again.
        </div>
      ) : isLoading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => (
            <div key={i} className="glass-panel rounded-xl h-24 animate-pulse"></div>
          ))}
        </div>
      ) : filteredLessons.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-xl border border-dashed border-white/20">
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
            <Filter size={24} />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">No lessons found</h3>
          <p className="text-gray-400 text-sm mb-6 max-w-sm mx-auto">
            {searchTerm || statusFilter 
              ? 'Try adjusting your search or filters.' 
              : 'This module has no lessons yet. Create your first lesson.'}
          </p>
          {!searchTerm && !statusFilter && (
            <button 
              onClick={() => {
                setSelectedLessonId(null);
                setShowWizard(true);
              }}
              className="px-6 py-2 bg-[#ff0064]/20 hover:bg-[#ff0064]/30 text-[#ff0064] border border-[#ff0064]/30 rounded-lg text-sm font-medium transition-colors"
            >
              Create First Lesson
            </button>
          )}
        </div>
      ) : (
        <DndContext 
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext 
            items={filteredLessons.map(l => l._id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {filteredLessons.map((lesson) => (
                <LessonCard 
                  key={lesson._id} 
                  lesson={lesson} 
                  onAction={handleAction} 
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
};

export default LessonList;
