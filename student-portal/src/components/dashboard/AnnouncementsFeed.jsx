import { Link } from 'react-router-dom';
import { Bell, Calendar, ArrowRight } from 'lucide-react';
import Badge from '../common/Badge';
import EmptyState from '../common/EmptyState';
import { ROUTES } from '../../constants/routes';

export const AnnouncementCard = ({ announcement }) => {
  const formattedDate = announcement.createdAt
    ? new Date(announcement.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Recent';

  const courseObj = typeof announcement.courseId === 'object' ? announcement.courseId : null;
  const moduleObj = typeof announcement.moduleId === 'object' ? announcement.moduleId : null;
  const lessonObj = typeof announcement.lessonId === 'object' ? announcement.lessonId : null;

  const rawCourseId = courseObj?._id || announcement.courseId;
  const rawModuleId = moduleObj?._id || announcement.moduleId;
  const rawLessonId = lessonObj?._id || announcement.lessonId;

  const isModulePublished = announcement.type === 'COURSE_MODULE_PUBLISHED';
  const isLessonPublished = announcement.type === 'COURSE_LESSON_PUBLISHED';

  return (
    <div className="p-4 rounded-2xl glass-panel glass-panel-hover border border-white/10 space-y-2.5 flex flex-col justify-between">
      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <h4 className="text-sm font-bold text-white line-clamp-1 group-hover:text-pink-300 transition-colors">
            {announcement.title}
          </h4>
          <Badge variant={announcement.targetType === 'COURSE' || announcement.announcementType === 'course' ? 'purple' : 'pink'}>
            {announcement.category || (announcement.targetType === 'COURSE' ? 'Course' : 'Global')}
          </Badge>
        </div>

        <p className="text-xs text-gray-300 leading-relaxed line-clamp-2">
          {announcement.message}
        </p>
      </div>

      <div className="flex items-center justify-between gap-1.5 text-[10px] font-mono text-gray-400 pt-2 border-t border-white/5">
        <div className="flex items-center gap-1">
          <Calendar size={12} className="text-pink-400" />
          <span>Published {formattedDate}</span>
        </div>

        {isModulePublished && rawCourseId && (
          <Link
            to={`/course/${rawCourseId}${rawModuleId ? `?moduleId=${rawModuleId}` : ''}`}
            className="text-pink-400 hover:text-pink-300 font-extrabold text-[11px] flex items-center gap-1"
          >
            <span>View Course</span>
            <ArrowRight size={11} />
          </Link>
        )}

        {isLessonPublished && rawCourseId && rawLessonId && (
          <Link
            to={`/course/${rawCourseId}?lessonId=${rawLessonId}`}
            className="text-pink-400 hover:text-pink-300 font-extrabold text-[11px] flex items-center gap-1"
          >
            <span>Open Lesson</span>
            <ArrowRight size={11} />
          </Link>
        )}
      </div>
    </div>
  );
};

export const AnnouncementsFeed = ({ announcements = [] }) => {
  const displayedAnnouncements = (announcements || []).slice(0, 3);

  if (!displayedAnnouncements || displayedAnnouncements.length === 0) {
    return (
      <EmptyState
        icon={Bell}
        title="No Announcements"
        description="There are currently no new announcements published."
      />
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-pink-500/20 border border-pink-500/30 flex items-center justify-center text-pink-400">
            <Bell size={15} />
          </div>
          <h3 className="text-lg font-extrabold text-white">Announcements & Portal Updates</h3>
        </div>

        <Link
          to={ROUTES.ANNOUNCEMENTS}
          className="text-xs font-bold text-pink-400 hover:text-pink-300 flex items-center gap-1 transition-colors bg-pink-500/10 px-3 py-1.5 rounded-lg border border-pink-500/20"
        >
          <span>View All Announcements</span>
          <ArrowRight size={13} />
        </Link>
      </div>

      {/* Grid: max 3 cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayedAnnouncements.map((ann) => (
          <AnnouncementCard key={ann._id || ann.id || ann.title} announcement={ann} />
        ))}
      </div>
    </div>
  );
};

export default AnnouncementsFeed;
