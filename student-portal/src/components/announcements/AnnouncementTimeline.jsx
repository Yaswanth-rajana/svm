import React from 'react';
import AnnouncementCard from './AnnouncementCard';
import { Megaphone, CheckCircle2 } from 'lucide-react';

export const AnnouncementTimeline = ({ announcements = [], onMarkRead }) => {
  if (!announcements || announcements.length === 0) {
    return (
      <div className="py-12 px-6 rounded-3xl glass-panel border border-white/10 text-center space-y-4 max-w-lg mx-auto my-4">
        <div className="w-16 h-16 rounded-3xl bg-pink-500/20 border border-pink-500/30 flex items-center justify-center text-pink-400 mx-auto shadow-xl shadow-pink-500/10">
          <Megaphone size={32} />
        </div>

        <div className="space-y-1.5">
          <h3 className="text-xl font-black text-white flex items-center justify-center gap-2">
            <span>You're all caught up!</span>
            <CheckCircle2 size={20} className="text-emerald-400" />
          </h3>
          <p className="text-xs text-gray-300 leading-relaxed max-w-sm mx-auto">
            There are currently no active announcements published.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative pl-7 space-y-4 pt-1 before:absolute before:top-3 before:bottom-3 before:left-3.5 before:w-0.5 before:bg-gradient-to-b before:from-pink-500/60 before:via-purple-500/30 before:to-transparent">
      {announcements.map((ann, idx) => (
        <div key={ann._id || ann.id || idx} className="relative animate-fade-in">
          {/* Timeline Node Dot (Centered exactly over the vertical axis line) */}
          <div
            className={`
              absolute -left-5 top-5 w-3.5 h-3.5 rounded-full border-2 border-[#0b0f14] transition-all z-10
              ${!ann.read ? 'bg-pink-400 shadow-md shadow-pink-500/50 scale-110' : 'bg-gray-600'}
            `}
          />

          <AnnouncementCard announcement={ann} onMarkRead={onMarkRead} />
        </div>
      ))}
    </div>
  );
};

export default AnnouncementTimeline;
