import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ArrowLeft, ArrowRight, Save, CheckCircle, Video, FileText, Settings, AlignLeft, 
  PlaySquare, PlayCircle, X, UploadCloud, Trash2, RefreshCw, FileVideo, Loader2, Check, AlertCircle 
} from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

import { lessonService } from '../../../../services/lesson.service';
import VideoProviderSelector from './VideoProviderSelector';
import NotesManager from './NotesManager';
import ResourcesManager from './ResourcesManager';

const STEPS = [
  { id: 1, title: 'Basic Info', icon: AlignLeft },
  { id: 2, title: 'Content', icon: Video },
  { id: 3, title: 'Notes & Resources', icon: FileText },
  { id: 4, title: 'Settings', icon: Settings },
  { id: 5, title: 'Review', icon: CheckCircle },
];

const formatBytes = (bytes) => {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const formatSeconds = (secs) => {
  if (!secs) return '0s';
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  if (m === 0) return `${s}s`;
  return `${m}m ${s}s`;
};

const LessonWizard = ({ courseId: propCourseId, moduleId: propModuleId, lessonId: propLessonId, onClose }) => {
  const { id: routeCourseId, moduleId: routeModuleId, lessonId: routeLessonId } = useParams();
  const courseId = propCourseId || routeCourseId;
  const moduleId = propModuleId || routeModuleId;
  const lessonId = propLessonId || routeLessonId;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditing = Boolean(lessonId);

  const [currentStep, setCurrentStep] = useState(1);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedBytes, setUploadedBytes] = useState(0);
  const [completedPartsCount, setCompletedPartsCount] = useState(0);
  const [totalPartsCount, setTotalPartsCount] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('idle'); // 'idle' | 'uploading' | 'success' | 'error'
  const [uploadError, setUploadError] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);
  const cancelRef = useRef(null);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    shortDescription: '',
    description: '',
    lessonType: 'video',
    video: {
      provider: 'youtube',
      url: '',
      duration: 0,
      thumbnail: '',
      videoKey: '',
      videoFileName: '',
      videoSize: 0,
      videoMimeType: '',
    },
    notes: {
      title: '',
      content: '',
      pdf: '',
      markdown: '',
      downloadable: true,
    },
    resources: [],
    settings: {
      allowPreview: false,
    },
    status: 'draft',
    visibility: 'public',
  });

  // Fetch lesson data if editing
  const { data: lessonData, isLoading } = useQuery({
    queryKey: ['lesson', lessonId],
    queryFn: async () => {
      const res = await lessonService.getLesson(lessonId);
      return res.data;
    },
    enabled: isEditing,
  });

  useEffect(() => {
    if (isEditing && lessonData?.lesson) {
      setFormData((prev) => ({ ...prev, ...lessonData.lesson }));
    }
  }, [isEditing, lessonData]);

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data) => lessonService.createLesson(moduleId, data),
    onSuccess: () => {
      toast.success('Lesson created successfully');
      queryClient.invalidateQueries(['lessons', moduleId]);
      queryClient.invalidateQueries(['module', moduleId]);
      queryClient.invalidateQueries(['course', courseId]);
      queryClient.invalidateQueries(['dashboard']);
      if (onClose) {
        onClose();
      } else {
        navigate(`/courses/edit/${courseId}`);
      }
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to create lesson');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data) => lessonService.updateLesson(lessonId || data._id || data.id, data),
    onSuccess: () => {
      toast.success('Lesson updated successfully');
      queryClient.invalidateQueries(['lessons', moduleId]);
      queryClient.invalidateQueries(['module', moduleId]);
      queryClient.invalidateQueries(['course', courseId]);
      queryClient.invalidateQueries(['dashboard']);
      if (onClose) {
        onClose();
      } else {
        navigate(`/courses/edit/${courseId}`);
      }
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to update lesson');
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleVideoChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      video: { ...prev.video, [field]: value },
    }));
  };

  const validateStep = (step) => {
    switch (step) {
      case 1:
        if (!formData.title.trim()) {
          toast.error('Title is required');
          return false;
        }
        if (!formData.slug.trim()) {
          toast.error('Slug is required');
          return false;
        }
        return true;
      case 2:
        if (formData.lessonType === 'video') {
          if (!formData.video.provider) {
            toast.error('Please select a video provider');
            return false;
          }
          if (formData.video.provider === 'youtube') {
            if (!formData.video.url) {
              toast.error('Video URL is required');
              return false;
            }
            if (!formData.video.url.includes('youtube.com') && !formData.video.url.includes('youtu.be')) {
              toast.error('Please enter a valid YouTube URL');
              return false;
            }
          }
          if (formData.video.provider === 'r2') {
            if (!formData.video.videoKey) {
              toast.error('Please upload a video to Cloudflare R2 before proceeding');
              return false;
            }
          }
          if (formData.video.provider === 'direct') {
            if (!formData.video.url) {
              toast.error('Direct video URL is required');
              return false;
            }
          }
        }
        return true;
      default:
        return true;
    }
  };

  const handleNext = async () => {
    if (validateStep(currentStep)) {
      if (currentStep === 1 && !isEditing && !formData._id) {
        // Auto-save new lesson as draft to get a lessonId for video upload
        try {
          const payload = { ...formData, status: 'draft' };
          const res = await lessonService.createLesson(moduleId, payload);
          if (res.data?.success && res.data?.lesson) {
            const newLesson = res.data.lesson;
            setFormData((prev) => ({ ...prev, ...newLesson }));
            toast.success('Basic info saved as draft');
          }
        } catch (err) {
          toast.error(err.response?.data?.message || 'Failed to initialize lesson');
          return;
        }
      }
      setCurrentStep((prev) => Math.min(prev + 1, 5));
    }
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSave = (status = formData.status) => {
    if (validateStep(1) && validateStep(2)) {
      const payload = { ...formData, status };
      const currentLessonId = lessonId || formData._id;
      if (currentLessonId) {
        updateMutation.mutate(payload);
      } else {
        createMutation.mutate(payload);
      }
    }
  };

  const CHUNK_SIZE = 10 * 1024 * 1024; // 10 MB per chunk
  const CONCURRENCY = 4; // Controlled parallel upload concurrency (3-5 workers)

  const handleStartUpload = async (file) => {
    if (!file) return;

    // Validate size (max 2 GB)
    const MAX_SIZE = 2 * 1024 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      toast.error('File size exceeds the 2 GB limit');
      return;
    }

    // Validate extension
    const ext = file.name.split('.').pop().toLowerCase();
    if (!['mp4', 'webm', 'mov'].includes(ext)) {
      toast.error('Only MP4, WebM, and MOV video formats are supported');
      return;
    }

    const currentLessonId = lessonId || formData._id;
    if (!currentLessonId) {
      toast.error('Lesson must be saved as draft before uploading video');
      return;
    }

    setUploadFile(file);
    setUploadProgress(0);
    setUploadedBytes(0);
    setCompletedPartsCount(0);
    setUploadStatus('uploading');
    setUploadError('');

    const fileName = file.name;
    const fileSize = file.size;
    const contentType = file.type || 'video/mp4';

    // 1. Get video duration using HTML5 video metadata before upload
    let duration = 0;
    try {
      duration = await new Promise((resolve) => {
        const videoEl = document.createElement('video');
        videoEl.preload = 'metadata';
        videoEl.muted = true;
        videoEl.playsInline = true;
        videoEl.src = URL.createObjectURL(file);
        videoEl.onloadedmetadata = () => {
          const src = videoEl.src;
          videoEl.src = '';
          videoEl.load();
          URL.revokeObjectURL(src);
          resolve(Math.round(videoEl.duration) || 0);
        };
        videoEl.onerror = () => {
          const src = videoEl.src;
          videoEl.src = '';
          videoEl.load();
          URL.revokeObjectURL(src);
          resolve(0);
        };
      });
    } catch (e) {
      console.warn('Could not determine video duration:', e);
    }

    let uploadId = '';
    let key = '';
    let completed = false;

    try {
      // 2. Initialize upload in backend
      const initRes = await lessonService.initializeVideoUpload(courseId, currentLessonId, {
        fileName,
        fileSize,
        contentType,
      });

      if (!initRes.data || !initRes.data.success) {
        throw new Error(initRes.data?.message || 'Failed to initialize video upload');
      }

      uploadId = initRes.data.uploadId;
      key = initRes.data.key;

      const totalChunks = Math.ceil(fileSize / CHUNK_SIZE);
      setTotalPartsCount(totalChunks);

      const parts = new Array(totalChunks);
      const chunkLoaded = new Array(totalChunks).fill(0);
      let isCancelled = false;

      cancelRef.current = async () => {
        isCancelled = true;
        setUploadStatus('idle');
        setUploadFile(null);
        setUploadProgress(0);
        setUploadedBytes(0);
        setCompletedPartsCount(0);
        
        try {
          await lessonService.abortVideoUpload(courseId, currentLessonId, { uploadId, key });
          toast.success('Upload cancelled');
        } catch (err) {
          console.error('Failed to abort upload:', err);
        }
      };

      const updateProgressState = () => {
        if (isCancelled) return;
        const totalLoaded = chunkLoaded.reduce((acc, curr) => acc + curr, 0);
        const percent = Math.min(Math.round((totalLoaded / fileSize) * 100), 99);
        setUploadProgress(percent);
        setUploadedBytes(totalLoaded);
      };

      // Function to upload a single chunk with retry capability
      const uploadChunk = async (index) => {
        if (isCancelled) return;
        const partNumber = index + 1;
        const start = index * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, fileSize);
        const chunk = file.slice(start, end);

        const partRes = await lessonService.getUploadPartUrl(courseId, currentLessonId, {
          uploadId,
          key,
          partNumber,
          contentType: file.type || 'video/mp4',
        });

        if (!partRes.data || !partRes.data.success || !partRes.data.url) {
          throw new Error(partRes.data?.message || `Failed to get upload URL for part ${partNumber}`);
        }

        const { url } = partRes.data;

        let attempt = 0;
        const maxAttempts = 3;
        let uploadSuccess = false;

        while (attempt < maxAttempts && !uploadSuccess) {
          if (isCancelled) return;
          try {
            const response = await axios.put(url, chunk, {
              headers: {
                'Content-Type': file.type || 'video/mp4'
              },
              onUploadProgress: (progressEvent) => {
                if (isCancelled) return;
                chunkLoaded[index] = progressEvent.loaded;
                updateProgressState();
              },
            });

            const etag = response.headers.etag || response.headers.ETag;
            if (!etag) throw new Error('No ETag header returned from R2');

            parts[index] = {
              PartNumber: partNumber,
              ETag: etag.replace(/"/g, ''),
            };
            uploadSuccess = true;
            setCompletedPartsCount((prev) => prev + 1);
          } catch (err) {
            attempt++;
            if (attempt >= maxAttempts) throw err;
            await new Promise((r) => setTimeout(r, 1000 * attempt));
          }
        }
      };

      // 3. Controlled Parallel Upload Pool (3-5 active workers)
      let currentIndex = 0;
      const workerCount = Math.min(CONCURRENCY, totalChunks);
      const workers = Array.from({ length: workerCount }).map(async () => {
        while (currentIndex < totalChunks && !isCancelled) {
          const taskIndex = currentIndex++;
          await uploadChunk(taskIndex);
        }
      });

      await Promise.all(workers);

      if (isCancelled) return;

      // 4. Complete upload
      setUploadProgress(99); // Finalizing
      const completeRes = await lessonService.completeVideoUpload(courseId, currentLessonId, {
        uploadId,
        key,
        parts,
        fileName,
        fileSize,
        contentType,
        duration,
      });

      if (!completeRes.data || !completeRes.data.success) {
        throw new Error(completeRes.data?.message || 'Failed to complete video upload');
      }

      completed = true;
      setUploadStatus('success');
      setUploadProgress(100);
      toast.success('Video uploaded successfully to R2');

      // Update form data with new R2 video details
      setFormData((prev) => ({
        ...prev,
        video: {
          ...prev.video,
          provider: 'r2',
          videoKey: key,
          videoFileName: fileName,
          videoSize: fileSize,
          videoMimeType: contentType,
          duration: duration || prev.video.duration,
          url: '', // Clear URL
        },
      }));
    } catch (err) {
      if (err.message === 'Upload cancelled') return;
      console.error('Video upload error:', err);
      setUploadStatus('error');
      setUploadError(err.response?.data?.message || err.message || 'Video upload failed');
      toast.error(err.response?.data?.message || err.message || 'Video upload failed');

      // Attempt to clean up R2 upload
      if (uploadId && key && !completed) {
        try {
          await lessonService.abortVideoUpload(courseId, currentLessonId, { uploadId, key });
        } catch (abortErr) {
          console.error('Failed to abort upload after error:', abortErr);
        }
      }
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleStartUpload(e.dataTransfer.files[0]);
    }
  };

  // Generate thumbnail for YouTube
  useEffect(() => {
    if (formData.video.provider === 'youtube' && formData.video.url) {
      try {
        let videoId = '';
        if (formData.video.url.includes('youtube.com/watch')) {
          videoId = new URL(formData.video.url).searchParams.get('v');
        } else if (formData.video.url.includes('youtu.be/')) {
          videoId = formData.video.url.split('youtu.be/')[1].split('?')[0];
        }
        
        if (videoId && !formData.video.thumbnail) {
          handleVideoChange('thumbnail', `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`);
        }
      } catch (e) {
        // Ignore parsing errors
      }
    }
  }, [formData.video.url, formData.video.provider]);

  if (isLoading) {
    return <div className="p-8 text-center text-gray-400">Loading lesson data...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        {onClose ? (
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white bg-black/40 border border-white/10 rounded-lg hover:border-[#ff0064] transition-colors">
            <ArrowLeft size={20} />
          </button>
        ) : (
          <Link to={`/courses/edit/${courseId}`} className="p-2 text-gray-400 hover:text-white bg-black/40 border border-white/10 rounded-lg hover:border-[#ff0064] transition-colors">
            <ArrowLeft size={20} />
          </Link>
        )}
        <div>
          <h1 className="text-2xl font-bold text-white">
            {isEditing ? 'Edit Lesson' : 'Create New Lesson'}
          </h1>
          <p className="text-gray-400 text-sm mt-1">Configure lesson content, resources, and settings.</p>
        </div>
      </div>

      {/* Progress Stepper */}
      <div className="flex justify-between relative px-5">
        <div className="absolute left-10 right-10 top-5 -translate-y-1/2 h-1 bg-white/5 rounded-full z-0 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-[#ff0064] to-purple-500 rounded-full transition-all duration-300"
            style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
          ></div>
        </div>
        
        {STEPS.map((step) => {
          const Icon = step.icon;
          const isActive = step.id === currentStep;
          const isCompleted = step.id < currentStep;
          
          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center gap-2">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isActive ? 'bg-[#ff0064] text-white shadow-[0_0_15px_rgba(255,0,100,0.5)]' : 
                  isCompleted ? 'bg-purple-500 text-white' : 'bg-black/60 border-2 border-white/10 text-gray-500'
                }`}
              >
                <Icon size={18} />
              </div>
              <span className={`text-xs font-medium ${isActive || isCompleted ? 'text-white' : 'text-gray-500'}`}>
                {step.title}
              </span>
            </div>
          );
        })}
      </div>

      {/* Form Content */}
      <div className="glass-panel p-8 rounded-2xl border border-white/10 bg-black/40 shadow-2xl relative overflow-hidden">
        {/* Step 1: Basic Info */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-xl font-bold text-white mb-6">Basic Information</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Lesson Title *</label>
                <input 
                  type="text" 
                  name="title"
                  value={formData.title}
                  onChange={(e) => {
                    handleChange(e);
                    if (!isEditing) {
                      setFormData(prev => ({ ...prev, slug: e.target.value.toLowerCase().replace(/[\s_]+/g, '-').replace(/[^\w-]+/g, '') }));
                    }
                  }}
                  className="w-full bg-black/60 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#ff0064] transition-colors"
                  placeholder="e.g., Introduction to React Context"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Slug *</label>
                <input 
                  type="text" 
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  className="w-full bg-black/60 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#ff0064] transition-colors font-mono text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Short Description</label>
                <textarea 
                  name="shortDescription"
                  value={formData.shortDescription}
                  onChange={handleChange}
                  rows={2}
                  className="w-full bg-black/60 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#ff0064] transition-colors resize-none"
                  placeholder="Brief overview of the lesson..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Full Description</label>
                <textarea 
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={5}
                  className="w-full bg-black/60 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#ff0064] transition-colors resize-none"
                  placeholder="Detailed description or HTML content..."
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Content */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-xl font-bold text-white mb-6">Lesson Content</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-3">Lesson Type</label>
              <div className="flex gap-4">
                {[
                  { type: 'video', label: 'Video Lesson' },
                  { type: 'resource', label: 'PDF or Notes' }
                ].map(({ type, label }) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, lessonType: type }))}
                    className={`px-6 py-3 rounded-lg border font-medium transition-all ${
                      formData.lessonType === type 
                        ? 'bg-[#ff0064]/20 border-[#ff0064] text-[#ff0064]' 
                        : 'bg-black/40 border-white/10 text-gray-400 hover:border-white/30'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {formData.lessonType === 'video' && (
              <div className="mt-8 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-3">Video Provider</label>
                  <VideoProviderSelector 
                    value={formData.video.provider} 
                    onChange={(val) => handleVideoChange('provider', val)} 
                  />
                </div>

                {/* Provider: YouTube or Direct */}
                {(formData.video.provider === 'youtube' || formData.video.provider === 'direct') && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">
                          {formData.video.provider === 'youtube' ? 'YouTube Video URL *' : 'Direct Video URL *'}
                        </label>
                        <input 
                          type="text" 
                          value={formData.video.url}
                          onChange={(e) => handleVideoChange('url', e.target.value)}
                          className="w-full bg-black/60 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#ff0064]"
                          placeholder={formData.video.provider === 'youtube' ? 'https://www.youtube.com/watch?v=...' : 'https://cdn.example.com/video.mp4'}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Duration (seconds)</label>
                        <input 
                          type="number" 
                          value={formData.video.duration}
                          onChange={(e) => handleVideoChange('duration', parseInt(e.target.value) || 0)}
                          className="w-full bg-black/60 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#ff0064]"
                          placeholder="e.g. 600"
                        />
                      </div>
                    </div>

                    {/* Video Preview */}
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Thumbnail Preview</label>
                      <div className="aspect-video bg-black/40 border border-white/10 rounded-lg overflow-hidden flex items-center justify-center relative">
                        {formData.video.thumbnail ? (
                          <img 
                            src={formData.video.thumbnail} 
                            alt="Thumbnail Preview" 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="text-center p-4">
                            <PlayCircle size={32} className="mx-auto text-gray-600 mb-2" />
                            <p className="text-xs text-gray-500">Thumbnail preview</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Provider: Cloudflare R2 Upload UI */}
                {formData.video.provider === 'r2' && (
                  <div className="space-y-6">
                    {/* Hidden File Input */}
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      accept="video/mp4,video/webm,video/quicktime,video/mov"
                      onChange={(e) => e.target.files?.[0] && handleStartUpload(e.target.files[0])}
                      className="hidden"
                    />

                    {/* Case 1: Uploading State */}
                    {uploadStatus === 'uploading' && (
                      <div className="p-6 rounded-2xl border border-orange-500/30 bg-orange-500/5 space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400">
                              <Loader2 size={24} className="animate-spin" />
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-white truncate max-w-xs">{uploadFile?.name}</h4>
                              <p className="text-xs text-gray-400 font-mono mt-0.5">
                                {formatBytes(uploadedBytes)} / {formatBytes(uploadFile?.size || 0)}
                                {totalPartsCount > 0 && ` • Part ${Math.min(completedPartsCount + 1, totalPartsCount)} / ${totalPartsCount}`}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => cancelRef.current?.()}
                            className="px-3 py-1.5 rounded-lg border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold transition-all"
                          >
                            Cancel Upload
                          </button>
                        </div>

                        {/* Progress Bar */}
                        <div className="space-y-1.5">
                          <div className="h-2.5 w-full bg-white/10 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 rounded-full transition-all duration-200"
                              style={{ width: `${uploadProgress}%` }}
                            />
                          </div>
                          <div className="flex justify-between items-center text-[11px] font-mono text-gray-400">
                            <span>Parallel Upload to Cloudflare R2...</span>
                            <span className="font-bold text-orange-400">{uploadProgress}%</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Case 2: R2 Video Already Attached */}
                    {uploadStatus !== 'uploading' && formData.video.videoKey && (
                      <div className="p-5 sm:p-6 rounded-2xl border border-green-500/30 bg-green-500/5 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-green-500/15">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="p-2.5 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 shrink-0">
                              <CheckCircle size={24} />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="text-sm font-bold text-white truncate max-w-sm sm:max-w-md">
                                  {formData.video.videoFileName || 'R2 Video Object'}
                                </h4>
                                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-green-500/20 text-green-400 border border-green-500/30 whitespace-nowrap shrink-0">
                                  Cloudflare R2
                                </span>
                              </div>
                              <p className="text-[11px] text-gray-500 font-mono truncate max-w-sm sm:max-w-md mt-0.5">
                                Key: {formData.video.videoKey}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all cursor-pointer"
                            >
                              <RefreshCw size={14} />
                              <span>Replace Video</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setFormData(prev => ({
                                ...prev,
                                video: {
                                  ...prev.video,
                                  videoKey: '',
                                  videoFileName: '',
                                  videoSize: 0,
                                  videoMimeType: '',
                                  duration: 0,
                                }
                              }))}
                              className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 transition-all cursor-pointer"
                              title="Remove Video"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-green-500/15 flex items-center justify-between text-xs font-mono text-gray-400">
                          <span>File Size: <strong className="text-white font-bold">{formatBytes(formData.video.videoSize)}</strong></span>
                        </div>
                      </div>
                    )}

                    {/* Case 3: Empty Dropzone */}
                    {uploadStatus !== 'uploading' && !formData.video.videoKey && (
                      <div 
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`p-10 rounded-2xl border-2 border-dashed transition-all cursor-pointer text-center flex flex-col items-center justify-center space-y-4 ${
                          isDragOver 
                            ? 'border-orange-500 bg-orange-500/10 scale-[1.01]' 
                            : 'border-white/15 bg-black/40 hover:border-white/30 hover:bg-white/[0.02]'
                        }`}
                      >
                        <div className="w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center">
                          <UploadCloud size={32} />
                        </div>
                        <div className="space-y-1 max-w-sm">
                          <h3 className="text-base font-bold text-white">Drag & Drop Video Here</h3>
                          <p className="text-xs text-gray-400">or click to browse from your computer</p>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] text-gray-400 font-mono">
                          <FileVideo size={13} className="text-orange-400" />
                          <span>MP4 • WebM • MOV • Max 2 GB</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Step 3: Notes & Resources */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-xl font-bold text-white mb-6">Notes & Resources</h2>
            
            <NotesManager 
              courseId={courseId}
              notes={formData.notes} 
              setNotes={(notes) => setFormData(prev => ({ ...prev, notes }))} 
            />
          </div>
        )}

        {/* Step 4: Settings */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-xl font-bold text-white mb-6">Lesson Settings</h2>
            
            <div className="max-w-md space-y-4">
              <div className="flex items-center justify-between p-4 glass-panel rounded-xl border border-white/5 bg-white/5">
                <div>
                  <h4 className="text-sm font-bold text-white">Preview Access</h4>
                  <p className="text-xs text-gray-400 mt-1">Allow non-enrolled users to view this lesson.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={formData.settings.allowPreview}
                    onChange={(e) => setFormData(prev => ({ ...prev, settings: { ...prev.settings, allowPreview: e.target.checked } }))}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#ff0064]"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 glass-panel rounded-xl border border-white/5 bg-white/5 opacity-50">
                <div>
                  <h4 className="text-sm font-bold text-white">Sequential Unlock</h4>
                  <p className="text-xs text-gray-400 mt-1">Student must complete previous lesson first (Future).</p>
                </div>
                <input type="checkbox" disabled className="bg-gray-700" />
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Review */}
        {currentStep === 5 && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-xl font-bold text-white mb-6">Review & Publish</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-400">Title</h3>
                  <p className="text-lg text-white font-semibold">{formData.title}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-400">Type</h3>
                  <p className="text-white">
                    {formData.lessonType === 'video' ? 'Video Lesson' : formData.lessonType === 'text' ? 'Text Lesson' : 'PDF or Notes'}
                  </p>
                </div>
                {formData.lessonType === 'video' && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-400">Video Source</h3>
                    <p className="text-white capitalize">{formData.video.provider} ({formData.video.duration}s)</p>
                  </div>
                )}
                <div>
                  <h3 className="text-sm font-medium text-gray-400">Attachments</h3>
                  <p className="text-white">
                    {formData.notes.pdf ? 'PDF Notes attached' : 'No PDF attached'}
                  </p>
                </div>
              </div>
              
              <div className="bg-white/5 p-6 rounded-xl border border-white/10 flex flex-col items-center justify-center text-center">
                <CheckCircle size={48} className="text-green-400 mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Ready to save!</h3>
                <p className="text-sm text-gray-400 mb-6">You can save this as a draft or publish it immediately.</p>
                
                <div className="flex flex-col w-full gap-3">
                  <button 
                    onClick={() => handleSave('published')}
                    disabled={createMutation.isPending || updateMutation.isPending || uploadStatus === 'uploading'}
                    className="w-full py-3 bg-[#ff0064] hover:bg-[#ff0064]/90 text-white rounded-lg font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {createMutation.isPending || updateMutation.isPending ? 'Saving...' : 'Publish Lesson'}
                  </button>
                  <button 
                    onClick={() => handleSave('draft')}
                    disabled={createMutation.isPending || updateMutation.isPending || uploadStatus === 'uploading'}
                    className="w-full py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Save as Draft
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center pt-4">
        <button
          onClick={currentStep === 1 ? (onClose || (() => navigate(`/courses/edit/${courseId}`))) : handlePrev}
          disabled={uploadStatus === 'uploading'}
          className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors bg-white/10 hover:bg-white/20 text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowLeft size={18} /> Back
        </button>
        
        {currentStep < 5 && (
          <button
            onClick={handleNext}
            disabled={uploadStatus === 'uploading'}
            className="flex items-center gap-2 px-6 py-3 bg-[#ff0064] hover:bg-[#ff0064]/90 text-white rounded-lg font-medium transition-colors shadow-[0_0_15px_rgba(255,0,100,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploadStatus === 'uploading' ? 'Uploading Video...' : 'Next Step'} <ArrowRight size={18} />
          </button>
        )}
      </div>
    </div>
  );
};

export default LessonWizard;
