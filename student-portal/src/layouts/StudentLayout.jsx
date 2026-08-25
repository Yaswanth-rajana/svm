import React, { memo, useState, useRef, useEffect } from 'react';
import { NavLink, Link, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import useStudent from '../hooks/useStudent';
import useUIStore from '../store/useUIStore';
import ErrorBoundary from '../components/common/ErrorBoundary';
import { ROUTES } from '../constants/routes';
import {
  Home,
  Bell,
  User,
  LogOut,
  Menu,
  X,
  Settings,
  AlertTriangle
} from 'lucide-react';

export const StudentLayout = memo(({ children }) => {
  const { user, logout } = useAuth();
  const { announcements } = useStudent();
  const navigate = useNavigate();

  const mobileMenuOpen = useUIStore((state) => state.mobileMenuOpen);
  const setMobileMenuOpen = useUIStore((state) => state.setMobileMenuOpen);

  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute unread announcements count
  const unreadCount = (announcements || []).filter((a) => !a.read).length;

  const confirmLogout = () => {
    logout();
    setLogoutModalOpen(false);
    navigate(ROUTES.LOGIN, { replace: true });
  };

  const navItems = [
    { name: 'Home', path: ROUTES.DASHBOARD, icon: Home },
    { name: 'Announcements', path: ROUTES.ANNOUNCEMENTS, icon: Bell, unreadBadge: unreadCount },
    { name: 'Profile', path: ROUTES.PROFILE, icon: User },
  ];

  const renderNavLinks = (isMobile = false) => (
    <nav className={`flex ${isMobile ? 'flex-col space-y-2' : 'items-center gap-8'}`}>
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.name}
            to={item.path}
            onClick={() => isMobile && setMobileMenuOpen(false)}
            className={({ isActive }) => `
              flex items-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200
              ${isActive
                ? 'text-pink-400 bg-pink-500/10'
                : 'text-gray-300 hover:text-white'
              }
              ${isMobile ? 'justify-between' : ''}
            `}
          >
            {({ isActive }) => (
              <>
                <div className="flex items-center gap-2">
                  <Icon size={16} className={isActive ? 'text-pink-400' : 'opacity-70'} />
                  <span>{item.name}</span>
                </div>
                {item.unreadBadge > 0 && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-pink-400 bg-pink-500/15 border border-pink-500/30 px-1.5 py-0.5 rounded-full shadow-sm">
                    {item.unreadBadge}
                  </span>
                )}
              </>
            )}
          </NavLink>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-black text-white flex flex-col relative">
      {/* Top Header Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 h-[72px] bg-black/90 backdrop-blur-xl border-b border-white/10 shadow-md flex items-center">
        <div className="w-full px-4 md:px-8 flex items-center justify-between">
          
          {/* Left: Mobile Menu Toggle & Logo */}
          <div className="flex items-center gap-4 w-1/3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:text-white cursor-pointer"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <Link to={ROUTES.DASHBOARD} className="inline-flex items-center cursor-pointer">
              <img
                src="/logo2.png"
                alt="SMVEN"
                className="h-8 md:h-10 w-auto object-contain shrink-0 hover:opacity-80 transition-opacity"
              />
            </Link>
          </div>

          {/* Center: Desktop Navigation */}
          <div className="hidden md:flex items-center justify-center w-1/3">
            {renderNavLinks()}
          </div>

          {/* Right: Actions */}
          <div className="flex items-center justify-end w-1/3 relative" ref={dropdownRef}>
            {/* Profile Dropdown Toggle */}
            <button 
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="w-9 h-9 rounded-full bg-gradient-to-tr from-pink-500 to-purple-500 p-0.5 cursor-pointer shadow-lg shadow-pink-500/20 group"
              aria-label="User menu"
            >
              <div className="w-full h-full rounded-full bg-black flex items-center justify-center group-hover:bg-transparent transition-colors">
                <User size={16} className="text-white" />
              </div>
            </button>

            {/* Dropdown Menu */}
            {profileDropdownOpen && (
              <div className="absolute right-0 top-12 mt-2 w-64 rounded-xl glass-panel border border-white/10 shadow-2xl overflow-hidden animate-fade-in z-50 bg-[#151b23]/95 backdrop-blur-2xl">
                {/* Top Section */}
                <div className="p-4 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-pink-500 to-purple-500 flex items-center justify-center shrink-0">
                      <User size={20} className="text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold text-white truncate">Student</div>
                      <div className="text-xs text-gray-400 truncate" title={user?.email}>{user?.email || 'student@smven.com'}</div>
                    </div>
                  </div>
                </div>

                {/* Middle Section */}
                <div className="p-2 border-b border-white/10">
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      navigate(ROUTES.PROFILE);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    <User size={16} className="opacity-70" />
                    <span>View Profile</span>
                  </button>
                  <button
                    disabled
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm text-gray-500 cursor-not-allowed opacity-70"
                  >
                    <div className="flex items-center gap-3">
                      <Settings size={16} className="opacity-50" />
                      <span>Settings</span>
                    </div>
                    <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded">Coming Soon</span>
                  </button>
                </div>

                {/* Bottom Section */}
                <div className="p-2">
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      setLogoutModalOpen(true);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors cursor-pointer"
                  >
                    <LogOut size={16} />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Navigation Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-[72px] z-30 bg-black border-b border-white/10 shadow-2xl animate-fade-in p-4">
          {renderNavLinks(true)}
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {logoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#151b23] border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
                <AlertTriangle size={24} className="text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Logout?</h3>
                <p className="text-sm text-gray-400 mt-2">Are you sure you want to sign out?</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 w-full">
              <button
                onClick={() => setLogoutModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-white/10 text-white font-semibold hover:bg-white/5 transition-all text-sm cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold shadow-lg shadow-red-500/20 transition-all text-sm cursor-pointer"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex relative min-w-0 pt-[72px]">
        {/* Background radial accent */}
        <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[140px] pointer-events-none" />

        <main className="flex-1 w-full max-w-[1600px] mx-auto min-w-0 p-4 sm:p-6 md:p-8">
          <ErrorBoundary>
            {children || <Outlet />}
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
});

export default StudentLayout;
