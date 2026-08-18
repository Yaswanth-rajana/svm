import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Upload, Trash2, Check, Image as ImageIcon, Sparkles } from 'lucide-react';

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80',
];

export const AvatarUploadModal = ({
  isOpen,
  onClose,
  currentAvatar,
  onSaveAvatar,
  onRemoveAvatar,
}) => {
  const [selectedUrl, setSelectedUrl] = useState(currentAvatar || '');
  const fileInputRef = useRef(null);

  // Sync current avatar when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedUrl(currentAvatar || '');
    }
  }, [isOpen, currentAvatar]);

  // Lock body scrolling when modal is active
  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  // Handle Escape keypress
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setSelectedUrl(event.target.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectPreset = (url) => {
    setSelectedUrl(url);
  };

  const handleSave = () => {
    onSaveAvatar(selectedUrl);
    onClose();
  };

  const handleRemove = () => {
    setSelectedUrl('');
    onRemoveAvatar();
    onClose();
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md transition-opacity animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[520px] p-6 sm:p-7 rounded-3xl bg-[#11161d] border border-white/15 shadow-2xl space-y-6 relative m-4 z-50 animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Icon */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 transition-all"
          aria-label="Close dialog"
        >
          <X size={18} />
        </button>

        {/* Title */}
        <div className="space-y-1">
          <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
            <ImageIcon size={20} className="text-pink-400" />
            Update Profile Picture
          </h3>
          <p className="text-xs text-gray-400">
            Upload an image from your computer or choose from preset student avatars.
          </p>
        </div>

        {/* Current Avatar Preview */}
        <div className="flex flex-col items-center justify-center py-4 px-6 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
          <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-pink-500/50 bg-gradient-to-br from-pink-500/20 to-purple-600/30 shadow-xl flex items-center justify-center text-3xl font-extrabold text-white shrink-0">
            {selectedUrl ? (
              <img src={selectedUrl} alt="Avatar Preview" className="w-full h-full object-cover" />
            ) : (
              <span>SMV</span>
            )}
          </div>
          <span className="text-xs font-semibold text-gray-300">
            {selectedUrl ? 'Selected Image Preview' : 'Default Monogram Avatar'}
          </span>
        </div>

        {/* Action 1: Upload Image File */}
        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-3 px-4 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-bold text-white flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm"
          >
            <Upload size={16} className="text-pink-400" />
            <span>Choose Image File</span>
          </button>
        </div>

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="w-full border-t border-white/10" />
          <span className="absolute px-3 bg-[#11161d] text-[10px] font-mono font-bold text-gray-400 uppercase">
            OR
          </span>
        </div>

        {/* Action 2: Choose from Preset Avatars */}
        <div className="space-y-2.5">
          <span className="text-xs font-bold text-gray-300 block">Choose from Preset Avatars</span>
          <div className="flex items-center justify-center gap-3 overflow-x-auto pb-1">
            {PRESET_AVATARS.map((url, idx) => {
              const isSelected = selectedUrl === url;
              return (
                <button
                  key={idx}
                  onClick={() => handleSelectPreset(url)}
                  className={`
                    relative w-14 h-14 rounded-full overflow-hidden border-2 transition-all shrink-0 active:scale-95
                    ${
                      isSelected
                        ? 'border-pink-400 scale-105 shadow-lg shadow-pink-500/40 ring-2 ring-pink-500/20'
                        : 'border-white/15 hover:border-white/40 hover:scale-105'
                    }
                  `}
                >
                  <img src={url} alt={`Preset ${idx + 1}`} className="w-full h-full object-cover" />
                  {isSelected && (
                    <div className="absolute inset-0 bg-pink-500/40 flex items-center justify-center backdrop-blur-[1px]">
                      <Check size={16} className="text-white font-extrabold" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-white/10 gap-3">
          {/* Remove Photo */}
          {selectedUrl ? (
            <button
              onClick={handleRemove}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-semibold transition-all active:scale-95"
            >
              <Trash2 size={14} />
              <span>Remove Photo</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-gray-300 border border-white/5 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-pink-500 hover:bg-pink-400 text-xs font-bold text-white shadow-lg shadow-pink-500/20 transition-all active:scale-95"
            >
              Save Avatar
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default AvatarUploadModal;
