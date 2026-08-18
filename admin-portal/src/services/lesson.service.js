import api from './api';

export const lessonService = {
  getLessons: async (moduleId) => {
    return api.get(`/admin/modules/${moduleId}/lessons`);
  },

  getLesson: async (lessonId) => {
    return api.get(`/admin/lessons/${lessonId}`);
  },

  createLesson: async (moduleId, data) => {
    return api.post(`/admin/modules/${moduleId}/lessons`, data);
  },

  updateLesson: async (lessonId, data) => {
    return api.put(`/admin/lessons/${lessonId}`, data);
  },

  deleteLesson: async (lessonId) => {
    return api.delete(`/admin/lessons/${lessonId}`);
  },

  updateStatus: async (lessonId, status) => {
    return api.patch(`/admin/lessons/${lessonId}/status`, { status });
  },

  reorderLessons: async (updates) => {
    return api.patch(`/admin/lessons/reorder`, { updates });
  },

  duplicateLesson: async (lessonId) => {
    return api.post(`/admin/lessons/${lessonId}/duplicate`);
  },

  initializeVideoUpload: async (courseId, lessonId, fileData) => {
    return api.post(`/admin/courses/${courseId}/lessons/${lessonId}/video/upload/init`, fileData);
  },

  getUploadPartUrl: async (courseId, lessonId, partData) => {
    return api.post(`/admin/courses/${courseId}/lessons/${lessonId}/video/upload/part`, partData);
  },

  completeVideoUpload: async (courseId, lessonId, uploadData) => {
    return api.post(`/admin/courses/${courseId}/lessons/${lessonId}/video/upload/complete`, uploadData);
  },

  abortVideoUpload: async (courseId, lessonId, uploadData) => {
    return api.post(`/admin/courses/${courseId}/lessons/${lessonId}/video/upload/abort`, uploadData);
  },
};
