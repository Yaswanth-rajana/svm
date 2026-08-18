import api from './api';

// Dashboard service to fetch stats so UI is decoupled from implementation
export const dashboardService = {
  getStatistics: async () => {
    return await api.get('/admin/dashboard/stats');
  }
};
