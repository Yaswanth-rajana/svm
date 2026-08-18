import React, { useState } from 'react';
import { LogOut, ShieldAlert, CheckCircle2 } from 'lucide-react';

export const LogoutCard = ({ onLogout }) => {
  const [loggedOutAll, setLoggedOutAll] = useState(false);

  const handleLogoutEverywhere = () => {
    setLoggedOutAll(true);
    setTimeout(() => {
      if (onLogout) onLogout();
    }, 1200);
  };

  return (
    <div className="p-6 rounded-2xl glass-panel border border-white/10 space-y-4">
      <div className="border-b border-white/10 pb-3">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <LogOut size={18} className="text-pink-400" />
          Account Sessions & Logout
        </h3>
        <p className="text-xs text-gray-400 mt-0.5">
          Sign out of your active student portal session.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
        <div className="space-y-0.5">
          <span className="text-xs font-bold text-white">Active Portal Session</span>
          <p className="text-[11px] text-gray-400">
            Sign out of this browser or invalidate all active portal sessions.
          </p>
        </div>

        {loggedOutAll ? (
          <div className="px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-xs font-bold flex items-center gap-1.5 shrink-0">
            <CheckCircle2 size={14} />
            <span>Logged out everywhere! Redirecting...</span>
          </div>
        ) : (
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Simple Logout */}
            <button
              onClick={onLogout}
              className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white border border-white/10 transition-all active:scale-95"
            >
              Logout
            </button>

            {/* Danger Logout Everywhere */}
            <button
              onClick={handleLogoutEverywhere}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-red-500/15 hover:bg-red-500/25 text-red-300 border border-red-500/30 text-xs font-bold transition-all active:scale-95"
            >
              <ShieldAlert size={14} />
              <span>Logout Everywhere</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LogoutCard;
