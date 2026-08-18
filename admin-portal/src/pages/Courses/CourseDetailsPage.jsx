import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Layout, BookOpen, Users, Settings as SettingsIcon } from 'lucide-react';
import { courseService } from '../../services/course.service';
import CourseWizard from './CourseWizard';
import ModuleList from './components/ModuleList/ModuleList';

const CourseDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('modules'); // Default to modules as requested

  const { data: courseData, isLoading, isError } = useQuery({
    queryKey: ['course', id],
    queryFn: async () => {
      const res = await courseService.getCourse(id);
      return res.data;
    }
  });

  const course = courseData?.course;

  if (isLoading) {
    return <div className="p-8 text-center text-gray-400">Loading course details...</div>;
  }

  if (isError || !course) {
    return (
      <div className="p-8 text-center text-red-400 glass-panel rounded-xl">
        Failed to load course details.
        <button onClick={() => navigate('/courses')} className="mt-4 block mx-auto text-white underline">
          Go back to courses
        </button>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Layout, disabled: false },
    { id: 'modules', label: 'Modules', icon: BookOpen, disabled: false },
    { id: 'students', label: 'Students', icon: Users, disabled: true },
    { id: 'settings', label: 'Settings', icon: SettingsIcon, disabled: true },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/courses" className="p-2 text-gray-400 hover:text-white bg-black/40 border border-white/10 rounded-lg hover:border-[#ff0064] transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            {course.title}
            <span className="px-2 py-1 text-[10px] font-semibold rounded-md border border-white/10 bg-black/50 text-white backdrop-blur-md uppercase">
              {course.status}
            </span>
          </h1>
          <p className="text-gray-400 text-sm mt-1">Manage course content and settings</p>
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
              {tab.disabled && <span className="text-[9px] bg-white/10 px-1.5 py-0.5 rounded text-gray-400 ml-1">Phase 4</span>}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'overview' && (
          <div className="glass-panel p-6 rounded-xl">
            {/* For now, just show placeholder or embed wizard. Since Wizard expects full page, we might just put a link or simplify it here. */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Course Overview</h2>
              <button 
                onClick={() => navigate(`/courses/edit/${id}`)}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Edit Details in Wizard
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4 text-gray-300">
              <div><strong>Slug:</strong> {course.slug}</div>
              <div><strong>Category:</strong> {course.category}</div>
              <div><strong>Difficulty:</strong> {course.difficulty}</div>
              <div><strong>Price:</strong> ${course.price}</div>
            </div>
            <div className="mt-4 text-gray-400 text-sm">
              <p>{course.description}</p>
            </div>
          </div>
        )}

        {activeTab === 'modules' && (
          <ModuleList courseId={id} />
        )}
      </div>
    </div>
  );
};

export default CourseDetailsPage;
