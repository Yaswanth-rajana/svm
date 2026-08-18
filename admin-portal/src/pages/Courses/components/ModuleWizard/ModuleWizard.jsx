import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Check, ChevronRight, ChevronLeft, Save, UploadCloud } from 'lucide-react';
import toast from 'react-hot-toast';
import { moduleService } from '../../../../services/module.service';
import RichTextEditor from '../../../../components/ui/RichTextEditor';
import ObjectivesEditor from './ObjectivesEditor';

const STEPS = [
  { id: 1, title: 'Basic Information' },
  { id: 2, title: 'Settings' },
  { id: 3, title: 'Review & Publish' }
];

const ModuleWizard = ({ courseId: propCourseId, moduleId: propModuleId, onClose }) => {
  const { id: routeCourseId, moduleId: routeModuleId } = useParams();
  const courseId = propCourseId || routeCourseId;
  const moduleId = propModuleId || routeModuleId;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditMode = Boolean(moduleId);

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    shortDescription: '',
    description: '',
    learningObjectives: [],
    settings: {
      sequentialUnlock: false,
      allowPreview: false,
      estimatedDuration: 0,
      thumbnail: '',
      banner: ''
    },
    status: 'draft'
  });

  // Fetch module if edit mode
  const { data, isLoading } = useQuery({
    queryKey: ['module', moduleId],
    queryFn: async () => {
      // We don't have a specific getModuleById endpoint in service yet, but we can fetch all and find, or just add one.
      // Wait, let's add it to service or just use the list. Actually, we should add getModule to module.service.js.
      // Since I didn't add it, let's fetch course modules and find it.
      const res = await moduleService.getModules(courseId);
      return res.data;
    },
    enabled: isEditMode
  });

  useEffect(() => {
    if (isEditMode && data?.modules) {
      const mod = data.modules.find(m => m._id === moduleId);
      if (mod) {
        setFormData({
          title: mod.title || '',
          slug: mod.slug || '',
          shortDescription: mod.shortDescription || '',
          description: mod.description || '',
          learningObjectives: mod.learningObjectives || [],
          settings: {
            sequentialUnlock: mod.settings?.sequentialUnlock || false,
            allowPreview: mod.settings?.allowPreview || false,
            estimatedDuration: mod.settings?.estimatedDuration || 0,
            thumbnail: mod.settings?.thumbnail || '',
            banner: mod.settings?.banner || ''
          },
          status: mod.status || 'draft'
        });
      }
    }
  }, [data, isEditMode, moduleId]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSettingChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      settings: { ...prev.settings, [field]: value }
    }));
  };

  // Mutations
  const saveMutation = useMutation({
    mutationFn: (dataToSave) => {
      if (isEditMode) {
        return moduleService.updateModule(moduleId, dataToSave);
      }
      return moduleService.createModule(courseId, dataToSave);
    },
    onSuccess: () => {
      toast.success(`Module ${isEditMode ? 'updated' : 'created'} successfully`);
      queryClient.invalidateQueries(['modules', courseId]);
      if (onClose) {
        onClose();
      } else {
        navigate(`/courses/edit/${courseId}`);
      }
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to save module');
      setIsSubmitting(false);
    }
  });

  const handleSave = (statusOverride) => {
    setIsSubmitting(true);
    const dataToSave = { ...formData };
    if (statusOverride) {
      dataToSave.status = statusOverride;
    }
    saveMutation.mutate(dataToSave);
  };

  const nextStep = () => {
    if (currentStep === 1 && !formData.title.trim()) {
      toast.error('Title is required');
      return;
    }
    setCurrentStep(prev => Math.min(prev + 1, STEPS.length));
  };

  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  if (isLoading) {
    return <div className="p-8 text-center text-gray-400">Loading module details...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">{isEditMode ? 'Edit Module' : 'Create Module'}</h1>
          <p className="text-gray-400 text-sm mt-1">Configure module content and settings</p>
        </div>
        <button 
          onClick={onClose || (() => navigate(`/courses/edit/${courseId}`))}
          className="text-gray-400 hover:text-white text-sm underline transition-colors"
        >
          Cancel
        </button>
      </div>

      {/* Progress Steps */}
      <div className="glass-panel p-4 rounded-xl flex items-center justify-between relative">
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/10 -z-10 -translate-y-1/2"></div>
        <div className="absolute top-1/2 left-0 h-0.5 bg-gradient-to-r from-[#ff0064] to-[#8b5cf6] -z-10 -translate-y-1/2 transition-all duration-300" style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}></div>
        
        {STEPS.map((step) => {
          const isActive = step.id === currentStep;
          const isCompleted = step.id < currentStep;
          
          return (
            <div key={step.id} className="flex flex-col items-center gap-2 bg-[#0b0f14] px-2 relative z-10">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                isActive ? 'bg-[#ff0064] text-white shadow-[0_0_10px_rgba(255,0,100,0.5)]' :
                isCompleted ? 'bg-[#8b5cf6] text-white' : 'bg-white/10 text-gray-500'
              }`}>
                {isCompleted ? <Check size={16} /> : step.id}
              </div>
              <span className={`text-xs font-medium hidden md:block ${isActive ? 'text-white' : isCompleted ? 'text-gray-300' : 'text-gray-500'}`}>
                {step.title}
              </span>
            </div>
          );
        })}
      </div>

      {/* Step Content */}
      <div className="glass-panel p-6 rounded-xl min-h-[400px]">
        
        {/* STEP 1: Basic Info */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-in fade-in">
            <h2 className="text-xl font-bold text-white mb-4">Basic Information</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Module Title <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  placeholder="e.g. Introduction to Networking"
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-[#ff0064]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Slug</label>
                <input 
                  type="text" 
                  value={formData.slug}
                  onChange={(e) => handleChange('slug', e.target.value)}
                  placeholder="Leave blank to auto-generate"
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-[#ff0064]"
                />
                <p className="text-xs text-gray-500 mt-1">Unique URL identifier for this module.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Short Description</label>
                <textarea 
                  value={formData.shortDescription}
                  onChange={(e) => handleChange('shortDescription', e.target.value)}
                  placeholder="A brief summary of what this module covers..."
                  rows={2}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-[#ff0064]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Full Description</label>
                <RichTextEditor 
                  value={formData.description} 
                  onChange={(val) => handleChange('description', val)} 
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Settings */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-in fade-in">
            <h2 className="text-xl font-bold text-white mb-4">Settings</h2>
            
            <div className="max-w-xl">
              <div className="space-y-6">

                <div className="flex items-center justify-between p-4 bg-black/20 border border-white/5 rounded-lg">
                  <div>
                    <h4 className="text-sm font-medium text-white">Sequential Unlock</h4>
                    <p className="text-xs text-gray-400">Students must complete previous lessons to unlock</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer"
                      checked={formData.settings.sequentialUnlock}
                      onChange={(e) => handleSettingChange('sequentialUnlock', e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#ff0064]"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-black/20 border border-white/5 rounded-lg">
                  <div>
                    <h4 className="text-sm font-medium text-white">Allow Preview</h4>
                    <p className="text-xs text-gray-400">Allow non-enrolled students to view this module</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer"
                      checked={formData.settings.allowPreview}
                      onChange={(e) => handleSettingChange('allowPreview', e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#ff0064]"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Review */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-in fade-in">
            <h2 className="text-xl font-bold text-white mb-4">Review & Publish</h2>
            
            <div className="bg-black/40 border border-white/10 rounded-xl p-6 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white">{formData.title}</h3>
                <p className="text-sm text-gray-400 mt-1">{formData.shortDescription}</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 py-4 border-y border-white/10">
                <div>
                  <div className="text-xs text-gray-500 mb-1">Status</div>
                  <div className="text-sm font-medium text-white capitalize">{formData.status}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Sequential</div>
                  <div className="text-sm font-medium text-white">{formData.settings.sequentialUnlock ? 'Yes' : 'No'}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Preview</div>
                  <div className="text-sm font-medium text-white">{formData.settings.allowPreview ? 'Allowed' : 'Disabled'}</div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-white mb-2">Objectives ({formData.learningObjectives.length})</h4>
                <ul className="list-disc pl-5 space-y-1 text-sm text-gray-300">
                  {formData.learningObjectives.map((obj, i) => <li key={i}>{obj}</li>)}
                  {formData.learningObjectives.length === 0 && <li className="text-gray-500 italic">No objectives provided.</li>}
                </ul>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Footer Controls */}
      <div className="flex items-center justify-between">
        <button 
          onClick={currentStep === 1 ? (onClose || (() => navigate(`/courses/edit/${courseId}`))) : prevStep}
          disabled={isSubmitting}
          className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white transition-colors"
        >
          <ChevronLeft size={18} />
          Back
        </button>

        <div className="flex items-center gap-3">
          {currentStep === STEPS.length ? (
            <>
              <button 
                onClick={() => handleSave('draft')}
                disabled={isSubmitting}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                Save Draft
              </button>
              <button 
                onClick={() => handleSave('published')}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-[#ff0064] to-[#8b5cf6] hover:opacity-90 rounded-lg text-sm font-medium text-white transition-opacity shadow-[0_0_20px_rgba(255,0,100,0.3)] disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span className="animate-pulse">Publishing...</span>
                ) : (
                  <>
                    <Save size={16} />
                    Publish Module
                  </>
                )}
              </button>
            </>
          ) : (
            <button 
              onClick={nextStep}
              className="flex items-center gap-2 px-6 py-2 bg-white text-black hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
            >
              Continue
              <ChevronRight size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModuleWizard;
