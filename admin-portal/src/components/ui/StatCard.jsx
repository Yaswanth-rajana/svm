import React from 'react';

export const StatCard = ({ title, value, icon: Icon }) => {
  return (
    <div className="glass-panel p-6 rounded-2xl glass-panel-hover group">
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-white/5 rounded-xl group-hover:bg-[#ff0064]/20 transition-colors">
          <Icon size={24} className="text-[#ff4ecd]" />
        </div>
      </div>
      <div>
        <h4 className="text-gray-400 text-sm font-medium">{title}</h4>
        <p className="text-3xl font-bold text-white mt-1">{value}</p>
      </div>
    </div>
  );
};
