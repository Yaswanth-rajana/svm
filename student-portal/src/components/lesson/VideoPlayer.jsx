import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  Play,
  Pause,
  Volume2,
  Volume1,
  VolumeX,
  Maximize,
  Minimize,
  Sparkles,
  AlertTriangle,
  RefreshCw,
  Gauge,
  Tv2,
  Loader2,
} from 'lucide-react';
import useStudentProfile from '../../hooks/useStudentProfile';
import courseService from '../../services/course.service';

const DEFAULT_TEST_VIDEO =
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
const FALLBACK_TEST_VIDEO =
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4';

const SPEED_OPTIONS = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];

// Format video timeline duration (e.g. "0:00 / 6:23" or "1:02:10")
const formatTime = (seconds) => {
  if (isNaN(seconds) || seconds === null || seconds < 0) return '0:00';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const WatermarkOverlay = ({ studentName, studentEmail }) => {
  const [position, setPosition] = useState({ top: '15%', left: '15%' });

  useEffect(() => {
    const interval = setInterval(() => {
      const randomTop = Math.floor(Math.random() * 55) + 15; // 15% to 70%
      const randomLeft = Math.floor(Math.random() * 55) + 15; // 15% to 70%
      setPosition({
        top: `${randomTop}%`,
        left: `${randomLeft}%`,
      });
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="absolute pointer-events-none select-none z-10 font-mono text-[10px] md:text-xs text-white/10 uppercase tracking-widest text-left"
      style={{
        top: position.top,
        left: position.left,
        transition: 'all 1s ease-in-out',
        textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
      }}
    >
      <div>{studentName || 'SMVEN STUDENT'}</div>
      <div>{studentEmail || 'student@smven.com'}</div>
      <div className="font-bold">SMVEN</div>
    </div>
  );
};

export const VideoPlayer = ({
  lesson = {},
  videoUrl,
  lessonId,
  duration = 1800,
  title = 'Lesson Video Lecture',
  initialPosition = 0,
  onEnded: onEndedProp,
  onAutoNextToggle,
  autoNextEnabled = true,
}) => {
  const { student } = useStudentProfile();
  const queryClient = useQueryClient();
  const effectiveLessonId = lessonId || lesson?._id || lesson?.id || 'demo_lesson';
  const primarySource = videoUrl || lesson?.video?.url || lesson?.videoUrl || DEFAULT_TEST_VIDEO;

  const [src, setSrc] = useState(primarySource);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1.0);
  const [prevVolume, setPrevVolume] = useState(1.0);
  const [currentTime, setCurrentTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(duration);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);

  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const controlsTimeoutRef = useRef(null);
  const seekBarRef = useRef(null);
  const isHoveringControlsRef = useRef(false);

  const [isDragging, setIsDragging] = useState(false);
  const [hoverProgress, setHoverProgress] = useState(0);
  const [hoverTime, setHoverTime] = useState(0);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipX, setTooltipX] = useState(0);
  const [bufferedPercent, setBufferedPercent] = useState(0);

  // Restore saved playback position:
  // Priority 1: Backend lastPosition (initialPosition)
  // Priority 2: LocalStorage position if backend is 0
  const restoreSavedPosition = useCallback(() => {
    try {
      let resumePos = 0;
      if (typeof initialPosition === 'number' && initialPosition > 0) {
        resumePos = initialPosition;
      } else {
        const saved = localStorage.getItem(`smv_video_pos_${effectiveLessonId}`);
        if (saved) {
          const parsed = parseFloat(saved);
          if (!isNaN(parsed) && parsed > 0) {
            resumePos = parsed;
          }
        }
      }

      if (resumePos > 0 && resumePos < videoDuration - 5 && videoRef.current) {
        videoRef.current.currentTime = resumePos;
        setCurrentTime(resumePos);
      }
    } catch (e) {
      console.warn('Failed to restore playback position:', e);
    }
  }, [effectiveLessonId, videoDuration, initialPosition]);

  // Synchronize R2 buffered percent
  const handleProgressUpdate = useCallback(() => {
    if (videoRef.current && videoDuration) {
      const buffered = videoRef.current.buffered;
      const time = videoRef.current.currentTime;
      let currentBufferedEnd = 0;
      for (let i = 0; i < buffered.length; i++) {
        if (buffered.start(i) <= time && buffered.end(i) >= time) {
          currentBufferedEnd = buffered.end(i);
          break;
        }
      }
      if (currentBufferedEnd === 0 && buffered.length > 0) {
        currentBufferedEnd = buffered.end(buffered.length - 1);
      }
      setBufferedPercent(Math.min(100, (currentBufferedEnd / videoDuration) * 100));
    }
  }, [videoDuration]);

  // Listeners programmatically bound to avoid memory/listener leaks
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onTimeUpdate = () => {
      if (!isDragging) {
        setCurrentTime(video.currentTime);
        handleProgressUpdate();
      }
    };
    const onDurationChange = () => {
      setVideoDuration(video.duration || duration);
    };
    const onLoadedMetadata = () => {
      setIsLoading(false);
      setHasError(false);
      setVideoDuration(video.duration || duration);
      restoreSavedPosition();
      handleProgressUpdate();
    };
    const onWaiting = () => setIsLoading(true);
    const onPlaying = () => {
      setIsLoading(false);
      setIsPlaying(true);
    };
    const onSeeking = () => setIsLoading(true);
    const onSeeked = () => setIsLoading(false);
    const onEnded = () => {
      setIsPlaying(false);
      if (videoRef.current) {
        const dur = videoRef.current.duration || videoDuration;
        const roundedDur = Math.round(dur);
        try {
          localStorage.setItem(`smv_video_pos_${effectiveLessonId}`, roundedDur.toString());
        } catch (e) {}

        const courseId = lesson.courseId;
        if (courseId && effectiveLessonId) {
          courseService
            .updateLessonProgress(courseId, effectiveLessonId, {
              lastPosition: roundedDur,
              duration: roundedDur,
            })
            .then((res) => {
              if (res?.success && res.data?.completedNow) {
                queryClient.invalidateQueries({ queryKey: ['course-progress', courseId] });
                queryClient.invalidateQueries({ queryKey: ['course', courseId] });
                queryClient.invalidateQueries({ queryKey: ['lesson', effectiveLessonId] });
              }
            })
            .catch((err) => console.warn('Failed to update progress on end:', err));
        }
      }
      if (onEndedProp) onEndedProp();
    };
    const onVolumeChange = () => {
      setIsMuted(video.muted);
      setVolume(video.muted ? 0 : video.volume);
    };
    const onRateChange = () => {
      setPlaybackSpeed(video.playbackRate);
    };

    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('durationchange', onDurationChange);
    video.addEventListener('loadedmetadata', onLoadedMetadata);
    video.addEventListener('waiting', onWaiting);
    video.addEventListener('playing', onPlaying);
    video.addEventListener('seeking', onSeeking);
    video.addEventListener('seeked', onSeeked);
    video.addEventListener('ended', onEnded);
    video.addEventListener('volumechange', onVolumeChange);
    video.addEventListener('ratechange', onRateChange);

    return () => {
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('durationchange', onDurationChange);
      video.removeEventListener('loadedmetadata', onLoadedMetadata);
      video.removeEventListener('waiting', onWaiting);
      video.removeEventListener('playing', onPlaying);
      video.removeEventListener('seeking', onSeeking);
      video.removeEventListener('seeked', onSeeked);
      video.removeEventListener('ended', onEnded);
      video.removeEventListener('volumechange', onVolumeChange);
      video.removeEventListener('ratechange', onRateChange);
    };
  }, [duration, isDragging, onEndedProp, restoreSavedPosition, handleProgressUpdate, effectiveLessonId, lesson.courseId, queryClient, videoDuration]);

  // Keep Fullscreen state properly synchronized if Escape is pressed
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Sync state if videoUrl prop changes
  useEffect(() => {
    if (videoUrl || lesson?.video?.url || lesson?.videoUrl) {
      const newSource = videoUrl || lesson?.video?.url || lesson?.videoUrl;
      setSrc(newSource);
      setHasError(false);
      setIsLoading(true);
    }
  }, [videoUrl, lesson?.video?.url, lesson?.videoUrl]);

  // Save playback position every ~5 seconds for MP4 streams
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      if (videoRef.current && currentTime > 0) {
        try {
          const pos = videoRef.current.currentTime;
          const dur = videoRef.current.duration || videoDuration;
          const roundedPos = Math.round(pos);
          const roundedDur = Math.round(dur);

          localStorage.setItem(`smv_video_pos_${effectiveLessonId}`, roundedPos.toString());

          const courseId = lesson.courseId;
          if (courseId && effectiveLessonId && roundedDur > 0) {
            courseService
              .updateLessonProgress(courseId, effectiveLessonId, {
                lastPosition: roundedPos,
                duration: roundedDur,
              })
              .then((res) => {
                if (res?.success && res.data?.completedNow) {
                  queryClient.invalidateQueries({ queryKey: ['course-progress', courseId] });
                  queryClient.invalidateQueries({ queryKey: ['course', courseId] });
                  queryClient.invalidateQueries({ queryKey: ['lesson', effectiveLessonId] });
                }
              })
              .catch((err) => console.warn('Failed to update progress on backend:', err));
          }
        } catch (e) {
          console.warn('Failed to save position:', e);
        }
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [isPlaying, currentTime, effectiveLessonId, lesson.courseId, queryClient, videoDuration]);

  // Safe final progress sync on unmount
  useEffect(() => {
    return () => {
      if (videoRef.current) {
        const pos = videoRef.current.currentTime;
        const dur = videoRef.current.duration || videoDuration;
        if (pos > 0 && dur > 0) {
          const courseId = lesson.courseId;
          if (courseId && effectiveLessonId) {
            courseService
              .updateLessonProgress(courseId, effectiveLessonId, {
                lastPosition: Math.round(pos),
                duration: Math.round(dur),
              })
              .catch((err) => console.warn('Non-blocking unmount progress sync error:', err));
          }
        }
      }
    };
  }, [effectiveLessonId, lesson.courseId, videoDuration]);


  // Keyboard Shortcuts (Space, Arrows, F, M)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          seekRelative(-10);
          break;
        case 'ArrowRight':
          e.preventDefault();
          seekRelative(10);
          break;
        case 'KeyF':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'KeyM':
          e.preventDefault();
          toggleMute();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, isMuted, volume, prevVolume, videoDuration]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play().catch((err) => console.warn('Play error:', err));
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    if (isMuted) {
      videoRef.current.muted = false;
      videoRef.current.volume = prevVolume;
      setVolume(prevVolume);
      setIsMuted(false);
    } else {
      setPrevVolume(volume);
      videoRef.current.muted = true;
      videoRef.current.volume = 0;
      setVolume(0);
      setIsMuted(true);
    }
  };

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    if (!isNaN(val)) {
      setVolume(val);
      if (videoRef.current) {
        videoRef.current.volume = val;
        videoRef.current.muted = val === 0;
      }
      setIsMuted(val === 0);
      if (val > 0) {
        setPrevVolume(val);
      }
    }
  };

  const seekRelative = (seconds) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.min(
      Math.max(0, videoRef.current.currentTime + seconds),
      videoDuration
    );
  };

  const seekToPosition = useCallback((e) => {
    if (!videoRef.current || !seekBarRef.current || isNaN(videoDuration) || videoDuration === 0) return;
    const rect = seekBarRef.current.getBoundingClientRect();
    const clickPos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const newTime = clickPos * videoDuration;
    setCurrentTime(newTime);
    videoRef.current.currentTime = newTime;
  }, [videoDuration]);

  const handlePointerDown = useCallback((e) => {
    if (!videoRef.current || isNaN(videoDuration) || videoDuration === 0) return;
    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
    seekToPosition(e);
  }, [videoDuration, seekToPosition]);

  const handlePointerMoveTimeline = useCallback((e) => {
    if (!seekBarRef.current || isNaN(videoDuration) || videoDuration === 0) return;
    const rect = seekBarRef.current.getBoundingClientRect();
    const hoverPos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setHoverProgress(hoverPos * 100);
    setHoverTime(hoverPos * videoDuration);
    setTooltipX(e.clientX - rect.left);
    setShowTooltip(true);

    if (isDragging) {
      seekToPosition(e);
    }
  }, [videoDuration, isDragging, seekToPosition]);

  const handlePointerLeaveTimeline = useCallback(() => {
    setShowTooltip(false);
  }, []);

  const handlePointerUp = useCallback((e) => {
    if (isDragging) {
      setIsDragging(false);
      e.currentTarget.releasePointerCapture(e.pointerId);
      if (videoRef.current) {
        setCurrentTime(videoRef.current.currentTime);
      }
    }
  }, [isDragging]);

  const handleError = () => {
    setIsLoading(false);
    if (lesson?.video?.provider === 'r2') {
      setHasError(true);
    } else if (src !== FALLBACK_TEST_VIDEO) {
      console.warn('Primary video failed, switching to fallback stream...');
      setSrc(FALLBACK_TEST_VIDEO);
    } else {
      setHasError(true);
    }
  };

  const handleRetry = () => {
    setHasError(false);
    setIsLoading(true);
    setSrc(primarySource);
    if (videoRef.current) {
      videoRef.current.load();
    }
  };

  const handleSpeedChange = (speed) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
    setShowSpeedMenu(false);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const handlePictureInPicture = async () => {
    if (videoRef.current && document.pictureInPictureEnabled) {
      try {
        if (document.pictureInPictureElement) {
          await document.exitPictureInPicture();
        } else {
          await videoRef.current.requestPictureInPicture();
        }
      } catch (err) {
        console.warn('PiP Error:', err);
      }
    }
  };

  // Auto-hiding control timer
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    
    // Don't hide controls if user is hovering over controls, paused, or dragging
    if (isPlaying && !isHoveringControlsRef.current && !isDragging) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  };

  const handleControlsMouseEnter = () => {
    isHoveringControlsRef.current = true;
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    setShowControls(true);
  };

  const handleControlsMouseLeave = () => {
    isHoveringControlsRef.current = false;
    if (isPlaying && !isDragging) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  };

  const progressPercent = videoDuration ? (currentTime / videoDuration) * 100 : 0;
  const volumePercent = isMuted ? 0 : Math.round(volume * 100);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className={`
        relative w-full aspect-video rounded-2xl glass-panel border border-white/15 overflow-hidden
        bg-[#070a0e] group shadow-2xl transition-all duration-300 select-none
        ${isFullscreen ? 'rounded-none border-0' : ''}
      `}
    >
      {/* 1. Loading Shimmer / Buffet / Seeking Overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-30 bg-[#070a0e]/60 flex flex-col items-center justify-center space-y-3 backdrop-blur-[2px]">
          <Loader2 size={36} className="text-pink-400 animate-spin" />
          <div className="flex items-center gap-2 text-xs font-mono text-gray-300">
            <Sparkles size={14} className="text-pink-400" />
            <span>Buffering Video Stream...</span>
          </div>
        </div>
      )}

      {/* 2. Error Card Overlay */}
      {hasError ? (
        <div className="absolute inset-0 z-30 bg-[#0b0f14] flex flex-col items-center justify-center p-6 text-center space-y-3 animate-fade-in">
          <div className="p-3 rounded-full bg-red-500/10 border border-red-500/20 text-red-400">
            <AlertTriangle size={32} />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-white">Unable to load lesson video.</h4>
            <p className="text-xs text-gray-400">
              Please check your network connection or try reloading the stream.
            </p>
          </div>
          <button
            onClick={handleRetry}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-pink-500 hover:bg-pink-400 text-xs font-bold text-white shadow-lg shadow-pink-500/20 transition-all active:scale-95"
          >
            <RefreshCw size={14} />
            <span>Retry Loading</span>
          </button>
        </div>
      ) : (
        /* 3. HTML5 Video Player Element */
        <video
          ref={videoRef}
          src={src}
          className="w-full h-full object-cover cursor-pointer"
          onClick={togglePlay}
          playsInline
        />
      )}

      {/* 4. Watermark Overlay */}
      <WatermarkOverlay studentName={student?.name} studentEmail={student?.email} />

      {/* 5. Ambient Center Play Button Overlay (when paused & not loading) */}
      {!isPlaying && !isLoading && !hasError && (
        <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none bg-black/40 backdrop-blur-[1px]">
          <button
            onClick={togglePlay}
            aria-label="Play Video"
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-pink-500 via-purple-500 to-orange-500 text-white flex items-center justify-center shadow-2xl shadow-pink-500/40 hover:scale-110 active:scale-95 transition-all duration-300 pointer-events-auto cursor-pointer"
          >
            <Play size={32} className="fill-white ml-1" />
          </button>
        </div>
      )}

      {/* 6. YouTube-style Control Bar Overlay */}
      <div
        onMouseEnter={handleControlsMouseEnter}
        onMouseLeave={handleControlsMouseLeave}
        className={`
          absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 
          flex flex-col gap-2.5 z-30 transition-opacity duration-300
          ${showControls || !isPlaying || isDragging ? 'opacity-100' : 'opacity-0 pointer-events-none'}
        `}
      >
        {/* Full-width Seek Bar timeline wrapper */}
        <div
          ref={seekBarRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMoveTimeline}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerLeaveTimeline}
          className="w-full py-2 cursor-pointer relative flex items-center group/timeline select-none"
          style={{ touchAction: 'none' }}
        >
          {/* Tooltip */}
          {showTooltip && (
            <div
              className="absolute bottom-6 px-2 py-1 bg-black/90 border border-white/10 text-white rounded text-[10px] font-mono -translate-x-1/2 pointer-events-none z-50 shadow-md"
              style={{ left: `${tooltipX}px` }}
            >
              {formatTime(hoverTime)}
            </div>
          )}

          {/* Timeline track (expand on hover or drag) */}
          <div
            className={`w-full bg-white/20 rounded-full relative transition-all duration-100 overflow-visible ${
              isDragging || showTooltip ? 'h-1.5' : 'h-1 group-hover/timeline:h-1.5'
            }`}
          >
            {/* Hover preview bar */}
            {showTooltip && (
              <div
                className="absolute inset-y-0 left-0 bg-white/10 pointer-events-none rounded-full"
                style={{ width: `${hoverProgress}%` }}
              />
            )}

            {/* Buffered progress bar */}
            <div
              className="absolute inset-y-0 left-0 bg-white/30 pointer-events-none rounded-full transition-all duration-300"
              style={{ width: `${bufferedPercent}%` }}
            />

            {/* Played progress bar */}
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-pink-500 to-purple-500 pointer-events-none rounded-full"
              style={{ width: `${progressPercent}%` }}
            />

            {/* Draggable seek thumb */}
            <div
              className={`
                absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-white shadow-[0_0_8px_rgba(0,0,0,0.5)] pointer-events-none -translate-x-1/2 transition-all duration-100 ease-out
                ${isDragging || showTooltip ? 'scale-100 shadow-[0_0_12px_rgba(255,0,100,0.5)]' : 'scale-0 group-hover/timeline:scale-100'}
              `}
              style={{ left: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Controls Row */}
        <div className="flex items-center justify-between gap-3 text-xs">
          {/* Left Controls: Play, Volume, Timestamps */}
          <div className="flex items-center gap-3">
            <button
              onClick={togglePlay}
              className="text-white hover:text-pink-400 transition-colors cursor-pointer"
              title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
            >
              {isPlaying ? <Pause size={18} /> : <Play size={18} className="fill-white" />}
            </button>

            {/* Volume Control Group (expanding on hover) */}
            <div className="flex items-center gap-1.5 group/volume">
              <button
                onClick={toggleMute}
                className="text-gray-300 hover:text-white transition-colors cursor-pointer shrink-0"
                title={isMuted ? 'Unmute (M)' : 'Mute (M)'}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX size={18} className="text-red-400" />
                ) : volume < 0.5 ? (
                  <Volume1 size={18} />
                ) : (
                  <Volume2 size={18} />
                )}
              </button>
              <div className="w-0 group-hover/volume:w-20 group-focus-within/volume:w-20 transition-all duration-300 overflow-hidden flex items-center h-5 px-2">
                <div className="relative w-16 h-1 flex items-center cursor-pointer select-none">
                  {/* Track background line */}
                  <div className="absolute inset-0 bg-white/25 rounded-full" />
                  {/* Filled pink track line */}
                  <div
                    className="absolute left-0 top-0 bottom-0 bg-pink-500 rounded-full"
                    style={{ width: `${volumePercent}%` }}
                  />
                  {/* Thumb dot */}
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white border-2 border-pink-500 shadow-[0_0_8px_rgba(236,72,153,0.9)] -translate-x-1/2 pointer-events-none"
                    style={{ left: `${volumePercent}%` }}
                  />
                  {/* Invisible Range Input on top for pointer dragging / mouse handling */}
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    title="Volume"
                  />
                </div>
              </div>
            </div>

            <span className="text-[11px] font-mono text-gray-300">
              {formatTime(currentTime)} / {formatTime(videoDuration)}
            </span>
          </div>

          {/* Right Controls: Speed, PiP, Fullscreen */}
          <div className="flex items-center gap-3 relative">
            <span className="hidden sm:inline-block px-2 py-0.5 rounded bg-pink-500/20 text-pink-400 border border-pink-500/30 text-[10px] font-bold font-mono">
              MP4 1080p
            </span>

            {/* Playback Speed Menu */}
            <div className="relative">
              <button
                onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                className="flex items-center gap-1 text-gray-300 hover:text-white transition-colors cursor-pointer px-2 py-1 rounded bg-white/5 border border-white/10 text-[11px] font-mono"
                title="Playback Speed"
              >
                <Gauge size={13} className="text-pink-400" />
                <span>{playbackSpeed}x</span>
              </button>

              {showSpeedMenu && (
                <div className="absolute bottom-8 right-0 bg-[#11161d] border border-white/15 rounded-xl py-1 shadow-2xl z-40 min-w-[90px]">
                  {SPEED_OPTIONS.map((speed) => (
                    <button
                      key={speed}
                      onClick={() => handleSpeedChange(speed)}
                      className={`
                        w-full px-3 py-1.5 text-left text-xs font-mono transition-colors block
                        ${
                          playbackSpeed === speed
                            ? 'bg-pink-500/20 text-pink-400 font-bold'
                            : 'text-gray-300 hover:bg-white/10 hover:text-white'
                        }
                      `}
                    >
                      {speed}x
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Picture in Picture */}
            {document.pictureInPictureEnabled && (
              <button
                onClick={handlePictureInPicture}
                className="text-gray-300 hover:text-white transition-colors cursor-pointer"
                title="Picture-in-Picture"
              >
                <Tv2 size={16} />
              </button>
            )}

            {/* Fullscreen Toggle */}
            <button
              onClick={toggleFullscreen}
              className="text-gray-300 hover:text-white transition-colors cursor-pointer"
              title="Fullscreen (F)"
            >
              {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
