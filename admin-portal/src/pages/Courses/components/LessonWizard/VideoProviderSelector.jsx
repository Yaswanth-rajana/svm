import React from 'react';
import { Video, Link as LinkIcon, UploadCloud, AlertTriangle, ShieldCheck } from 'lucide-react';

const VideoProviderSelector = ({ value, onChange }) => {
  const providers = [
    { 
      id: 'youtube', 
      name: 'YouTube', 
      subtitle: 'Paste YouTube URL',
      icon: Video, 
      color: 'text-red-500', 
      activeBg: 'bg-red-500/20 border-red-500/50' 
    },
    { 
      id: 'r2', 
      name: 'Cloudflare R2', 
      subtitle: 'Upload Private Video',
      icon: UploadCloud, 
      color: 'text-orange-400', 
      activeBg: 'bg-orange-500/20 border-orange-500/50' 
    },
    { 
      id: 'direct', 
      name: 'Direct URL (MP4)', 
      subtitle: 'External Video Link',
      icon: LinkIcon, 
      color: 'text-blue-500', 
      activeBg: 'bg-blue-500/20 border-blue-500/50' 
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {providers.map((provider) => {
          const Icon = provider.icon;
          const isActive = value === provider.id;
          
          return (
            <button
              key={provider.id}
              type="button"
              disabled={provider.disabled}
              onClick={() => !provider.disabled && onChange(provider.id)}
              className={`flex flex-col items-center justify-center p-5 rounded-xl border-2 transition-all ${
                provider.disabled
                  ? 'opacity-50 cursor-not-allowed border-white/5 bg-white/5'
                  : isActive
                  ? provider.activeBg
                  : 'border-white/10 bg-black/40 hover:border-white/30'
              }`}
            >
              <Icon size={28} className={`${provider.color} mb-2`} />
              <span className="text-sm font-bold text-white mb-0.5">{provider.name}</span>
              <span className="text-[11px] text-gray-400">{provider.subtitle}</span>
            </button>
          );
        })}
      </div>

      {value === 'youtube' && (
        <div className="flex gap-3 p-4 rounded-xl border border-yellow-500/20 bg-yellow-500/5 text-xs text-yellow-400 leading-relaxed">
          <AlertTriangle size={18} className="shrink-0 text-yellow-500 mt-0.5" />
          <div>
            <p className="font-bold mb-1">Recommended Configuration:</p>
            <p className="mb-1">Set the YouTube video visibility to <strong>UNLISTED</strong>.</p>
            <p className="text-gray-400">Important: Unlisted videos are cost-efficient for public/free courses. The LMS adds security overlays to deter sharing.</p>
          </div>
        </div>
      )}

      {value === 'r2' && (
        <div className="flex gap-3 p-4 rounded-xl border border-orange-500/20 bg-orange-500/5 text-xs text-orange-400 leading-relaxed">
          <ShieldCheck size={18} className="shrink-0 text-orange-400 mt-0.5" />
          <div>
            <p className="font-bold mb-1">Private Cloudflare R2 Upload:</p>
            <p className="text-gray-300">Videos are uploaded directly from your browser to private R2 storage. Enrolled students stream via short-lived signed URLs with active session validation.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoProviderSelector;
