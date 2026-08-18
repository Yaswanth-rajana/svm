import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { BookOpen, Users, PlaySquare, Plus, Megaphone, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { dashboardService } from '../../services/dashboard.service';
import { courseService } from '../../services/course.service';
import { StatCard } from '../../components/ui/StatCard';

const SkeletonCard = () => (
  <div className="glass-panel p-6 rounded-2xl animate-pulse">
    <div className="flex justify-between items-start mb-4">
      <div className="h-12 w-12 bg-white/10 rounded-xl"></div>
      <div className="h-6 w-12 bg-white/10 rounded-full"></div>
    </div>
    <div className="h-4 w-24 bg-white/10 rounded mt-4"></div>
    <div className="h-8 w-16 bg-white/10 rounded mt-2"></div>
  </div>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await dashboardService.getStatistics();
        setStats(response.data);
      } catch (error) {
        console.error("Failed to fetch dashboard stats", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const createDraftMutation = useMutation({
    mutationFn: () => courseService.createCourse({ 
      title: 'Untitled Course',
      shortDescription: '', 
      category: 'Uncategorized' 
    }),
    onSuccess: (res) => {
      toast.success('Course draft created successfully');
      navigate(`/courses/edit/${res.data.course._id}`);
    },
    onError: () => toast.error('Failed to create new course draft')
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard Overview</h1>
          <p className="text-gray-400 text-sm mt-1">Welcome back, Super Admin. Here's what's happening today.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm font-medium transition-colors opacity-50 cursor-not-allowed" title="Coming in Phase 2">
            <Megaphone size={16} />
            Announcement
          </button>
          <button 
            onClick={() => createDraftMutation.mutate()}
            disabled={createDraftMutation.isPending}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#ff0064] to-[#8b5cf6] hover:opacity-90 rounded-lg text-sm font-medium text-white transition-opacity shadow-[0_0_20px_rgba(255,0,100,0.3)] disabled:opacity-50"
          >
            {createDraftMutation.isPending ? (
              <RefreshCw size={16} className="animate-spin" />
            ) : (
              <Plus size={16} />
            )}
            Create Course
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          <>
            <StatCard title="Total Courses" value={stats?.totalCourses || 0} icon={BookOpen} />
            <StatCard title="Total Students" value={stats?.totalStudents || 0} icon={Users} />
            <StatCard title="Total Lessons" value={stats?.totalLessons || 0} icon={PlaySquare} />
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
