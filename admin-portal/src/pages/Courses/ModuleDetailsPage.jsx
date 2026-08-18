import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Layout, FileText, Settings as SettingsIcon, BarChart3, Clock, PlaySquare, FileCheck } from 'lucide-react';
import { moduleService } from '../../services/module.service';
import { formatDuration } from '../../utils/formatters';
import LessonList from './components/LessonList/LessonList';

const ModuleDetailsPage = () => {
  const { id: courseId, moduleId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('content'); // Default to content (lessons)

  const { data: moduleData, isLoading, isError } = useQuery({
    queryKey: ['module', moduleId],
    queryFn: async () => {
      const res = await moduleService.getModule(moduleId);
      return res.data;
    }
  });

  const module = moduleData?.module;

  if (isLoading) {
    return <div className="p-8 text-center text-gray-400 animate-pulse">Loading module details...</div>;
  }

  if (isError || !module) {
    return (
      <div className="p-8 text-center text-red-400 glass-panel rounded-xl">
        Failed to load module details.
        <button onClick={() => navigate(`/courses/${courseId}`)} className="mt-4 block mx-auto text-white underline">
          Go back to course
        </button>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Layout, disabled: false },
    { id: 'content', label: 'Content', icon: FileText, disabled: false },
    { id: 'settings', label: 'Settings', icon: SettingsIcon, disabled: true },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to={`/courses/${courseId}`} className="p-2 text-gray-400 hover:text-white bg-black/40 border border-white/10 rounded-lg hover:border-[#ff0064] transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            {module.title}
            <span className="px-2 py-1 text-[10px] font-semibold rounded-md border border-white/10 bg-black/50 text-white backdrop-blur-md uppercase">
              {module.status}
            </span>
          </h1>
          <p className="text-gray-400 text-sm mt-1">Manage module content, lessons, and resources</p>
        </div>
        <div>
          <button 
            onClick={() => navigate(`/courses/${courseId}/modules/edit/${moduleId}`)}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium transition-colors border border-white/10"
          >
            Edit Module
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-xl flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
            <FileText size={20} />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Total Lessons</p>
            <p className="text-xl font-bold text-white">{module.stats?.lessons || 0}</p>
          </div>
        </div>
        <div className="glass-panel p-4 rounded-xl flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center text-red-400">
            <PlaySquare size={20} />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Videos</p>
            <p className="text-xl font-bold text-white">{module.stats?.videos || 0}</p>
          </div>
        </div>
        <div className="glass-panel p-4 rounded-xl flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">
            <FileCheck size={20} />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Resources</p>
            <p className="text-xl font-bold text-white">{module.stats?.resources || 0}</p>
          </div>
        </div>
        <div className="glass-panel p-4 rounded-xl flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Clock size={20} />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Total Duration</p>
            <p className="text-xl font-bold text-white whitespace-nowrap">{formatDuration(module.stats?.totalDuration)}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10 overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              disabled={tab.disabled}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 border-b-2 font-medium text-sm transition-colors ${
                tab.disabled
                  ? 'text-gray-600 border-transparent cursor-not-allowed opacity-50'
                  : isActive
                  ? 'text-[#ff0064] border-[#ff0064]'
                  : 'text-gray-400 hover:text-white border-transparent hover:border-white/20'
              }`}
            >
              <Icon size={16} />
              {tab.label}
              {tab.disabled && <span className="text-[9px] bg-white/10 px-1.5 py-0.5 rounded text-gray-400 ml-1">Coming Soon</span>}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'overview' && (
          <div className="glass-panel p-6 rounded-xl space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-1">Module Title</h3>
                <p className="text-white text-lg">{module.title}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-1">Slug</h3>
                <p className="text-white text-lg">{module.slug}</p>
              </div>
            </div>
            
            {module.shortDescription && (
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-2">Short Description</h3>
                <p className="text-gray-300 bg-white/5 p-4 rounded-lg">{module.shortDescription}</p>
              </div>
            )}

            {module.description && (
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-2">Full Description</h3>
                <div className="text-gray-300 bg-white/5 p-4 rounded-lg prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: module.description }}></div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'content' && (
          <LessonList courseId={courseId} moduleId={moduleId} />
        )}
      </div>
    </div>
  );
};

export default ModuleDetailsPage;
