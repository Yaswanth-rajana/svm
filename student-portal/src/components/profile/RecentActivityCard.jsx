import React from 'react';
import { Activity, PlayCircle, CheckCircle, Download, Video, LogIn, UserCheck, HelpCircle } from 'lucide-react';

const getActivityIcon = (type) => {
  switch (type) {
    case 'Started Lesson':
      return <PlayCircle size={15} className="text-pink-400" />;
    case 'Completed Lesson':
      return <CheckCircle size={15} className="text-emerald-400" />;
    case 'Downloaded Notes':
      return <Download size={15} className="text-cyan-400" />;
    case 'Viewed Recording':
      return <Video size={15} className="text-purple-400" />;
    case 'Logged In':
      return <LogIn size={15} className="text-amber-400" />;
    case 'Profile Updated':
      return <UserCheck size={15} className="text-blue-400" />;
    default:
      return <Activity size={15} className="text-gray-400" />;
  }
};

export const RecentActivityCard = ({ activity = [] }) => {
  if (!activity || activity.length === 0) return null;

  return (
    <div className="p-6 rounded-2xl glass-panel border border-white/10 space-y-4">
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Activity size={18} className="text-pink-400" />
          Recent LMS Activity
        </h3>
        <span className="text-xs font-mono text-gray-400">{activity.length} Recent Events</span>
      </div>

      <div className="space-y-3">
        {activity.map((item) => {
          const formattedTime = item.timestamp
            ? new Date(item.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })
            : 'Recent';

          return (
            <div
              key={item.id || item.title}
              className="p-3.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 transition-all flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 rounded-lg bg-white/5 border border-white/10 shrink-0">
                  {getActivityIcon(item.type)}
                </div>

                <div className="min-w-0 space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white truncate">{item.title}</span>
                    <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-white/5 text-gray-400">
                      {item.type}
                    </span>
                  </div>
                  <p className="text-xs text-gray-300 truncate">{item.description}</p>
                </div>
              </div>

              <span className="text-[10px] font-mono text-gray-400 shrink-0">{formattedTime}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecentActivityCard;
