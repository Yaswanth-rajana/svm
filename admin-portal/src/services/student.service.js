import api from './api';

export const studentService = {
  getEnrollments: async () => {
    return api.get('/admin/students/enrollments');
  },

  enrollStudent: async (data) => {
    return api.post('/admin/students/enroll', data);
  },

  revokeAccess: async (enrollmentId) => {
    return api.delete(`/admin/students/enrollments/${enrollmentId}`);
  },

  resendAccessEmail: async (enrollmentId) => {
    return api.post('/admin/students/resend-access-email', { enrollmentId });
  },
};
