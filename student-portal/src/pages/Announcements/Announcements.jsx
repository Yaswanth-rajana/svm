import React from 'react';
import PageHeader from '../../components/common/PageHeader';
import AnnouncementTimeline from '../../components/announcements/AnnouncementTimeline';
import SkeletonPage from '../../components/common/SkeletonLoader';
import ErrorMessage from '../../components/common/ErrorMessage';
import useAnnouncements from '../../hooks/useAnnouncements';
import { Bell, RefreshCw, CheckCheck } from 'lucide-react';

export const AnnouncementsPage = () => {
  const {
    announcements,
    loading,
    error,
    unreadCount,
    markAsRead,
    markAllAsRead,
    refetch,
  } = useAnnouncements();

  if (loading) {
    return <SkeletonPage />;
  }

  if (error) {
    return (
      <ErrorMessage
        title="Unable to load Announcements"
        message={error}
        onRetry={refetch}
      />
    );
  }

  return (
    <>
      <div className="space-y-4 animate-fade-in">
        {/* Header Bar with Subtitle & Quick Actions */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <PageHeader
            icon={Bell}
            title="Announcements & Broadcasts"
            description="Stay updated with course announcements and platform updates."
            badgeText={`${unreadCount} Unread`}
          />

          {/* Quick Actions: Mark All Read + Refresh */}
          <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-auto">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-pink-500/15 hover:bg-pink-500/25 border border-pink-500/30 text-xs font-bold text-pink-300 transition-all active:scale-95 shadow-sm"
                title="Mark all announcements as read"
              >
                <CheckCheck size={14} className="text-pink-400" />
                <span>Mark All Read</span>
              </button>
            )}

            <button
              onClick={refetch}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-gray-300 hover:text-white transition-all active:scale-95"
              title="Refresh Broadcast Feed"
            >
              <RefreshCw size={14} className="text-pink-400" />
              <span>Refresh Broadcasts</span>
            </button>
          </div>
        </div>

        {/* Timeline View */}
        <AnnouncementTimeline
          announcements={announcements}
          onMarkRead={markAsRead}
        />
      </div>
    </>
  );
};

export default AnnouncementsPage;
