import api from './api';

export const moduleService = {
  // Get all modules for a course
  getModules: async (courseId) => {
    return await api.get(`/admin/courses/${courseId}/modules`);
  },

  // Get module by ID
  getModule: async (moduleId) => {
    return await api.get(`/admin/modules/${moduleId}`);
  },

  // Create a new module
  createModule: async (courseId, data) => {
    return await api.post(`/admin/courses/${courseId}/modules`, data);
  },

  // Update a module
  updateModule: async (moduleId, data) => {
    return await api.put(`/admin/modules/${moduleId}`, data);
  },

  // Soft delete a module
  deleteModule: async (moduleId) => {
    return await api.delete(`/admin/modules/${moduleId}`);
  },

  // Update module status (draft, published, archived)
  updateStatus: async (moduleId, status) => {
    return await api.patch(`/admin/modules/${moduleId}/status`, { status });
  },

  // Reorder modules
  reorderModules: async (updates) => {
    return await api.patch(`/admin/modules/reorder`, { updates });
  },

  // Duplicate module
  duplicateModule: async (moduleId) => {
    return await api.post(`/admin/modules/${moduleId}/duplicate`);
  }
};
