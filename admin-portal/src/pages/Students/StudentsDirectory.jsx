import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Users, Search, Plus, Calendar, Mail, 
  BookOpen, Trash2, ShieldCheck, X, RefreshCw, AlertCircle, Edit, Check 
} from 'lucide-react';
import toast from 'react-hot-toast';
import { studentService } from '../../services/student.service';
import { courseService } from '../../services/course.service';

const StudentsDirectory = () => {
  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form State
  const [email, setEmail] = useState('');
  const [formAccesses, setFormAccesses] = useState({}); // { [courseId]: { checked, expiryDate, enrollmentId } }

  // Queries
  const { 
    data: enrollments = [], 
    isLoading: isEnrollmentsLoading, 
    refetch: refetchEnrollments 
  } = useQuery({
    queryKey: ['enrollments'],
    queryFn: async () => {
      const response = await studentService.getEnrollments();
      return response.data.enrollments || [];
    }
  });

  const { data: coursesData } = useQuery({
    queryKey: ['courses-simple'],
    queryFn: async () => {
      const response = await courseService.getCourses({ limit: 100 });
      return response.data.courses || [];
    }
  });
  const courses = coursesData || [];

  // Group Enrollments by Student Email
  const groupedStudents = React.useMemo(() => {
    const grouped = {};
    enrollments.forEach(e => {
      const studentEmail = e.studentId?.email;
      if (!studentEmail) return;
      
      const emailKey = studentEmail.toLowerCase().trim();
      if (!grouped[emailKey]) {
        grouped[emailKey] = {
          student: e.studentId,
          courses: []
        };
      }
      grouped[emailKey].courses.push({
        enrollmentId: e._id,
        course: e.courseId,
        accessStart: e.accessStart || e.createdAt,
        accessEnd: e.accessEnd,
        status: e.status
      });
    });
    return Object.values(grouped);
  }, [enrollments]);

  // Initializing course selection list in form
  const initFormAccesses = (studentRecord = null) => {
    const initial = {};
    courses.forEach(c => {
      const existing = studentRecord?.courses?.find(ec => ec.course?._id === c._id);
      if (existing) {
        initial[c._id] = {
          checked: true,
          expiryDate: existing.accessEnd ? new Date(existing.accessEnd).toISOString().split('T')[0] : '',
          enrollmentId: existing.enrollmentId
        };
      } else {
        initial[c._id] = { checked: false, expiryDate: '', enrollmentId: null };
      }
    });
    setFormAccesses(initial);
  };

  // Open modal for adding access
  const handleOpenCreateModal = () => {
    setEmail('');
    setIsEditing(false);
    initFormAccesses();
    setIsModalOpen(true);
  };

  // Open modal for editing access
  const handleOpenEditModal = (studentRecord) => {
    setEmail(studentRecord.student.email);
    setIsEditing(true);
    initFormAccesses(studentRecord);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsEditing(false);
    setEmail('');
    setFormAccesses({});
  };

  // Checkbox state handler
  const handleCheckboxChange = (courseId, checked) => {
    setFormAccesses(prev => ({
      ...prev,
      [courseId]: {
        ...prev[courseId],
        checked
      }
    }));
  };

  // Expiry Date state handler
  const handleExpiryChange = (courseId, expiryDate) => {
    setFormAccesses(prev => ({
      ...prev,
      [courseId]: {
        ...prev[courseId],
        expiryDate
      }
    }));
  };

  // Submit Handler: concurrent grant/updates and revokes
  const handleGrantAccess = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Please enter the student email');
      return;
    }

    const toEnroll = [];
    const toRevoke = [];

    courses.forEach(c => {
      const state = formAccesses[c._id];
      if (!state) return;

      if (state.checked) {
        toEnroll.push({
          courseId: c._id,
          accessEnd: state.expiryDate || null
        });
      } else if (!state.checked && state.enrollmentId) {
        toRevoke.push(state.enrollmentId);
      }
    });

    if (toEnroll.length === 0 && toRevoke.length === 0) {
      toast.error('Please select at least one course');
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading(isEditing ? 'Updating course accesses...' : 'Granting course accesses...');

    try {
      // 1. Grant/Update access to selected courses
      const enrollPromises = toEnroll.map(item => 
        studentService.enrollStudent({
          email: email.trim().toLowerCase(),
          courseId: item.courseId,
          accessEnd: item.accessEnd
        })
      );

      // 2. Revoke access from deselected courses
      const revokePromises = toRevoke.map(enrollmentId => 
        studentService.revokeAccess(enrollmentId)
      );

      await Promise.all([...enrollPromises, ...revokePromises]);

      toast.success(isEditing ? 'Accesses updated successfully' : 'Accesses granted successfully', { id: toastId });
      refetchEnrollments();
      handleCloseModal();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update course accesses', { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Resend course access email for a specific enrollment
  const handleResendAccessEmail = async (enrollmentId, courseTitle, studentEmail) => {
    const toastId = toast.loading(`Resending access email for ${courseTitle}...`);
    try {
      const res = await studentService.resendAccessEmail(enrollmentId);
      toast.success(res.data?.message || `Access email sent to ${studentEmail}`, { id: toastId });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend access email', { id: toastId });
    }
  };

  // Revoke All Accesses for a student
  const handleRevokeAllAccess = (studentRecord) => {
    const confirmMessage = `Are you sure you want to revoke ALL course accesses for:\nStudent: ${studentRecord.student.email}?`;
    if (window.confirm(confirmMessage)) {
      const revokePromises = studentRecord.courses.map(c => 
        studentService.revokeAccess(c.enrollmentId)
      );
      
      const toastId = toast.loading('Revoking all accesses...');
      Promise.all(revokePromises)
        .then(() => {
          toast.success('All accesses revoked successfully', { id: toastId });
          refetchEnrollments();
        })
        .catch((err) => {
          toast.error('Failed to revoke access for some courses', { id: toastId });
        });
    }
  };

  // Filters & Search
  const filteredStudents = groupedStudents.filter(record => {
    const matchesSearch = record.student.email?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          record.student.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCourse = courseFilter === '' || record.courses.some(c => c.course?._id === courseFilter);
    return matchesSearch && matchesCourse;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Users className="text-[#ff4ecd]" size={28} />
            Student Directory
          </h1>
          <p className="text-gray-400 text-sm mt-1">Manage student course access credentials and expiries</p>
        </div>
        
        <button 
          onClick={handleOpenCreateModal}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#ff0064] to-[#8b5cf6] hover:opacity-90 rounded-lg text-sm font-bold text-white transition-opacity shadow-[0_0_20px_rgba(255,0,100,0.3)]"
        >
          <Plus size={16} />
          Grant Course Access
        </button>
      </div>

      {/* Toolbar */}
      <div className="glass-panel p-4 rounded-xl flex flex-col md:flex-row justify-between gap-4">
        <div className="flex flex-1 flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by student email or name..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-[#ff0064] transition-colors placeholder:text-gray-500"
            />
          </div>
          <select 
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-[#ff0064] transition-colors"
          >
            <option value="">All Courses</option>
            {courses.map(course => (
              <option key={course._id} value={course._id}>{course.title}</option>
            ))}
          </select>
        </div>

        <button 
          onClick={() => refetchEnrollments()}
          className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-gray-400 hover:text-white transition-colors self-end md:self-auto"
          title="Reload access list"
        >
          <RefreshCw size={18} />
        </button>
      </div>

      {/* Grouped Student Access Table */}
      <div className="glass-panel rounded-xl overflow-hidden border border-white/5 bg-[#0a0d14]/40">
        {isEnrollmentsLoading ? (
          <div className="p-12 text-center text-gray-400 flex flex-col items-center gap-3">
            <RefreshCw className="animate-spin text-[#ff0064]" size={32} />
            <span>Loading student access records...</span>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="p-12 text-center text-gray-500 flex flex-col items-center gap-2">
            <AlertCircle size={36} className="text-gray-600 mb-2" />
            <span className="font-medium text-gray-400">No student access records found</span>
            <p className="text-xs text-gray-500 max-w-sm">
              Use the "Grant Course Access" button above to give a student access to courses.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/5 text-gray-400 text-xs font-mono uppercase tracking-wider">
                  <th className="p-4 font-semibold w-1/3">Student Account</th>
                  <th className="p-4 font-semibold w-1/2">Allowed Courses (Expiries)</th>
                  <th className="p-4 font-semibold text-right w-1/6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredStudents.map((record) => (
                  <tr key={record.student._id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="p-4 align-top">
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-semibold text-white truncate">
                          {record.student.email}
                        </span>
                        <span className="text-xs text-gray-500">
                          {record.student.name && `Name: ${record.student.name}`}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 align-top">
                      <div className="flex flex-wrap gap-2">
                        {record.courses.map(c => {
                          const hasExpired = c.accessEnd && new Date() > new Date(c.accessEnd);
                          return (
                            <span 
                              key={c.enrollmentId} 
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border font-medium transition-colors ${
                                hasExpired 
                                  ? 'bg-red-500/10 text-red-400 border-red-500/20' 
                                  : 'bg-white/5 text-gray-200 border-white/10'
                              }`}
                            >
                              <BookOpen size={12} className="text-[#ff4ecd]" />
                              <span>{c.course?.title || 'Unknown Course'}</span>
                              <span className="text-[10px] text-gray-400 border-l border-white/10 pl-1.5 font-mono">
                                {c.accessEnd ? (
                                  <span className={hasExpired ? 'text-red-400' : 'text-purple-400'}>
                                    Exp: {new Date(c.accessEnd).toLocaleDateString()}
                                  </span>
                                ) : (
                                  <span className="text-emerald-400">Lifetime</span>
                                )}
                              </span>
                              <button
                                onClick={() => handleResendAccessEmail(c.enrollmentId, c.course?.title || 'Course', record.student.email)}
                                className="ml-1 p-0.5 text-gray-400 hover:text-pink-400 hover:bg-white/10 rounded transition-colors"
                                title="Resend course access email"
                              >
                                <Mail size={12} />
                              </button>
                            </span>
                          );
                        })}
                      </div>
                    </td>
                    <td className="p-4 text-right align-top">
                      <div className="flex justify-end gap-1.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleOpenEditModal(record)}
                          className="p-1.5 text-gray-400 hover:text-[#ff4ecd] hover:bg-[#ff4ecd]/10 rounded transition-colors"
                          title="Manage courses access"
                        >
                          <Edit size={15} />
                        </button>
                        <button 
                          onClick={() => handleRevokeAllAccess(record)}
                          className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                          title="Revoke all accesses"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Grant & Edit Access Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-lg glass-panel border border-white/10 rounded-2xl overflow-hidden shadow-2xl animate-in scale-in duration-300">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-white/10 bg-white/5">
              <h3 className="text-lg font-bold text-white">
                {isEditing ? 'Edit Course Access' : 'Grant Course Access'}
              </h3>
              <button 
                onClick={handleCloseModal}
                className="p-1 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleGrantAccess} className="p-5 space-y-4">
              {/* Student Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Student Email *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                  <input 
                    type="email" 
                    required
                    disabled={isEditing}
                    placeholder="student@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#ff0064] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Course Selection (Multi-select Checklist) */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
                  Select Allowed Courses *
                </label>
                
                {courses.length === 0 ? (
                  <p className="text-xs text-gray-500 italic">No published courses available.</p>
                ) : (
                  <div className="max-h-64 overflow-y-auto border border-white/10 rounded-xl bg-black/35 p-3 space-y-3 custom-scrollbar">
                    {courses.map(course => {
                      const accessState = formAccesses[course._id] || { checked: false, expiryDate: '' };
                      return (
                        <div 
                          key={course._id} 
                          className={`p-3 rounded-xl border transition-all duration-200 ${
                            accessState.checked 
                              ? 'border-[#ff0064]/30 bg-[#ff0064]/5 shadow-[0_0_15px_rgba(255,0,100,0.05)]' 
                              : 'border-white/5 bg-white/[0.01] hover:border-white/10'
                          }`}
                        >
                          {/* Course Label and Checkbox */}
                          <label className="flex items-center gap-3.5 cursor-pointer select-none">
                            <div className="relative flex items-center justify-center shrink-0">
                              <input 
                                type="checkbox" 
                                checked={accessState.checked}
                                onChange={(e) => handleCheckboxChange(course._id, e.target.checked)}
                                className="sr-only"
                              />
                              <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${
                                accessState.checked 
                                  ? 'bg-[#ff0064] border-[#ff0064]' 
                                  : 'border-white/20 bg-black/40 hover:border-[#ff0064]/60'
                              }`}>
                                {accessState.checked && <Check size={13} className="text-white stroke-[3px]" />}
                              </div>
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-white truncate leading-snug">
                                {course.title}
                              </p>
                              <span className="text-[9px] uppercase font-bold tracking-wider font-mono text-purple-400 mt-0.5 block">
                                {course.category}
                              </span>
                            </div>
                          </label>

                          {/* Slide-open Expiry Datepicker */}
                          {accessState.checked && (
                            <div className="mt-3 pt-3 border-t border-white/5 flex items-center gap-4 pl-8 animate-fade-in">
                              <span className="text-xs text-gray-400 shrink-0 flex items-center gap-1">
                                <Calendar size={13} />
                                Expiry Date:
                              </span>
                              <div className="relative flex-1">
                                <input 
                                  type="date" 
                                  value={accessState.expiryDate}
                                  min={new Date().toISOString().split('T')[0]}
                                  onChange={(e) => handleExpiryChange(course._id, e.target.value)}
                                  onClick={(e) => {
                                    try {
                                      e.target.showPicker();
                                    } catch (err) {
                                      console.warn(err);
                                    }
                                  }}
                                  className="w-full bg-black/60 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#ff0064] transition-colors"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Form Actions */}
              <div className="flex gap-3 pt-4 border-t border-white/10">
                <button 
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 py-2.5 px-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm font-semibold text-white transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 px-4 bg-gradient-to-r from-[#ff0064] to-[#8b5cf6] hover:opacity-90 rounded-lg text-sm font-bold text-white transition-opacity disabled:opacity-50 flex justify-center items-center gap-2"
                >
                  {isSubmitting && <RefreshCw size={14} className="animate-spin" />}
                  {isSubmitting 
                    ? (isEditing ? 'Updating...' : 'Granting...') 
                    : (isEditing ? 'Update Access' : 'Grant Access')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentsDirectory;
