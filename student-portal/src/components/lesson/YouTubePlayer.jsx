import React, { useState, useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import useStudentProfile from '../../hooks/useStudentProfile';
import courseService from '../../services/course.service';

const WatermarkOverlay = ({ studentName, studentEmail }) => {
  const [position, setPosition] = useState({ top: '15%', left: '15%' });

  useEffect(() => {
    const interval = setInterval(() => {
      // Clamp randomTop between 10% and 65% to keep it out of the bottom 70px control bar
      const randomTop = Math.floor(Math.random() * 55) + 10;
      const randomLeft = Math.floor(Math.random() * 55) + 15;
      setPosition({
        top: `${randomTop}%`,
        left: `${randomLeft}%`,
      });
    }, 10000); // Shift watermark position every 10s

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

export const YouTubePlayer = ({ courseId, lessonId, videoId, title, initialPosition = 0 }) => {
  const { student } = useStudentProfile();
  const queryClient = useQueryClient();
  const playerRef = useRef(null);
  const iframeId = `youtube-player-${lessonId}`;

  // Position tracking refs
  const lastReportedPosRef = useRef(-1);
  const isReportingRef = useRef(false);
  const currentPosRef = useRef(initialPosition || 0);
  const currentDurationRef = useRef(0);

  useEffect(() => {
    // 1. Ensure YouTube IFrame API script is loaded
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }
  }, []);

  useEffect(() => {
    let player = null;
    let progressInterval = null;
    let checkInterval = null;

    const onPlayerReady = (event) => {
      // 2. Restore saved position:
      // Priority 1: Backend lastPosition (initialPosition)
      // Priority 2: LocalStorage position if backend position is 0
      let resumeTime = 0;
      if (typeof initialPosition === 'number' && initialPosition > 0) {
        resumeTime = initialPosition;
      } else {
        try {
          const saved = localStorage.getItem(`smv_video_pos_${lessonId}`);
          if (saved) {
            const parsed = parseFloat(saved);
            if (!isNaN(parsed) && parsed > 0) {
              resumeTime = parsed;
            }
          }
        } catch (e) {
          console.warn('Failed to restore playback position from localStorage:', e);
        }
      }

      if (resumeTime > 0) {
        event.target.seekTo(resumeTime, true);
        currentPosRef.current = resumeTime;
      }

      // 3. Setup periodic progress reporting (every ~5 seconds while PLAYING)
      progressInterval = setInterval(() => {
        if (event.target && typeof event.target.getPlayerState === 'function') {
          const state = event.target.getPlayerState();
          if (state === window.YT?.PlayerState?.PLAYING) {
            const currentTime = event.target.getCurrentTime();
            const duration = event.target.getDuration();

            if (typeof currentTime === 'number' && currentTime >= 0 && typeof duration === 'number' && duration > 0) {
              currentPosRef.current = currentTime;
              currentDurationRef.current = duration;

              const roundedPos = Math.round(currentTime);
              const roundedDur = Math.round(duration);

              // Skip duplicate request if position has not changed meaningfully
              if (Math.abs(roundedPos - lastReportedPosRef.current) < 1) {
                return;
              }

              if (isReportingRef.current) return;

              lastReportedPosRef.current = roundedPos;
              try {
                localStorage.setItem(`smv_video_pos_${lessonId}`, roundedPos.toString());
              } catch (e) {}

              isReportingRef.current = true;
              courseService
                .updateLessonProgress(courseId, lessonId, {
                  lastPosition: roundedPos,
                  duration: roundedDur,
                })
                .then((res) => {
                  if (res?.success && res.data?.completedNow) {
                    queryClient.invalidateQueries({ queryKey: ['course-progress', courseId] });
                    queryClient.invalidateQueries({ queryKey: ['course', courseId] });
                    queryClient.invalidateQueries({ queryKey: ['lesson', lessonId] });
                  }
                })
                .catch((err) => console.warn('Failed to update lesson progress on backend:', err))
                .finally(() => {
                  isReportingRef.current = false;
                });
            }
          }
        }
      }, 5000);
    };

    const onPlayerStateChange = (event) => {
      // 4. Report final completion if video ends
      if (event.data === window.YT?.PlayerState?.ENDED) {
        const duration = event.target.getDuration();
        if (duration > 0) {
          const roundedDur = Math.round(duration);
          try {
            localStorage.setItem(`smv_video_pos_${lessonId}`, roundedDur.toString());
          } catch (e) {}

          courseService
            .updateLessonProgress(courseId, lessonId, {
              lastPosition: roundedDur,
              duration: roundedDur,
            })
            .then((res) => {
              if (res?.success && res.data?.completedNow) {
                queryClient.invalidateQueries({ queryKey: ['course-progress', courseId] });
                queryClient.invalidateQueries({ queryKey: ['course', courseId] });
                queryClient.invalidateQueries({ queryKey: ['lesson', lessonId] });
              }
            })
            .catch((err) => console.warn('Failed to report lesson completion on backend:', err));
        }
      }
    };

    const initPlayer = () => {
      try {
        player = new window.YT.Player(iframeId, {
          width: '100%',
          height: '100%',
          videoId: videoId,
          host: 'https://www.youtube-nocookie.com',
          playerVars: {
            autoplay: 1,
            controls: 1,
            playsinline: 1,
            rel: 0,
            fs: 1,
            enablejsapi: 1,
            iv_load_policy: 3,
            modestbranding: 1,
            origin: window.location.origin,
          },
          events: {
            onReady: onPlayerReady,
            onStateChange: onPlayerStateChange,
          },
        });
        playerRef.current = player;
      } catch (err) {
        console.error('Failed to initialize YouTube IFrame Player:', err);
      }
    };

    // Poll to make sure window.YT.Player constructor is loaded
    const loadAndInit = () => {
      if (window.YT && window.YT.Player) {
        initPlayer();
      } else {
        checkInterval = setInterval(() => {
          if (window.YT && window.YT.Player) {
            clearInterval(checkInterval);
            initPlayer();
          }
        }, 100);
      }
    };

    loadAndInit();

    return () => {
      if (checkInterval) clearInterval(checkInterval);
      if (progressInterval) clearInterval(progressInterval);

      // Safe final update on unmount or lesson change
      const finalPos = currentPosRef.current;
      const finalDur = currentDurationRef.current;
      if (finalPos > 0 && finalDur > 0 && Math.abs(Math.round(finalPos) - lastReportedPosRef.current) >= 1) {
        courseService.updateLessonProgress(courseId, lessonId, {
          lastPosition: Math.round(finalPos),
          duration: Math.round(finalDur),
        }).catch((err) => console.warn('Non-blocking unmount progress sync error:', err));
      }

      if (player) {
        try {
          player.destroy();
        } catch (e) {}
      }
    };
  }, [videoId, lessonId, courseId, iframeId, initialPosition, queryClient]);

  return (
    <div className="youtube-player-container relative w-full aspect-video bg-black rounded-2xl glass-panel border border-white/15 overflow-hidden shadow-2xl transition-all duration-300">
      <div className="w-full h-full">
        <div id={iframeId} className="w-full h-full border-0" />
      </div>
      {/* SMVEN watermark only */}
      <div className="student-watermark">
        <WatermarkOverlay studentName={student?.name} studentEmail={student?.email} />
      </div>
    </div>
  );
};

export default YouTubePlayer;

