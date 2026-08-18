import React, { useState, useRef } from 'react';
import { UploadCloud, X, File, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

// Abstracted upload service simulation
// Later, this just connects to Cloudflare R2
const uploadService = {
  uploadFile: async (file) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Return a reliable mock image URL for now to prevent ERR_NAME_NOT_RESOLVED
        resolve(`https://placehold.co/800x450/png?text=${encodeURIComponent(file.name)}`);
      }, 1500);
    });
  }
};

const MediaUploader = ({ value, onChange, onFileSelect, accept = "image/*", label = "Upload Image" }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const processFile = async (file) => {
    if (!file) return;

    if (onFileSelect) {
      // Validate size (max 5MB as per requirements)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size exceeds 5MB limit');
        return;
      }
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Invalid file type. Only JPG, PNG, and WebP are allowed.');
        return;
      }
      onFileSelect(file);
      return;
    }

    // Fallback behavior for original mock upload
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size exceeds 10MB limit');
      return;
    }

    setIsUploading(true);
    try {
      const url = await uploadService.uploadFile(file);
      onChange(url);
      toast.success('Upload complete');
    } catch (error) {
      toast.error('Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    processFile(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    processFile(file);
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    onChange('');
  };

  return (
    <div className="w-full">
      {value ? (
        <div className="relative group rounded-xl overflow-hidden border border-white/10 bg-black/40 aspect-video flex items-center justify-center">
          {accept.includes('image') ? (
            <img src={value} alt="Uploaded media" className="w-full h-full object-cover" />
          ) : (
            <div className="flex flex-col items-center text-green-400">
              <CheckCircle size={32} className="mb-2" />
              <span className="text-sm font-medium">Video Uploaded</span>
            </div>
          )}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
            <button
              onClick={handleRemove}
              className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg border border-red-500/50 hover:bg-red-500 hover:text-white transition-colors flex items-center gap-2 text-sm font-medium"
              type="button"
            >
              <X size={16} /> Remove Media
            </button>
          </div>
        </div>
      ) : (
        <div
          className={`relative rounded-xl border-2 border-dashed transition-all duration-200 aspect-video flex flex-col items-center justify-center cursor-pointer
            ${isDragging ? 'border-[#ff0064] bg-[#ff0064]/5' : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'}
          `}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !isUploading && fileInputRef.current?.click()}
        >
          {isUploading ? (
            <div className="flex flex-col items-center">
              <div className="h-8 w-8 rounded-full border-2 border-[#ff0064] border-t-transparent animate-spin mb-3"></div>
              <p className="text-sm text-gray-400 font-medium">Uploading to R2...</p>
            </div>
          ) : (
            <>
              <div className="p-4 rounded-full bg-black/40 mb-3 text-gray-400 group-hover:text-white group-hover:scale-110 transition-all">
                <UploadCloud size={24} />
              </div>
              <p className="text-sm font-medium text-gray-300 mb-1">{label}</p>
              <p className="text-xs text-gray-500">Drag & drop or click to browse</p>
            </>
          )}
          
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept={accept} 
            className="hidden" 
          />
        </div>
      )}
    </div>
  );
};

export default MediaUploader;
