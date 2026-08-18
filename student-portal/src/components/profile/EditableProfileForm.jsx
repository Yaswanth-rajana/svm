import React, { useState, useEffect } from 'react';
import { User, Phone, Mail, IdCard, Lock, Save, Loader2, CheckCircle2 } from 'lucide-react';

export const EditableProfileForm = ({ student, onSave, updating, updateMessage }) => {
  const [name, setName] = useState(student?.name || '');
  const [phone, setPhone] = useState(student?.phone || '');
  const [bio, setBio] = useState(student?.bio || '');

  useEffect(() => {
    if (student) {
      setName(student.name || '');
      setPhone(student.phone || '');
      setBio(student.bio || '');
    }
  }, [student]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ name, phone, bio });
  };

  return (
    <div className="p-6 rounded-2xl glass-panel border border-white/10 space-y-5">
      <div className="border-b border-white/10 pb-3">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <User size={18} className="text-pink-400" />
          Personal Information
        </h3>
        <p className="text-xs text-gray-400 mt-0.5">
          Update your personal details and public profile information.
        </p>
      </div>

      {updateMessage && (
        <div
          className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
            updateMessage.type === 'success'
              ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
              : 'bg-red-500/10 text-red-300 border border-red-500/20'
          }`}
        >
          <CheckCircle2 size={15} />
          <span>{updateMessage.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Editable: Full Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-300">Full Name</label>
            <div className="relative">
              <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter full name..."
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-pink-500/50 transition-all"
              />
            </div>
          </div>

          {/* Editable: Phone Number */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-300">Phone Number</label>
            <div className="relative">
              <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter phone number..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-pink-500/50 transition-all"
              />
            </div>
          </div>

          {/* Read-only: Registered Email */}
          <div className="space-y-1.5 opacity-75">
            <label className="text-xs font-semibold text-gray-400 flex items-center justify-between">
              <span>Registered Email</span>
              <span className="text-[10px] text-gray-500 font-mono flex items-center gap-1">
                <Lock size={10} /> Read-only
              </span>
            </label>
            <div className="relative">
              <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="email"
                value={student?.email || ''}
                readOnly
                disabled
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-gray-400 cursor-not-allowed"
              />
            </div>
          </div>

          {/* Read-only: Student ID */}
          <div className="space-y-1.5 opacity-75">
            <label className="text-xs font-semibold text-gray-400 flex items-center justify-between">
              <span>Student ID</span>
              <span className="text-[10px] text-gray-500 font-mono flex items-center gap-1">
                <Lock size={10} /> Read-only
              </span>
            </label>
            <div className="relative">
              <IdCard size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                value={student?.studentId || 'SMV240731001'}
                readOnly
                disabled
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-gray-400 font-mono cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Editable: Short Bio */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-300">Short Bio</label>
          <textarea
            rows={2}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Brief bio or learning goals..."
            className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-pink-500/50 transition-all"
          />
        </div>

        {/* Single Primary Button: Save Changes */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={updating}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-pink-500 hover:bg-pink-400 text-xs font-bold text-white shadow-lg shadow-pink-500/20 transition-all active:scale-95 disabled:opacity-50"
          >
            {updating ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save size={15} />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditableProfileForm;
