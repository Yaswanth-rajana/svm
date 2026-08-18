import React, { useState } from 'react';
import { ShieldAlert, LogOut, CheckCircle2, Lock, Monitor, Clock } from 'lucide-react';

export const SecurityCard = ({ onLogout }) => {
  const [loggedOutAll, setLoggedOutAll] = useState(false);

  const handleLogoutEverywhere = () => {
    setLoggedOutAll(true);
    setTimeout(() => {
      if (onLogout) onLogout();
    }, 1500);
  };

  return (
    <div className="p-6 rounded-2xl glass-panel border border-white/10 space-y-5">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <ShieldAlert size={18} className="text-pink-400" />
          Profile Security & Sessions
        </h3>
        <span className="text-xs text-gray-400">Authentication & Access Control</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-white flex items-center gap-1.5">
              <Monitor size={14} className="text-purple-400" /> Current Active Session
            </span>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              Active Now
            </span>
          </div>
          <p className="text-xs text-gray-300">Chrome 139 Browser on macOS Operating System</p>
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-gray-400 pt-1">
            <Clock size={11} className="text-pink-400" />
            <span>Authenticated 15 minutes ago</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-white flex items-center gap-1.5">
              <Lock size={14} className="text-cyan-400" /> Portal Security Status
            </span>
            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
              Secure Auth
            </span>
          </div>
          <p className="text-xs text-gray-300">JWT Token-based session verification with encrypted OTP validation.</p>
        </div>
      </div>

      {/* Logout Everywhere CTA */}
      <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <h4 className="text-xs font-bold text-white">Revoke All Active Sessions</h4>
          <p className="text-[11px] text-gray-400">
            Sign out of all logged-in devices across browsers and mobile apps.
          </p>
        </div>

        {loggedOutAll ? (
          <div className="px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-xs font-bold flex items-center gap-1.5">
            <CheckCircle2 size={14} />
            <span>Logged out everywhere! Redirecting...</span>
          </div>
        ) : (
          <button
            onClick={handleLogoutEverywhere}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-bold transition-all active:scale-95 shrink-0"
          >
            <LogOut size={15} />
            <span>Logout Everywhere</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default SecurityCard;
