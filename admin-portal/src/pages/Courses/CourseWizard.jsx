import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, CheckCircle, Save, Info, AlertTriangle, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { courseService } from '../../services/course.service';
import { moduleService } from '../../services/module.service';
import TipTapEditor from '../../components/ui/TipTapEditor';
import MediaUploader from '../../components/ui/MediaUploader';
import ModuleList from './components/ModuleList/ModuleList';

const SECTIONS = [
  'Basic Information', 
  'Modules',
  'Resources',
  'Review & Publish'
];

const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

const CourseWizard = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const courseId = id;

  const [currentSection, setCurrentSection] = useState(0);
  const [saveStatus, setSaveStatus] = useState('Saved'); // 'Saving...', 'Saved', 'Error'
  const [lastSaved, setLastSaved] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState('');

  const [selectedPdfFile, setSelectedPdfFile] = useState(null);
  const [resourceTitle, setResourceTitle] = useState('');
  const [isUploadingResource, setIsUploadingResource] = useState(false);

  const handleUploadPDF = async () => {
    if (!selectedPdfFile) return;
    setIsUploadingResource(true);
    try {
      const res = await courseService.uploadPDF(courseId, selectedPdfFile, resourceTitle);
      if (res.data?.success) {
        toast.success("PDF uploaded successfully");
        setResourceTitle('');
        setSelectedPdfFile(null);
        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) fileInput.value = '';
        refetch();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to upload PDF");
    } finally {
      setIsUploadingResource(false);
    }
  };

  const handleDeletePDF = async (resourceId) => {
    if (!window.confirm("Are you sure you want to delete this PDF resource? This action cannot be undone.")) return;
    try {
      const res = await courseService.deletePDF(courseId, resourceId);
      if (res.data?.success) {
        toast.success("PDF resource deleted successfully");
        refetch();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete PDF resource");
    }
  };

  const handleToggleDownload = async (resourceId, newStatus) => {
    try {
      const res = await courseService.updatePDFPermission(courseId, resourceId, newStatus);
      if (res.data?.success) {
        toast.success("Download permission updated");
        refetch();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update permission");
    }
  };
  
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    shortDescription: '',
    description: '',
    category: 'Uncategorized',
    difficulty: 'intermediate',
    language: 'English',
    instructor: 'SMVEN Faculty',
    price: 0,
    tags: '',
    learningOutcomes: '',
    prerequisites: '',
    status: 'draft',
    media: { thumbnail: '', banner: '', previewVideo: '', previewImage: '' },
    settings: { 
      visibility: 'public', 
      accessType: 'lifetime',
      expiryDate: '',
      featured: false,
      certificateEnabled: true, 
      estimatedDuration: '' 
    }
  });

  const pendingSaveRef = useRef(false);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (pendingSaveRef.current) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  const { data: courseData, isLoading } = useQuery({
    queryKey: ['course', courseId],
    queryFn: () => courseService.getCourse(courseId).then(res => res.data.course),
    enabled: !!courseId,
    refetchOnWindowFocus: false,
  });

  const { data: modulesData } = useQuery({
    queryKey: ['modules', courseId],
    queryFn: () => moduleService.getModules(courseId).then(res => res.data),
    enabled: !!courseId,
  });

  useEffect(() => {
    if (courseData) {
      setFormData({
        ...courseData,
        tags: courseData.tags?.join(', ') || '',
        learningOutcomes: courseData.learningOutcomes?.join('\n') || '',
        prerequisites: courseData.prerequisites?.join('\n') || '',
        status: courseData.status || 'draft',
        media: courseData.media || { thumbnail: '', banner: '', previewVideo: '', previewImage: '' },
        settings: {
          visibility: courseData.settings?.visibility || 'public',
          accessType: courseData.settings?.accessType || 'lifetime',
          expiryDate: courseData.settings?.expiryDate ? new Date(courseData.settings.expiryDate).toISOString().split('T')[0] : '',
          featured: courseData.settings?.featured || false,
          certificateEnabled: courseData.settings?.certificateEnabled ?? true,
          estimatedDuration: courseData.settings?.estimatedDuration || '',
        }
      });
    }
  }, [courseData]);

  const updateMutation = useMutation({
    mutationFn: async (data) => {
      const res = await courseService.updateCourse(courseId, data);
      if (thumbnailFile) {
        try {
          const uploadRes = await courseService.uploadThumbnail(courseId, thumbnailFile);
          if (uploadRes.data?.success) {
            setThumbnailFile(null);
            setThumbnailPreview('');
          }
        } catch (err) {
          toast.error('Course details saved, but thumbnail upload failed. Please try again.');
          throw err;
        }
      }
      return res;
    },
    onMutate: () => {
      setSaveStatus('Saving...');
      pendingSaveRef.current = true;
    },
    onSuccess: () => {
      setSaveStatus('Saved');
      setLastSaved(new Date());
      pendingSaveRef.current = false;
      queryClient.invalidateQueries(['course', courseId]);
    },
    onError: () => {
      setSaveStatus('Error');
      pendingSaveRef.current = false;
    }
  });

  const debouncedSave = useCallback(
    (() => {
      let timer;
      return (dataToSave) => {
        clearTimeout(timer);
        timer = setTimeout(() => {
          if (courseId) {
            updateMutation.mutate(dataToSave);
          }
        }, 2000);
      };
    })(),
    [courseId]
  );

  const handleInputChange = (field, value) => {
    const newData = { ...formData, [field]: value };
    if (field === 'title') {
      newData.slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }
    setFormData(newData);
    formatAndSave(newData);
  };

  const handleNestedChange = (parent, field, value) => {
    const newData = {
      ...formData,
      [parent]: {
        ...formData[parent],
        [field]: value
      }
    };
    setFormData(newData);
    formatAndSave(newData);
  };

  const formatAndSave = (data) => {
    const dataForBackend = { ...data };
    if (typeof data.tags === 'string') dataForBackend.tags = data.tags.split(',').map(s => s.trim()).filter(Boolean);
    if (typeof data.learningOutcomes === 'string') dataForBackend.learningOutcomes = data.learningOutcomes.split('\n').map(s => s.trim()).filter(Boolean);
    if (typeof data.prerequisites === 'string') dataForBackend.prerequisites = data.prerequisites.split('\n').map(s => s.trim()).filter(Boolean);
    
    if (dataForBackend.settings?.accessType === 'lifetime' || !dataForBackend.settings?.expiryDate) {
      dataForBackend.settings.expiryDate = null;
    }

    pendingSaveRef.current = true;
    setSaveStatus('Saving...');
    debouncedSave(dataForBackend);
  };

  const handlePublish = async () => {
    try {
      await courseService.updateStatus(courseId, 'published');
      handleInputChange('status', 'published');
      toast.success('Course published successfully!');
      queryClient.invalidateQueries(['courses']);
      navigate('/courses');
    } catch (error) {
      toast.error('Failed to publish course');
    }
  };

  const handleNavigateBack = () => {
    if (pendingSaveRef.current) {
      if (window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
        navigate('/courses');
      }
    } else {
      navigate('/courses');
    }
  };

  const hasModules = modulesData?.modules?.length > 0;
  const isPublishReady = formData.title?.trim().length >= 2 && formData.media?.thumbnail && hasModules;

  if (isLoading) return <div className="p-8 text-center text-gray-400">Loading course...</div>;

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-black text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 px-6 border-b border-white/10 shrink-0 bg-[#0a0a0a]">
        <div className="flex items-center gap-4">
          <button onClick={handleNavigateBack} className="p-2 text-gray-400 hover:text-white bg-white/5 rounded-lg transition-colors">
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white line-clamp-1">{formData.title || 'Untitled Course'}</h1>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-sm">
            {saveStatus === 'Saving...' ? (
              <span className="text-yellow-400 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></span> Saving...</span>
            ) : saveStatus === 'Error' ? (
              <span className="text-red-400 flex items-center gap-1"><AlertTriangle size={14}/> Error saving</span>
            ) : (
              <span className="text-gray-400 flex items-center gap-1"><Check size={14} className="text-green-500" /> Saved {lastSaved && `(${lastSaved.toLocaleTimeString()})`}</span>
            )}
          </div>
          <button 
            onClick={() => setCurrentSection(3)} 
            className="px-5 py-2 bg-gradient-to-r from-[#ff0064] to-[#8b5cf6] hover:opacity-90 rounded-lg text-sm font-medium text-white transition-opacity shadow-[0_0_15px_rgba(255,0,100,0.3)]"
          >
            Review & Publish
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Persistent Sidebar */}
        <div className="w-64 border-r border-white/10 p-6 overflow-y-auto hidden md:block shrink-0 bg-[#0a0a0a]">
          <div className="space-y-2">
            {SECTIONS.map((section, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSection(idx)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-all text-left ${
                  currentSection === idx 
                    ? 'bg-[#ff0064]/10 text-[#ff4ecd] border border-[#ff0064]/30 shadow-sm' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                {section}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 scrollbar-hide">
          <div className="max-w-3xl mx-auto pb-24">
            
            {/* 1. Basic Info */}
            {currentSection === 0 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">Basic Information</h2>
                  <p className="text-gray-400 text-sm">Provide the foundational details of your course.</p>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Course Title *</label>
                    <input 
                      type="text" 
                      value={formData.title} 
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#ff0064] transition-colors"
                      placeholder="e.g. Complete Web Development Bootcamp"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Short Description</label>
                    <textarea 
                      rows={2}
                      value={formData.shortDescription} 
                      onChange={(e) => handleInputChange('shortDescription', e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#ff0064] transition-colors"
                      placeholder="A brief summary for course cards..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Full Description</label>
                    <div className="border border-white/10 rounded-lg overflow-hidden bg-black/40 focus-within:border-[#ff0064] transition-colors">
                      <TipTapEditor 
                        value={formData.description}
                        onChange={(val) => handleInputChange('description', val)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                      <select 
                        value={formData.category} 
                        onChange={(e) => handleInputChange('category', e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#ff0064] transition-colors appearance-none"
                      >
                        <option value="Uncategorized">Uncategorized</option>
                        <option value="Programming">Programming</option>
                        <option value="Design">Design</option>
                        <option value="Business">Business</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Difficulty</label>
                      <select 
                        value={formData.difficulty} 
                        onChange={(e) => handleInputChange('difficulty', e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#ff0064] transition-colors appearance-none"
                      >
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Language</label>
                      <select 
                        value={formData.language} 
                        onChange={(e) => handleInputChange('language', e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#ff0064] transition-colors appearance-none"
                      >
                        <option value="English">English</option>
                        <option value="Spanish">Spanish</option>
                        <option value="French">French</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Instructor</label>
                      <input 
                        type="text" 
                        value={formData.instructor} 
                        onChange={(e) => handleInputChange('instructor', e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#ff0064] transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-6 pt-4">
                    <h3 className="text-lg font-bold text-white">Course Media</h3>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Course Thumbnail *</label>
                      <p className="text-xs text-gray-500 mb-3">Appears on course cards and catalog. 1280x720px recommended.</p>
                      <MediaUploader 
                        value={thumbnailPreview || formData.media?.thumbnail || ""}
                        onFileSelect={(file) => {
                          setThumbnailFile(file);
                          const previewUrl = URL.createObjectURL(file);
                          setThumbnailPreview(previewUrl);
                          // Trigger form auto-save so it uploads right away in background
                          formatAndSave(formData);
                        }}
                        onChange={(url) => {
                          if (url === "") {
                            setThumbnailFile(null);
                            setThumbnailPreview("");
                            handleNestedChange('media', 'thumbnail', '');
                          }
                        }}
                        label="Upload Thumbnail"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Course Banner</label>
                      <p className="text-xs text-gray-500 mb-3">Appears at the top of the course detail page.</p>
                      <MediaUploader 
                        value={formData.media.banner}
                        onChange={(url) => handleNestedChange('media', 'banner', url)}
                        label="Upload Banner"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. Modules */}
            {currentSection === 1 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">Modules</h2>
                  <p className="text-gray-400 text-sm">Manage course modules and lessons.</p>
                </div>
                <ModuleList courseId={courseId} />
              </div>
            )}

            {/* 3. Resources */}
            {currentSection === 2 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">Course Resources</h2>
                  <p className="text-gray-400 text-sm">Upload PDF documents and materials for this course.</p>
                </div>

                {/* Upload Form */}
                <div className="glass-panel rounded-xl p-6">
                  <h3 className="text-lg font-bold text-white mb-4">Upload PDF Resource</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Resource Title</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Lecture Notes, Course Syllabus" 
                        value={resourceTitle}
                        onChange={(e) => setResourceTitle(e.target.value)}
                        className="w-full bg-[#141414] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#ff0064] text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Select PDF File *</label>
                      <input 
                        type="file" 
                        accept="application/pdf"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file && file.type !== "application/pdf") {
                            toast.error("Please select a valid PDF file");
                            e.target.value = null;
                            setSelectedPdfFile(null);
                          } else {
                            setSelectedPdfFile(file);
                            if (file && !resourceTitle) {
                              setResourceTitle(file.name.replace(/\.[^/.]+$/, ""));
                            }
                          }
                        }}
                        className="w-full bg-[#141414] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#ff0064] text-sm file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-white/10 file:text-white hover:file:bg-white/20 file:cursor-pointer"
                      />
                      <p className="text-xs text-gray-500 mt-1">Maximum file size: 50MB</p>
                    </div>

                    <button 
                      onClick={handleUploadPDF}
                      disabled={isUploadingResource || !selectedPdfFile}
                      className="px-5 py-2.5 bg-gradient-to-r from-[#ff0064] to-[#8b5cf6] hover:opacity-90 rounded-lg text-sm font-medium text-white transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(255,0,100,0.3)]"
                    >
                      {isUploadingResource ? 'Uploading...' : 'Upload PDF'}
                    </button>
                  </div>
                </div>

                {/* Uploaded List */}
                <div className="glass-panel rounded-xl p-6">
                  <h3 className="text-lg font-bold text-white mb-4">Uploaded PDF Materials</h3>
                  
                  {!(courseData?.data?.resources?.pdfs?.length > 0) ? (
                    <div className="text-center py-8 text-gray-500 text-sm">
                      No PDF materials uploaded for this course yet.
                    </div>
                  ) : (
                    <div className="divide-y divide-white/5">
                      {courseData.data.resources.pdfs.map((pdf) => (
                        <div key={pdf._id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                          <div className="overflow-hidden flex-1">
                            <h4 className="text-white font-medium text-sm truncate">{pdf.title}</h4>
                            <p className="text-gray-400 text-xs truncate mt-0.5">{pdf.fileName} ({formatBytes(pdf.size)})</p>
                            <p className="text-gray-500 text-[10px] mt-0.5">Uploaded {new Date(pdf.createdAt).toLocaleDateString()}</p>
                          </div>

                          {/* Toggle Switch */}
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-xs text-gray-400">Allow Download:</span>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input 
                                type="checkbox" 
                                checked={pdf.allowDownload !== false}
                                onChange={() => handleToggleDownload(pdf._id, pdf.allowDownload === false)}
                                className="sr-only peer" 
                              />
                              <div className="w-8 h-4.5 bg-gray-600 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-[#ff0064]"></div>
                            </label>
                          </div>
                          
                          <button 
                            onClick={() => handleDeletePDF(pdf._id)}
                            className="px-3 py-1 text-xs font-medium text-red-400 border border-red-500/30 hover:bg-red-500/10 rounded-md transition-colors shrink-0"
                          >
                            Delete
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 4. Review & Publish */}
            {currentSection === 3 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">Review & Publish</h2>
                  <p className="text-gray-400 text-sm">Check the requirements before making this course live.</p>
                </div>
                
                <div className="glass-panel rounded-xl p-6 mb-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Publishing Checklist</h3>
                  <ul className="space-y-4">
                    <li className="flex items-center gap-3">
                      <CheckCircle size={18} className={formData.title?.trim().length >= 2 ? 'text-green-500' : 'text-gray-600'} />
                      <span className={formData.title?.trim().length >= 2 ? 'text-gray-300' : 'text-gray-500'}>Course Title provided</span>
                    </li>

                    <li className="flex items-center gap-3">
                      <CheckCircle size={18} className={formData.media?.thumbnail ? 'text-green-500' : 'text-gray-600'} />
                      <span className={formData.media?.thumbnail ? 'text-gray-300' : 'text-gray-500'}>Thumbnail uploaded</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle size={18} className={hasModules ? 'text-green-500' : 'text-gray-600'} />
                      <span className={hasModules ? 'text-gray-300' : 'text-gray-500'}>At least one Module added (Add via Modules tab)</span>
                    </li>
                  </ul>
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={handleNavigateBack}
                    className="flex-1 py-3 px-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-medium text-white transition-colors"
                  >
                    Save Draft & Exit
                  </button>
                  <button 
                    onClick={handlePublish}
                    disabled={!isPublishReady}
                    className="flex-1 py-3 px-4 bg-gradient-to-r from-[#ff0064] to-[#8b5cf6] hover:opacity-90 rounded-xl font-bold text-white shadow-[0_0_20px_rgba(255,0,100,0.3)] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {!isPublishReady ? 'Complete required fields' : 'Publish Course'}
                  </button>
                </div>
              </div>
            )}
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseWizard;
