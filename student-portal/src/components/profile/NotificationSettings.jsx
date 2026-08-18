import React from 'react';
import { Bell, Mail, MessageSquare, Video, Check } from 'lucide-react';

export const NotificationSettings = ({ preferences = {}, onToggle }) => {
  const toggles = [
    {
      key: 'email',
      title: 'Email Notifications',
      description: 'Course updates, assignment notices, and announcements.',
      icon: Mail,
      color: 'text-pink-400',
    },
    {
      key: 'whatsapp',
      title: 'WhatsApp Notifications',
      description: 'Instant alerts for live session links and schedule reminders.',
      icon: MessageSquare,
      color: 'text-emerald-400',
    },
    {
      key: 'liveSession',
      title: 'Live Session Reminders',
      description: 'Reminders 15 minutes before live workshops begin.',
      icon: Video,
      color: 'text-purple-400',
    },
  ];

  return (
    <div className="p-6 rounded-2xl glass-panel border border-white/10 space-y-4">
      <div className="border-b border-white/10 pb-3">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Bell size={18} className="text-pink-400" />
          Notification Preferences
        </h3>
        <p className="text-xs text-gray-400 mt-0.5">
          Manage how you receive learning reminders and course updates.
        </p>
      </div>

      {/* Compact Vertical Stack */}
      <div className="space-y-3">
        {toggles.map((item) => {
          const Icon = item.icon;
          const isEnabled = preferences[item.key] !== false; // default true

          return (
            <div
              key={item.key}
              onClick={() => onToggle(item.key)}
              className={`
                p-3.5 rounded-xl border transition-all duration-200 cursor-pointer flex items-center justify-between gap-4
                ${
                  isEnabled
                    ? 'bg-white/[0.03] border-white/15 hover:border-pink-500/30'
                    : 'bg-white/[0.01] border-white/5 opacity-60 hover:opacity-80'
                }
              `}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 rounded-lg bg-white/5 border border-white/10 shrink-0">
                  <Icon size={16} className={item.color} />
                </div>

                <div className="min-w-0 space-y-0.5">
                  <h4 className="text-xs font-bold text-white truncate">{item.title}</h4>
                  <p className="text-[11px] text-gray-400 truncate">{item.description}</p>
                </div>
              </div>

              {/* Simple Toggle Switch */}
              <div
                className={`
                  w-9 h-5 rounded-full transition-colors p-0.5 flex items-center shrink-0
                  ${isEnabled ? 'bg-pink-500 justify-end' : 'bg-gray-700 justify-start'}
                `}
              >
                <div className="w-4 h-4 rounded-full bg-white shadow-md flex items-center justify-center">
                  {isEnabled && <Check size={10} className="text-pink-600 font-extrabold" />}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default NotificationSettings;
