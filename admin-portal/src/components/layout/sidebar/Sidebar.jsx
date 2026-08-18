import React from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  Megaphone, 
  Settings, 
  LogOut
} from 'lucide-react';
import { ADMIN_ROUTES } from '../../../constants/routes';
import { useAdminAuth } from '../../../context/AdminAuthContext';

const SIDEBAR_SECTIONS = [
  {
    title: 'OVERVIEW',
    items: [
      { name: 'Dashboard', icon: LayoutDashboard, path: ADMIN_ROUTES.DASHBOARD, active: true },
    ]
  },
  {
    title: 'MANAGEMENT',
    items: [
      { name: 'Courses', icon: BookOpen, path: ADMIN_ROUTES.COURSES, active: true },
      { name: 'Students', icon: Users, path: ADMIN_ROUTES.STUDENTS, active: true },
      { name: 'Announcements', icon: Megaphone, path: ADMIN_ROUTES.ANNOUNCEMENTS, active: true },
    ]
  },
  {
    title: 'SYSTEM',
    items: [
      { name: 'Settings', icon: Settings, path: ADMIN_ROUTES.SETTINGS, active: true },
    ]
  }
];

export const Sidebar = () => {
  const { logout } = useAdminAuth();
  const location = useLocation();

  return (
    <div className="fixed left-0 top-0 h-full bg-black/90 backdrop-blur-xl border-r border-white/10 z-50 flex flex-col w-64">
      {/* Logo Header */}
      <div className="flex h-16 items-center px-4 border-b border-white/10">
        <Link to={ADMIN_ROUTES.DASHBOARD} className="flex items-center gap-2 overflow-hidden py-1 cursor-pointer">
          <img 
            src="/logo2.png" 
            alt="SMVEN" 
            className="h-9 w-auto object-contain shrink-0 hover:opacity-80 transition-opacity" 
          />
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4 scrollbar-hide">
        {SIDEBAR_SECTIONS.map((section, idx) => (
          <div key={idx} className="mb-6">
            <h3 className="px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              {section.title}
            </h3>
            <ul className="space-y-1 px-3">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                const isDisabled = !item.active;
                
                return (
                  <li key={item.name}>
                    {isDisabled ? (
                      <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-500 cursor-not-allowed opacity-60">
                        <Icon size={20} />
                        <div className="flex-1 flex items-center justify-between">
                          <span className="text-sm font-medium">{item.name}</span>
                          <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded text-gray-400">Soon</span>
                        </div>
                      </div>
                    ) : (
                      <NavLink
                        to={item.path}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors duration-200 group relative ${
                          isActive 
                            ? 'bg-gradient-to-r from-[#ff0064]/20 to-transparent text-[#ff4ecd] border-l-2 border-[#ff0064]' 
                            : 'text-gray-400 hover:text-white hover:bg-white/5 border-l-2 border-transparent'
                        }`}
                      >
                        <Icon size={20} className={isActive ? 'text-[#ff4ecd]' : 'group-hover:text-white'} />
                        <span className="text-sm font-medium">{item.name}</span>
                      </NavLink>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      {/* Footer / Logout */}
      <div className="p-4 border-t border-white/10">
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-gray-400 hover:text-[#ff0064] hover:bg-[#ff0064]/10 transition-colors"
        >
          <LogOut size={20} />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
