import api from './api';

export const announcementService = {
  /**
   * Fetch all published announcements with backend sync read status
   * @returns {Promise<Object>}
   */
  async getAnnouncements() {
    const response = await api.get('/api/student/announcements');
    return response.data;
  },

  /**
   * Mark announcement as read in the backend database
   * @param {string} announcementId
   * @returns {Promise<Object>}
   */
  async markAsRead(announcementId) {
    const response = await api.post(`/api/student/announcements/${announcementId}/read`);
    return response.data;
  },

  /**
   * Mark all announcements as read
   * @returns {Promise<Object>}
   */
  async markAllAsRead() {
    const response = await api.post('/api/student/announcements/mark-all-read');
    return response.data;
  },
};

export default announcementService;
