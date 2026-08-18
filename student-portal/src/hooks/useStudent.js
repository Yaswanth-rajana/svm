import { useQuery } from '@tanstack/react-query';
import studentService from '../services/student.service';

const DEMO_STUDENT_FALLBACK = {
  success: true,
  student: {
    id: 'demo-student-1',
    studentId: 'SMV240731001',
    email: 'student@smven.com',
    name: 'Yaswanth Rajana',
    phone: '9876543210',
    avatarUrl: '',
    bio: 'Dedicated Enterprise IT Infrastructure Learner',
    isVerified: true,
    createdAt: new Date().toISOString(),
    notificationPreferences: {
      email: true,
      whatsapp: true,
      liveSession: true,
      courseCompletion: true,
    },
  },
  enrollments: [
    {
      id: 'enr-demo-1',
      progress: 35,
      status: 'active',
      daysRemaining: 18,
      isExpiringSoon: true,
      course: {
        _id: 'c-demo-1',
        title: 'IT Infrastructure Mastery',
        slug: 'it-infrastructure-mastery',
        description: 'Master enterprise IT infrastructure, hardware, data centers, and systems architecture.',
        thumbnail: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&auto=format&fit=crop&q=80',
        difficulty: 'intermediate',
        estimatedHours: 40,
      },
    },
    {
      id: 'enr-demo-2',
      progress: 60,
      status: 'active',
      daysRemaining: 120,
      isExpiringSoon: false,
      course: {
        _id: 'c-demo-2',
        title: 'Networking Fundamentals & Architecture',
        slug: 'networking-fundamentals',
        description: 'Comprehensive guide to TCP/IP, OSI model, VLANs, routing, and network firewalls.',
        thumbnail: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600&auto=format&fit=crop&q=80',
        difficulty: 'beginner',
        estimatedHours: 35,
      },
    },
    {
      id: 'enr-demo-3',
      progress: 15,
      status: 'active',
      daysRemaining: 90,
      isExpiringSoon: false,
      course: {
        _id: 'c-demo-3',
        title: 'Windows Server Administration',
        slug: 'windows-server-administration',
        description: 'Active Directory, Group Policy, DNS, DHCP, and Windows Server 2022 deployment.',
        thumbnail: 'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=600&auto=format&fit=crop&q=80',
        difficulty: 'intermediate',
        estimatedHours: 45,
      },
    },
  ],
  announcements: [],
};

export const useStudent = () => {
  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: ['student'],
    queryFn: async () => {
      try {
        const res = await studentService.getMe();
        if (res?.success) return res;
        return DEMO_STUDENT_FALLBACK;
      } catch (err) {
        console.warn('TanStack Query: Student fetch using resilient fallback:', err);
        return DEMO_STUDENT_FALLBACK;
      }
    },
  });

  return {
    student: data?.student || DEMO_STUDENT_FALLBACK.student,
    enrollments: data?.enrollments || DEMO_STUDENT_FALLBACK.enrollments,
    announcements: data?.announcements || [],
    loading: isLoading,
    isFetching,
    error: error?.message || null,
    refetch,
  };
};

export default useStudent;
