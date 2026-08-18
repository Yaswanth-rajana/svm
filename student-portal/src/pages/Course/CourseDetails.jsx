import { useMemo, useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Layers, FileText } from 'lucide-react';
import courseService from '../../services/course.service';

const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};
import useCourseDetail from '../../hooks/useCourseDetail';
import useCourseProgress from '../../hooks/useCourseProgress';
import SkeletonPage from '../../components/common/SkeletonLoader';
import ErrorMessage from '../../components/common/ErrorMessage';
import EmptyState from '../../components/common/EmptyState';
import CourseHeader from '../../components/course/CourseHeader';
import CourseProgress from '../../components/course/CourseProgress';
import ModuleAccordion from '../../components/course/ModuleAccordion';
import LessonWorkspace from '../../components/course/LessonWorkspace';

export const CourseDetails = () => {
  const { courseId } = useParams();
  const [searchParams] = useSearchParams();
  const paramLessonId = searchParams.get('lessonId');
  const paramModuleId = searchParams.get('moduleId');

  const { course, modules: rawModules, progress: rawProgress, loading, error, refetch } = useCourseDetail(courseId);
  const { data: progressData } = useCourseProgress(courseId);

  const [isResourcesOpen, setIsResourcesOpen] = useState(false);

  const handleDownloadPDF = async (resourceId, fileName) => {
    try {
      const res = await courseService.getCoursePDFDownloadUrl(courseId, resourceId);
      if (res.success && res.url) {
        const link = document.createElement('a');
        link.href = res.url;
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (err) {
      console.error("Failed to download PDF resource:", err);
      alert("Failed to retrieve secure download link. Please try again.");
    }
  };

  const handleViewPDF = async (resourceId) => {
    try {
      const res = await courseService.getCoursePDFViewUrl(courseId, resourceId);
      if (res.success && res.url) {
        window.open(res.url, "_blank", "noopener,noreferrer");
      }
    } catch (err) {
      console.error("Failed to view PDF resource:", err);
      alert("Failed to retrieve secure view link. Please try again.");
    }
  };

  // Merge authoritative progressData into modules
  const modules = useMemo(() => {
    if (!progressData?.lessons || progressData.lessons.length === 0) {
      return rawModules;
    }
    const progMap = new Map();
    progressData.lessons.forEach((l) => progMap.set(l.lessonId?.toString(), l));

    return rawModules.map((m) => ({
      ...m,
      lessons: m.lessons?.map((l) => {
        const p = progMap.get(l._id?.toString());
        if (!p) return l;
        return {
          ...l,
          progress: {
            ...l.progress,
            completed: p.completed,
            lastPosition: p.lastPosition,
            highestPosition: p.highestPosition,
            duration: p.duration,
            progressPercentage: p.progressPercentage,
            completedAt: p.completedAt,
          },
        };
      }),
    }));
  }, [rawModules, progressData]);

  // Compute aggregated curriculum statistics from authoritative progressData or fallback modules
  const totalLessons = useMemo(() => {
    if (progressData && typeof progressData.totalLessons === 'number') {
      return progressData.totalLessons;
    }
    return modules.reduce((acc, m) => acc + (m.lessons?.length || 0), 0);
  }, [modules, progressData]);

  const completedLessonsCount = useMemo(() => {
    if (progressData && typeof progressData.completedLessons === 'number') {
      return progressData.completedLessons;
    }
    return modules.reduce((acc, m) => {
      const done = m.lessons?.filter((l) => l.progress?.completed).length || 0;
      return acc + done;
    }, 0);
  }, [modules, progressData]);

  const progress = useMemo(() => {
    if (progressData && typeof progressData.percentage === 'number') {
      return progressData.percentage;
    }
    return totalLessons > 0 ? Math.round((completedLessonsCount / totalLessons) * 100) : (rawProgress || 0);
  }, [progressData, totalLessons, completedLessonsCount, rawProgress]);

  // Find active / next lesson to resume
  const activeLessonInfo = useMemo(() => {
    for (let mIdx = 0; mIdx < modules.length; mIdx++) {
      const mod = modules[mIdx];
      const lessons = mod.lessons || [];
      for (let lIdx = 0; lIdx < lessons.length; lIdx++) {
        const les = lessons[lIdx];
        if (!les.progress?.completed) {
          return {
            moduleIndex: mIdx,
            lessonId: les._id,
          };
        }
      }
    }
    return null;
  }, [modules]);

  // Accordion state management
  const [expandedModuleIndex, setExpandedModuleIndex] = useState(0);

  // Track the user-selected lesson to show in the workspace (initialize from localStorage if available)
  const [selectedLessonId, setSelectedLessonId] = useState(() => {
    return localStorage.getItem(`last_lesson_${courseId}`) || null;
  });

  // Auto-expand the module containing the selected lesson
  useEffect(() => {
    if (selectedLessonId && modules.length > 0) {
      const modIndex = modules.findIndex(m => 
        m.lessons?.some(l => l._id === selectedLessonId)
      );
      if (modIndex !== -1) {
        setExpandedModuleIndex(modIndex);
      }
    } else if (activeLessonInfo) {
      setExpandedModuleIndex(activeLessonInfo.moduleIndex);
    } else if (modules.length > 0) {
      setExpandedModuleIndex(0);
    }
  }, [selectedLessonId, modules, activeLessonInfo]);

  // Persist selected lesson to localStorage on change
  useEffect(() => {
    if (selectedLessonId) {
      localStorage.setItem(`last_lesson_${courseId}`, selectedLessonId);
    }
  }, [selectedLessonId, courseId]);

  // Initialize selected lesson on first load if not set in localStorage
  useEffect(() => {
    if (!selectedLessonId) {
      const savedLessonId = localStorage.getItem(`last_lesson_${courseId}`);
      if (savedLessonId) {
        setSelectedLessonId(savedLessonId);
      } else if (activeLessonInfo) {
        setSelectedLessonId(activeLessonInfo.lessonId);
      } else if (modules.length > 0 && modules[0].lessons?.length > 0) {
        setSelectedLessonId(modules[0].lessons[0]._id);
      }
    }
  }, [activeLessonInfo, modules, selectedLessonId, courseId]);

  const toggleModule = (index) => {
    setExpandedModuleIndex(expandedModuleIndex === index ? -1 : index);
  };

  if (loading) {
    return <SkeletonPage />;
  }

  if (error || !course) {
    return (
      <ErrorMessage
        title="Course Not Found"
        message={error || "The requested course could not be found or you do not have portal access."}
        onRetry={refetch}
      />
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto animate-fade-in flex flex-col lg:flex-row gap-6 items-start h-full pb-12">
      {/* Left Column: Course Navigation */}
      <div className="w-full lg:w-[380px] shrink-0 flex flex-col space-y-5">
        <div className="p-5 rounded-2xl glass-panel border border-white/10">
          <CourseHeader course={course} />
          <div className="pt-2">
            <CourseProgress 
              progress={progress} 
              completedLessonsCount={completedLessonsCount} 
              totalLessons={totalLessons} 
            />
          </div>
        </div>

        {/* Modules List (Accordion) */}
        <div className="space-y-4 flex-1 overflow-y-auto">
          {modules.length === 0 ? (
            <EmptyState
              icon={Layers}
              title="No Modules Found"
              description="Modules for this course are currently being published."
            />
          ) : (
            <div>
              {modules.map((module, index) => (
                <ModuleAccordion 
                  key={module._id || index} 
                  module={module} 
                  index={index} 
                  isExpanded={expandedModuleIndex === index}
                  onToggle={() => toggleModule(index)}
                  currentLessonId={selectedLessonId}
                  onSelectLesson={setSelectedLessonId}
                />
              ))}
            </div>
          )}
        </div>


        {/* Resources Accordion */}
        {course.resources?.pdfs?.length > 0 && (
          <div className="p-4 rounded-2xl glass-panel border border-white/10 overflow-hidden shrink-0">
            <button 
              onClick={() => setIsResourcesOpen(!isResourcesOpen)}
              className="w-full flex items-center justify-between text-left text-sm font-semibold text-white"
            >
              <span className="flex items-center gap-2">
                <FileText size={16} className="text-[#ff0064]" />
                Course Resources ({course.resources.pdfs.length})
              </span>
              <span className="text-gray-500 text-xs">{isResourcesOpen ? '▲' : '▼'}</span>
            </button>
            
            {isResourcesOpen && (
              <div className="mt-3 space-y-3 pt-3 border-t border-white/5">
                {course.resources.pdfs.map((pdf) => (
                  <div key={pdf._id} className="flex items-center justify-between gap-3 text-xs py-1">
                    <div className="overflow-hidden flex-1">
                      <p className="text-gray-300 font-medium truncate" title={pdf.title}>{pdf.title}</p>
                      <p className="text-gray-500 text-[10px] truncate">{pdf.fileName} ({formatBytes(pdf.size)})</p>
                    </div>
                    
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleViewPDF(pdf._id)}
                        className="px-2.5 py-1 bg-[#ff0064]/10 hover:bg-[#ff0064]/20 border border-[#ff0064]/20 text-[#ff0064] rounded transition-all text-[10px] font-semibold cursor-pointer"
                      >
                        👁 View PDF
                      </button>
                      
                      {pdf.allowDownload !== false ? (
                        <button
                          onClick={() => handleDownloadPDF(pdf._id, pdf.fileName)}
                          className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white border border-white/10 rounded transition-all text-[10px] font-semibold cursor-pointer"
                        >
                          ↓ Download PDF
                        </button>
                      ) : (
                        <span className="px-2.5 py-1 bg-white/5 text-gray-500 border border-white/5 rounded text-[10px] font-semibold flex items-center gap-1">
                          🔒 Download Locked
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Column: Lesson Workspace */}
      <div className="flex-1 w-full min-w-0">
        {selectedLessonId ? (
          <LessonWorkspace lessonId={selectedLessonId} course={course} />
        ) : (
          <div className="h-full flex items-center justify-center p-12 text-gray-400">
            Select a lesson from the left menu to start learning.
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseDetails;

