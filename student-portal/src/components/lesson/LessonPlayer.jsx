import React, { useState, useEffect } from 'react';
import { Loader2, Sparkles, AlertTriangle, RefreshCw } from 'lucide-react';
import VideoPlayer from './VideoPlayer';
import YouTubePlayer from './YouTubePlayer';
import courseService from '../../services/course.service';

export const LessonPlayer = ({
  lesson = {},
  videoUrl,
  title = 'Lesson Video Lecture',
}) => {
  const [videoData, setVideoData] = useState(null); // { provider, videoId, url }
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let active = true;

    const loadVideo = async () => {
      setIsLoading(true);
      setHasError(false);

      try {
        const courseId = lesson.courseId;
        const lessonId = lesson._id || lesson.id;
        if (!courseId || !lessonId) {
          throw new Error('Missing course or lesson ID');
        }

        const response = await courseService.getLessonVideoPlayUrl(courseId, lessonId);
        if (active) {
          if (response?.success && response.video) {
            setVideoData(response.video);
            setIsLoading(false);
          } else {
            throw new Error('Failed to get video play details');
          }
        }
      } catch (err) {
        console.warn('Error fetching play details, attempting fallback:', err);
        if (active) {
          const localUrl = videoUrl || lesson?.video?.url || '';
          if (localUrl) {
            const isYt = localUrl.includes('youtube.com') || localUrl.includes('youtu.be');
            let ytId = '';
            if (isYt) {
              const match = localUrl.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/);
              ytId = (match && match[2] && match[2].length === 11) ? match[2] : '';
            }
            setVideoData({
              provider: isYt ? 'youtube' : 'direct_url',
              url: localUrl,
              videoId: ytId
            });
            setIsLoading(false);
          } else {
            setHasError(true);
            setIsLoading(false);
          }
        }
      }
    };

    loadVideo();

    return () => {
      active = false;
    };
  }, [videoUrl, lesson?.video?.url, lesson?._id, lesson?.id, lesson?.courseId]);

  const handleRetry = () => {
    setHasError(false);
    setIsLoading(true);
    setVideoData(null);
  };

  if (isLoading) {
    return (
      <div className="relative w-full aspect-video rounded-2xl glass-panel border border-white/15 overflow-hidden bg-[#070a0e] flex flex-col items-center justify-center space-y-3 animate-pulse">
        <Loader2 size={36} className="text-pink-400 animate-spin" />
        <div className="flex items-center gap-2 text-xs font-mono text-gray-300">
          <Sparkles size={14} className="text-pink-400" />
          <span>Generating Secure Playback URL...</span>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="relative w-full aspect-video rounded-2xl glass-panel border border-white/15 overflow-hidden bg-[#0b0f14] flex flex-col items-center justify-center p-6 text-center space-y-3">
        <div className="p-3 rounded-full bg-red-500/10 border border-red-500/20 text-red-400">
          <AlertTriangle size={32} />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-white">Unable to load secure video</h4>
          <p className="text-xs text-gray-400">
            Please make sure you have access to this course or try again.
          </p>
        </div>
        <button
          onClick={handleRetry}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-pink-500 hover:bg-pink-400 text-xs font-bold text-white shadow-lg shadow-pink-500/20 transition-all active:scale-95 cursor-pointer"
        >
          <RefreshCw size={14} />
          <span>Retry Loading</span>
        </button>
      </div>
    );
  }

  const initialPosition = typeof lesson.progress?.lastPosition === 'number' ? lesson.progress.lastPosition : 0;

  if (videoData?.provider === 'youtube') {
    return (
      <YouTubePlayer
        courseId={lesson.courseId}
        lessonId={lesson._id || lesson.id}
        videoId={videoData.videoId}
        title={title}
        initialPosition={initialPosition}
      />
    );
  }

  // HTML5 Video Player for MP4 / Direct / R2 Video Files
  return (
    <VideoPlayer
      lesson={lesson}
      videoUrl={videoData?.url || ''}
      lessonId={lesson._id || lesson.id}
      duration={lesson.duration || lesson.video?.duration}
      title={title}
      initialPosition={initialPosition}
    />
  );
};


export default LessonPlayer;
