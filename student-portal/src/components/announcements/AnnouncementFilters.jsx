import React, { useState } from 'react';
import { Search, Filter, ArrowUpDown, X, ChevronDown, ChevronUp } from 'lucide-react';

const MAIN_CATEGORIES = ['All', 'Unread', 'General', 'Course', 'Live'];
const MORE_CATEGORIES = ['Assignment', 'Exam', 'Maintenance', 'System'];

export const AnnouncementFilters = ({
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  sortOrder,
  onSortChange,
  totalCount = 0,
  unreadCount = 0,
}) => {
  const [showMore, setShowMore] = useState(false);

  const isMoreSelected = MORE_CATEGORIES.includes(selectedCategory);

  return (
    <div className="space-y-3 p-4 rounded-2xl glass-panel border border-white/10">
      {/* Quick Summary Bar + Search & Sort */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-white/5 pb-3">
        {/* Quick Summary */}
        <div className="flex items-center gap-3 text-xs font-mono text-gray-300">
          <span className="font-semibold text-white">{totalCount} Total Announcements</span>
          <span className="opacity-30">•</span>
          <span className="text-pink-400 font-bold">{unreadCount} Unread</span>
          <span className="hidden sm:inline opacity-30">•</span>
          <span className="hidden sm:inline text-gray-400">Updated: Today</span>
        </div>

        {/* Sort Select */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-gray-300">
            <ArrowUpDown size={13} className="text-pink-400" />
            <select
              value={sortOrder}
              onChange={(e) => onSortChange(e.target.value)}
              className="bg-transparent text-white focus:outline-none cursor-pointer text-xs font-medium"
            >
              <option value="Newest" className="bg-[#11161d] text-white">Newest First</option>
              <option value="Oldest" className="bg-[#11161d] text-white">Oldest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="relative">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search announcements by title or content..."
          className="w-full pl-10 pr-9 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-pink-500/50 transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Category Pills Bar (Main categories + More ▼ toggle) */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1 shrink-0 pr-1">
          <Filter size={11} /> Categories:
        </span>

        {MAIN_CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => onSelectCategory(cat)}
              className={`
                px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200
                ${
                  isActive
                    ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/20 border border-pink-400'
                    : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white border border-white/5'
                }
              `}
            >
              {cat}
            </button>
          );
        })}

        {/* More Categories Toggle Button */}
        <button
          onClick={() => setShowMore(!showMore)}
          className={`
            flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200
            ${
              isMoreSelected || showMore
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white border border-white/5'
            }
          `}
        >
          <span>{isMoreSelected ? `More (${selectedCategory})` : 'More'}</span>
          {showMore ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </button>

        {/* Expanded Categories Drawer */}
        {showMore && (
          <div className="w-full flex flex-wrap items-center gap-2 pt-2 border-t border-white/5 animate-fade-in">
            {MORE_CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => onSelectCategory(cat)}
                  className={`
                    px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200
                    ${
                      isActive
                        ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/20 border border-pink-400'
                        : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white border border-white/5'
                    }
                  `}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AnnouncementFilters;
