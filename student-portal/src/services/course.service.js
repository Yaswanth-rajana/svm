import api from './api';

export const courseService = {
  /**
   * Get enrolled courses for authenticated student
   * @returns {Promise<Object>}
   */
  async getMyCourses() {
    const response = await api.get('/api/student/my-courses');
    return response.data;
  },

  /**
   * Get detailed course breakdown with modules and progress
   * @param {string} courseId
   * @returns {Promise<Object>}
   */
  async getCourseDetail(courseId) {
    const response = await api.get(`/api/student/course/${courseId}`);
    return response.data;
  },

  /**
   * Get module details and published lessons
   * @param {string} moduleId
   * @returns {Promise<Object>}
   */
  async getModuleDetail(moduleId) {
    const response = await api.get(`/api/student/module/${moduleId}`);
    return response.data;
  },

  /**
   * Get lesson metadata and notes information
   * @param {string} lessonId
   * @returns {Promise<Object>}
   */
  async getLessonDetail(lessonId) {
    const response = await api.get(`/api/student/lesson/${lessonId}`);
    return response.data;
  },

  /**
   * Get temporary signed thumbnail URL for a course
   * @param {string} courseId
   * @returns {Promise<Object>}
   */
  async getCourseThumbnail(courseId) {
    const response = await api.get(`/api/student/course/${courseId}/thumbnail`);
    return response.data;
  },

  /**
   * Get temporary signed download URL for a course PDF resource
   * @param {string} courseId
   * @param {string} resourceId
   * @returns {Promise<Object>}
   */
  async getCoursePDFDownloadUrl(courseId, resourceId) {
    const response = await api.get(`/api/student/course/${courseId}/resources/${resourceId}/pdf/download`);
    return response.data;
  },

  /**
   * Get temporary signed view URL for a course PDF resource
   * @param {string} courseId
   * @param {string} resourceId
   * @returns {Promise<Object>}
   */
  async getCoursePDFViewUrl(courseId, resourceId) {
    const response = await api.get(`/api/student/course/${courseId}/resources/${resourceId}/pdf/view`);
    return response.data;
  },

  /**
   * Get temporary signed download URL for a lesson notes PDF
   * @param {string} courseId
   * @param {string} lessonId
   * @returns {Promise<Object>}
   */
  async getLessonNotesPDFDownloadUrl(courseId, lessonId) {
    const response = await api.get(`/api/student/course/${courseId}/lessons/${lessonId}/notes/pdf/download`);
    return response.data;
  },

  /**
   * Get temporary signed view URL for a lesson notes PDF
   * @param {string} courseId
   * @param {string} lessonId
   * @returns {Promise<Object>}
   */
  async getLessonNotesPDFViewUrl(courseId, lessonId) {
    const response = await api.get(`/api/student/course/${courseId}/lessons/${lessonId}/notes/pdf/view`);
    return response.data;
  },

  /**
   * Get temporary signed video playback URL for an R2 lesson video
   * @param {string} courseId
   * @param {string} lessonId
   * @returns {Promise<Object>}
   */
  async getLessonVideoPlayUrl(courseId, lessonId) {
    const response = await api.get(`/api/student/course/${courseId}/lessons/${lessonId}/video`);
    return response.data;
  },

  /**
   * Update lesson watched progress
   * @param {string} courseId
   * @param {string} lessonId
   * @param {Object} data - { lastPosition: number, duration: number }
   * @returns {Promise<Object>}
   */
  async updateLessonProgress(courseId, lessonId, data) {
    const response = await api.patch(`/api/student/course/${courseId}/lessons/${lessonId}/progress`, data);
    return response.data;
  },

  /**
   * Get course progress and lesson-level completion breakdown
   * @param {string} courseId
   * @returns {Promise<Object>}
   */
  async getCourseProgress(courseId) {
    const response = await api.get(`/api/student/course/${courseId}/progress`);
    return response.data;
  },
};

export default courseService;

