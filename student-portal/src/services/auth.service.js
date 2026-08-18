import api from './api';

export const authService = {
  /**
   * Request OTP via email using existing backend /api/send-otp
   * @param {string} email
   * @returns {Promise<Object>}
   */
  async sendOtp(email) {
    const response = await api.post('/api/send-otp', {
      email,
      channel: 'email',
    });
    return response.data;
  },

  /**
   * Verify OTP using existing backend /api/verify-otp
   * @param {string} email
   * @param {string} otp
   * @returns {Promise<Object>}
   */
  async verifyOtp(email, otp) {
    const response = await api.post('/api/verify-otp', {
      contact: email,
      otp,
    });
    return response.data;
  },

  /**
   * Resend OTP via email using existing backend /api/resend-otp
   * @param {string} email
   * @returns {Promise<Object>}
   */
  async resendOtp(email) {
    const response = await api.post('/api/resend-otp', {
      email,
      channel: 'email',
    });
    return response.data;
  },

  /**
   * Login with Email and Password
   */
  async loginWithPassword(email, password, rememberMe = false) {
    const response = await api.post('/api/auth/login-password', {
      email,
      password,
      rememberMe,
    });
    return response.data;
  },

  /**
   * Set initial password after OTP login
   */
  async setPassword(password) {
    const response = await api.post('/api/auth/set-password', { password });
    return response.data;
  },

  /**
   * Change password from profile
   */
  async changePassword(currentPassword, newPassword) {
    const response = await api.post('/api/auth/change-password', {
      currentPassword,
      newPassword,
    });
    return response.data;
  },

  /**
   * Reset password via OTP
   */
  async resetPassword(email, otp, newPassword) {
    const response = await api.post('/api/auth/reset-password', {
      email,
      otp,
      newPassword,
    });
    return response.data;
  },
};
