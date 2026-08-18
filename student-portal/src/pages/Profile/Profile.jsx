import React from 'react';
import PageHeader from '../../components/common/PageHeader';
import ProfileHeader from '../../components/profile/ProfileHeader';

import EditableProfileForm from '../../components/profile/EditableProfileForm';
import LoginSecurityCard from '../../components/profile/LoginSecurityCard';
import NotificationSettings from '../../components/profile/NotificationSettings';
import LogoutCard from '../../components/profile/LogoutCard';
import SkeletonPage from '../../components/common/SkeletonLoader';
import ErrorMessage from '../../components/common/ErrorMessage';
import useStudentProfile from '../../hooks/useStudentProfile';
import { useAuth } from '../../hooks/useAuth';
import { User } from 'lucide-react';

export const ProfilePage = () => {
  const { logout } = useAuth();

  const {
    student,
    enrollments,
    loading,
    updating,
    error,
    updateMessage,
    updateProfile,
    toggleNotificationPref,
    removeAvatar,
    refetch,
  } = useStudentProfile();

  if (loading) {
    return <SkeletonPage />;
  }

  if (error) {
    return (
      <ErrorMessage
        title="Unable to load Profile"
        message={error}
        onRetry={refetch}
      />
    );
  }

  return (
    <>
      <div className="space-y-6 animate-fade-in">
        {/* Page Header */}
        <PageHeader
          icon={User}
          title="Student Profile & Settings"
          description="Manage your student details, password credentials, and notification preferences."
          badgeText="Verified Student"
        />

        {/* Minimal & Elegant Profile Header */}
        <ProfileHeader
          student={student}
          onUpdateAvatar={updateProfile}
          onRemoveAvatar={removeAvatar}
        />



        {/* Personal Information Form */}
        <EditableProfileForm
          student={student}
          onSave={updateProfile}
          updating={updating}
          updateMessage={updateMessage}
        />

        {/* Login & Security Card */}
        <LoginSecurityCard student={student} />

        {/* Compact Notification Preferences */}
        <NotificationSettings
          preferences={student?.notificationPreferences}
          onToggle={toggleNotificationPref}
        />

        {/* Simple Logout Card */}
        <LogoutCard onLogout={logout} />
      </div>
    </>
  );
};

export default ProfilePage;
