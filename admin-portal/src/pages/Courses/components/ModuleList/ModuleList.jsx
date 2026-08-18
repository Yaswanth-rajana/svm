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
import { moduleService } from '../../../../services/module.service';
import ModuleCard from './ModuleCard';
import ModuleWizard from '../ModuleWizard/ModuleWizard';
import LessonList from '../LessonList/LessonList';

const ModuleList = ({ courseId }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modules, setModules] = useState([]);
  const [isSavingOrder, setIsSavingOrder] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  const [selectedModuleId, setSelectedModuleId] = useState(null);
  const [selectedModuleForContent, setSelectedModuleForContent] = useState(null);

  // Sensors for drag-and-drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // 5px drag distance before firing
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Fetch Modules
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['modules', courseId],
    queryFn: async () => {
      const response = await moduleService.getModules(courseId);
      return response.data;
    }
  });

  useEffect(() => {
    if (data?.modules) {
      setModules(data.modules);
    }
  }, [data?.modules]);

  // Mutations
  const reorderMutation = useMutation({
    mutationFn: (updates) => moduleService.reorderModules(updates),
    onSuccess: () => {
      toast.success('Order saved successfully', { id: 'reorder' });
      queryClient.invalidateQueries(['modules', courseId]);
      setIsSavingOrder(false);
    },
    onError: () => {
      toast.error('Failed to save order', { id: 'reorder' });
      setIsSavingOrder(false);
      // Revert optimism
      if (data?.modules) setModules(data.modules);
    }
  });

  const duplicateMutation = useMutation({
    mutationFn: (id) => moduleService.duplicateModule(id),
    onSuccess: () => {
      toast.success('Module duplicated successfully');
      queryClient.invalidateQueries(['modules', courseId]);
    },
    onError: () => toast.error('Failed to duplicate module')
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => moduleService.deleteModule(id),
    onSuccess: () => {
      toast.success('Module deleted');
      queryClient.invalidateQueries(['modules', courseId]);
    },
    onError: () => toast.error('Failed to delete module')
  });

  const handleAction = (action, module) => {
    switch(action) {
      case 'edit':
        setSelectedModuleId(module._id);
        setShowWizard(true);
        break;
      case 'duplicate':
        if(window.confirm('Are you sure you want to duplicate this module?')) {
          duplicateMutation.mutate(module._id);
        }
        break;
      case 'delete':
        if(window.confirm('Are you sure you want to delete this module?')) {
          deleteMutation.mutate(module._id);
        }
        break;
      case 'archive':
        // Quick archive via status update
        moduleService.updateStatus(module._id, 'archived')
          .then(() => {
            toast.success('Module archived');
            queryClient.invalidateQueries(['modules', courseId]);
          })
          .catch(() => toast.error('Failed to archive module'));
        break;
      case 'manage':
        setSelectedModuleForContent(module);
        break;
      default:
        break;
    }
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setModules((items) => {
        const oldIndex = items.findIndex((i) => i._id === active.id);
        const newIndex = items.findIndex((i) => i._id === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);
        
        // Prepare updates payload for backend
        const updates = newItems.map((item, index) => ({
          _id: item._id,
          order: index + 1
        }));

        // Fire auto-save
        setIsSavingOrder(true);
        toast.loading('Saving order...', { id: 'reorder' });
        reorderMutation.mutate(updates);

        return newItems;
      });
    }
  };

  const filteredModules = modules.filter(mod => {
    const matchesSearch = mod.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (mod.shortDescription && mod.shortDescription.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter ? mod.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  if (showWizard) {
    return (
      <ModuleWizard
        courseId={courseId}
        moduleId={selectedModuleId}
        onClose={() => {
          setShowWizard(false);
          setSelectedModuleId(null);
          refetch();
        }}
      />
    );
  }

  if (selectedModuleForContent) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSelectedModuleForContent(null)}
            className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-gray-300 transition-colors"
          >
            ← Back to Modules
          </button>
          <div>
            <h2 className="text-xl font-bold text-white">{selectedModuleForContent.title} - Lessons</h2>
          </div>
        </div>
        <LessonList courseId={courseId} moduleId={selectedModuleForContent._id} />
      </div>
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
              placeholder="Search modules..." 
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
              setSelectedModuleId(null);
              setShowWizard(true);
            }}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-[#ff0064] hover:bg-[#ff0064]/90 rounded-lg text-sm font-medium text-white transition-colors"
          >
            <Plus size={16} />
            Create Module
          </button>
        </div>
      </div>

      {/* Content */}
      {isError ? (
        <div className="p-8 text-center text-red-400 glass-panel rounded-xl">
          Failed to load modules. Please try again.
        </div>
      ) : isLoading ? (
        <div className="space-y-4">
          {[1,2,3].map(i => (
            <div key={i} className="glass-panel rounded-xl h-32 animate-pulse"></div>
          ))}
        </div>
      ) : filteredModules.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-xl">
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
            <Filter size={24} />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">No modules found</h3>
          <p className="text-gray-400 text-sm mb-6 max-w-sm mx-auto">
            {searchTerm || statusFilter 
              ? 'Try adjusting your search or filters.' 
              : 'This course has no modules yet. Create one to get started.'}
          </p>
          {!searchTerm && !statusFilter && (
            <button 
              onClick={() => {
                setSelectedModuleId(null);
                setShowWizard(true);
              }}
              className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Create First Module
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
            items={filteredModules.map(m => m._id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-4">
              {filteredModules.map((module) => (
                <ModuleCard 
                  key={module._id} 
                  module={module} 
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

export default ModuleList;
