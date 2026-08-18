import api from './api';

export const studentService = {
  /**
   * Get authenticated student profile, active enrollments, and global announcements
   * @returns {Promise<Object>}
   */
  async getMe() {
    const response = await api.get('/api/student/me');
    return response.data;
  },

  /**
   * Update student profile information
   * @param {Object} data
   * @returns {Promise<Object>}
   */
  async updateProfile(data) {
    const response = await api.put('/api/student/profile', data);
    return response.data;
  },

  /**
   * Get student activity log timeline
   * @returns {Promise<Object>}
   */
  async getActivity() {
    const response = await api.get('/api/student/activity');
    return response.data;
  },

  /**
   * Change student portal password
   * @param {Object} data
   * @returns {Promise<Object>}
   */
  async changePassword(data) {
    const response = await api.put('/api/student/change-password', data);
    return response.data;
  },
};

export default studentService;
