import React, { useState } from 'react';
import { Camera, ShieldCheck, Mail, Phone, Calendar } from 'lucide-react';
import AvatarUploadModal from './AvatarUploadModal';

export const ProfileHeader = ({
  student,
  onUpdateAvatar,
  onRemoveAvatar,
}) => {
  const [modalOpen, setModalOpen] = useState(false);

  if (!student) return null;

  const {
    name,
    email,
    phone,
    avatarUrl,
    createdAt,
    isVerified,
  } = student;

  const formattedDate = createdAt
    ? new Date(createdAt).toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      })
    : 'Jul 2026';

  const initials = name
    ? name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'SM';

  return (
    <>
      <div className="p-6 rounded-2xl glass-panel border border-white/10 flex flex-col sm:flex-row items-center sm:items-start gap-5">
        {/* Profile Avatar Container with Hover Overlay */}
        <div
          onClick={() => setModalOpen(true)}
          className="relative group shrink-0 cursor-pointer"
          title="Click to Change Photo"
        >
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-pink-500/40 bg-gradient-to-br from-pink-500/20 to-purple-600/30 shadow-lg shadow-pink-500/10 flex items-center justify-center text-2xl font-extrabold text-white relative">
            {avatarUrl ? (
              <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
            ) : (
              <span>{initials}</span>
            )}

            {/* Hover Dark Overlay with Camera Icon & "Change Photo" text */}
            <div className="absolute inset-0 bg-black/65 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center gap-1 text-white backdrop-blur-[2px]">
              <Camera size={18} className="text-pink-400" />
              <span className="text-[10px] font-bold tracking-tight">Change Photo</span>
            </div>
          </div>

          {/* Floating Camera Badge Icon */}
          <div className="absolute bottom-0 right-0 p-1.5 rounded-full bg-pink-500 text-white shadow-md border border-black/40 group-hover:scale-110 transition-transform">
            <Camera size={13} />
          </div>
        </div>

        {/* Minimal & Elegant Student Meta */}
        <div className="space-y-2 text-center sm:text-left min-w-0">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-white">{name || 'Student'}</h1>
            {isVerified && (
              <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                <ShieldCheck size={12} /> Verified Student
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-gray-300">
            <span className="flex items-center gap-1.5 text-gray-300">
              <Mail size={13} className="text-pink-400" /> {email}
            </span>

            {phone && (
              <span className="flex items-center gap-1.5 text-gray-300">
                <Phone size={13} className="text-purple-400" /> {phone}
              </span>
            )}

            <span className="flex items-center gap-1.5 text-gray-400 font-mono text-[11px]">
              <Calendar size={13} className="text-amber-400" /> Member Since {formattedDate}
            </span>
          </div>
        </div>
      </div>

      {/* React Portal Avatar Modal */}
      <AvatarUploadModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        currentAvatar={avatarUrl}
        onSaveAvatar={(newUrl) => onUpdateAvatar({ avatarUrl: newUrl })}
        onRemoveAvatar={onRemoveAvatar}
      />
    </>
  );
};

export default ProfileHeader;
