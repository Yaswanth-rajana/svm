import React from 'react';
import { ShieldCheck, Monitor, Clock, IdCard, Calendar, AlertTriangle, RefreshCw } from 'lucide-react';

export const AccountInfoCard = ({ student, enrollments = [] }) => {
  if (!student) return null;

  const { studentId = 'SMV240731001', createdAt } = student;

  const formattedMemberDate = createdAt
    ? new Date(createdAt).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : 'July 31, 2026';

  // Find course enrollments expiring soon
  const expiringEnrollments = (enrollments || []).filter(
    (e) => e.daysRemaining !== null && e.daysRemaining <= 30
  );

  return (
    <div className="p-6 rounded-2xl glass-panel border border-white/10 space-y-5">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <IdCard size={18} className="text-pink-400" />
          Account & Device Information
        </h3>
        <span className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Portal Active
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Student ID */}
        <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-1">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Student ID</span>
          <p className="text-sm font-mono font-bold text-white">{studentId}</p>
        </div>

        {/* Member Since */}
        <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-1">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Member Since</span>
          <p className="text-sm font-semibold text-white flex items-center gap-1.5">
            <Calendar size={14} className="text-pink-400" />
            <span>{formattedMemberDate}</span>
          </p>
        </div>

        {/* Current Device */}
        <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-1">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Current Device</span>
          <p className="text-sm font-semibold text-white flex items-center gap-1.5">
            <Monitor size={14} className="text-purple-400" />
            <span>Chrome 139 • macOS</span>
          </p>
        </div>

        {/* Last Login */}
        <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-1">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Last Login</span>
          <p className="text-sm font-mono font-medium text-white flex items-center gap-1.5">
            <Clock size={14} className="text-cyan-400" />
            <span>Active Session</span>
          </p>
        </div>
      </div>

      {/* Course Access Expiry Warning Banner */}
      {expiringEnrollments.length > 0 ? (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <AlertTriangle size={20} className="text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold text-amber-300">Course Access Expiry Notice</h4>
              <p className="text-xs text-amber-200/80">
                {expiringEnrollments[0].course?.title || 'Enrolled Course'} access expires in{' '}
                <span className="font-bold text-amber-400">{expiringEnrollments[0].daysRemaining} days</span>.
              </p>
            </div>
          </div>

          <button className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0">
            <RefreshCw size={13} />
            <span>Renew Access</span>
          </button>
        </div>
      ) : (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2 text-xs text-emerald-300">
          <ShieldCheck size={16} className="text-emerald-400 shrink-0" />
          <span>Full Unrestricted Course Access Granted (No Expiry Pending)</span>
        </div>
      )}
    </div>
  );
};

export default AccountInfoCard;
