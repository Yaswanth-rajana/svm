import React from 'react';
import { User, Settings, Award } from 'lucide-react';

const TABS = [
  { id: 'profile', name: 'Profile', icon: User, active: true },
  { id: 'settings', name: 'Settings', icon: Settings, active: true },
  { id: 'certificates', name: 'Certificates', icon: Award, active: false, badge: 'Coming Soon' },
];

export const ProfileTabs = ({ activeTab, onTabChange }) => {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-white/10 scrollbar-none">
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const isSelected = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 border
              ${
                isSelected
                  ? 'bg-pink-500/20 text-pink-400 border-pink-500/30 shadow-lg shadow-pink-500/10'
                  : 'bg-white/5 text-gray-400 border-transparent hover:bg-white/10 hover:text-white'
              }
            `}
          >
            <Icon size={14} className={isSelected ? 'text-pink-400' : 'text-gray-400'} />
            <span>{tab.name}</span>
            {tab.badge && (
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-white/5 text-gray-400 border border-white/5">
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default ProfileTabs;
