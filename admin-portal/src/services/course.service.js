import api from './api';

export const courseService = {
  // Get all courses (with filters, pagination, etc.)
  getCourses: async (params) => {
    return await api.get('/admin/courses', { params });
  },

  // Get a single course
  getCourse: async (id) => {
    return await api.get(`/admin/courses/${id}`);
  },

  // Create initial draft (via template/wizard)
  createCourse: async (data) => {
    return await api.post('/admin/courses', data);
  },

  // Update course (manual or autosave)
  updateCourse: async (id, data) => {
    return await api.put(`/admin/courses/${id}`, data);
  },

  // Soft delete course
  deleteCourse: async (id) => {
    return await api.delete(`/admin/courses/${id}`);
  },

  // Restore deleted course
  restoreCourse: async (id) => {
    return await api.post(`/admin/courses/${id}/restore`);
  },

  // Update course status (draft, review, published, hidden, archived)
  updateStatus: async (id, status) => {
    return await api.patch(`/admin/courses/${id}/status`, { status });
  },

  // Duplicate course
  duplicateCourse: async (id) => {
    return await api.post(`/admin/courses/${id}/duplicate`);
  },

  // Upload course thumbnail
  uploadThumbnail: async (id, file) => {
    const formData = new FormData();
    formData.append('thumbnail', file);
    return await api.post(`/admin/courses/${id}/thumbnail`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Upload course PDF resource
  uploadPDF: async (id, file, title) => {
    const formData = new FormData();
    formData.append('pdf', file);
    if (title) {
      formData.append('title', title);
    }
    return await api.post(`/admin/courses/${id}/resources/pdf`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Delete course PDF resource
  deletePDF: async (id, resourceId) => {
    return await api.delete(`/admin/courses/${id}/resources/${resourceId}`);
  },

  // Update PDF resource metadata / permissions
  updatePDFPermission: async (id, resourceId, allowDownload) => {
    return await api.patch(`/admin/courses/${id}/resources/${resourceId}`, { allowDownload });
  },

  // Upload lesson PDF notes to R2
  uploadLessonPDF: async (courseId, file) => {
    const formData = new FormData();
    formData.append('pdf', file);
    return await api.post(`/admin/courses/${courseId}/lessons/upload-pdf`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }
};
