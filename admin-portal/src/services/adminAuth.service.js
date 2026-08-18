import { ROLES } from '../utils/permissions';

// API-first service with mock fallback for Phase 1
export const adminAuthService = {
  login: async (credentials) => {
    // TODO: Replace with actual backend call in Phase 2
    // return axios.post('/api/admin/login', credentials);
    
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (credentials.email === 'admin@smven.com' && (credentials.password === 'SmvAdmin#2026!' || credentials.password === 'admin123')) {
          resolve({
            data: {
              admin: {
                adminId: 'admin_12345',
                name: 'Super Administrator',
                email: 'admin@smven.com',
                role: ROLES.SUPER_ADMIN,
              },
              token: 'mock-jwt-token-789',
              expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            }
          });
        } else {
          reject({
            response: {
              data: {
                message: 'Invalid credentials. Use admin@smven.com / SmvAdmin#2026!'
              }
            }
          });
        }
      }, 800); // simulate network latency
    });
  },
};
