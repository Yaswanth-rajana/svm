import React from 'react';
import { Video, Link as LinkIcon, AlertTriangle } from 'lucide-react';

const VideoProviderSelector = ({ value, onChange }) => {
  const providers = [
    { id: 'youtube', name: 'YouTube', icon: Video, color: 'text-red-500', activeBg: 'bg-red-500/20 border-red-500/50' },
    { id: 'direct', name: 'Direct URL (MP4)', icon: LinkIcon, color: 'text-blue-500', activeBg: 'bg-blue-500/20 border-blue-500/50' },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {providers.map((provider) => {
          const Icon = provider.icon;
          const isActive = value === provider.id;
          
          return (
            <button
              key={provider.id}
              type="button"
              disabled={provider.disabled}
              onClick={() => !provider.disabled && onChange(provider.id)}
              className={`flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all ${
                provider.disabled
                  ? 'opacity-50 cursor-not-allowed border-white/5 bg-white/5'
                  : isActive
                  ? provider.activeBg
                  : 'border-white/10 bg-black/40 hover:border-white/30'
              }`}
            >
              <Icon size={32} className={`${provider.color} mb-3`} />
              <span className="text-sm font-medium text-white">{provider.name}</span>
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
            <p className="text-gray-400">Important: Unlisted videos are not completely private; anyone who obtains the link can potentially view/share it. The LMS adds security overlays to deter sharing, but cannot technically block raw video link distribution.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoProviderSelector;
