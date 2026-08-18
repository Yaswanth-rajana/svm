import React, { useState } from 'react';
import { Search, Bell, Menu, User } from 'lucide-react';
import { useUIStore } from '../../../store/uiStore';
import { useAdminAuth } from '../../../context/AdminAuthContext';
import Breadcrumbs from '../../common/Breadcrumbs';

const TopNavbar = () => {
  const { toggleSidebar, notificationsOpen, setNotificationsOpen } = useUIStore();
  const { admin, logout } = useAdminAuth();
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <header className="h-16 flex items-center justify-between px-6 bg-black/90 backdrop-blur-xl border-b border-white/10 sticky top-0 z-40">
      <div className="flex items-center gap-4">
        {/* Mobile Sidebar Toggle - hidden on desktop via CSS in future */}
        <button 
          onClick={toggleSidebar}
          className="lg:hidden text-gray-400 hover:text-white"
        >
          <Menu size={24} />
        </button>
        
        {/* Breadcrumbs Placeholder */}
        <Breadcrumbs />
      </div>

      <div className="flex items-center gap-4">
        {/* Global Search Bar */}
        <div className="relative hidden md:block">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text"
            placeholder="Search anything..."
            className="w-64 bg-white/5 border border-white/10 rounded-full py-1.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-[#ff0064]/50 focus:ring-1 focus:ring-[#ff0064]/50 transition-all placeholder-gray-500"
          />
        </div>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="p-2 text-gray-400 hover:text-white transition-colors relative"
          >
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#ff0064]"></span>
          </button>
          
          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-[#1a0b2e] border border-white/10 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] overflow-hidden z-50">
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <h3 className="font-semibold text-white">Notifications</h3>
                <span className="text-xs text-[#ff0064] cursor-pointer">Mark all as read</span>
              </div>
              <div className="p-8 text-center text-gray-400 text-sm">
                <Bell size={24} className="mx-auto mb-2 opacity-20" />
                No new notifications
              </div>
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="relative ml-2">
          <button 
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#8b5cf6] to-[#ff0064] flex items-center justify-center overflow-hidden border border-white/20">
              <User size={16} className="text-white" />
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-white leading-tight">{admin?.name || 'Admin'}</p>
              <p className="text-xs text-gray-400 leading-tight">{admin?.role || 'Super Admin'}</p>
            </div>
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-[#1a0b2e] border border-white/10 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-white/10 md:hidden">
                <p className="text-sm font-medium text-white">{admin?.name || 'Admin'}</p>
                <p className="text-xs text-gray-400">{admin?.role || 'Super Admin'}</p>
              </div>
              <button 
                onClick={logout}
                className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-white/5 transition-colors"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopNavbar;
