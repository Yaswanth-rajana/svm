import { ROLES } from '../utils/permissions';

// API-first service with mock fallback for Phase 1
export const adminAuthService = {
  login: async (credentials) => {
    // TODO: Replace with actual backend call in Phase 2
    // return api.post('/admin/login', credentials);
    
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (credentials.email === 'admin@smven.com' && Boolean(credentials.password)) {
          // Construct token dynamically at runtime to avoid hardcoding JWT signatures in source
          const header = typeof btoa !== 'undefined' ? btoa(JSON.stringify({ alg: "HS256", typ: "JWT" })) : "mock_header";
          const payload = typeof btoa !== 'undefined' ? btoa(JSON.stringify({
            adminId: 'admin_12345',
            name: 'Super Administrator',
            email: 'admin@smven.com',
            role: ROLES.SUPER_ADMIN,
            iat: Math.floor(Date.now() / 1000)
          })) : "mock_payload";
          const mockToken = `${header}.${payload}.mock_signature`;

          resolve({
            data: {
              admin: {
                adminId: 'admin_12345',
                name: 'Super Administrator',
                email: 'admin@smven.com',
                role: ROLES.SUPER_ADMIN,
              },
              token: mockToken,
              expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            }
          });
        } else {
          reject({
            response: {
              data: {
                message: 'Invalid credentials.'
              }
            }
          });
        }
      }, 800); // simulate network latency
    });
  },
};
