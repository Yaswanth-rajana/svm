import { createContext, useState, useEffect, useCallback } from 'react';
import { getSession, saveSession, clearSession } from '../utils/storage';
import { authService } from '../services/auth.service';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Restore persistent session on mount
  useEffect(() => {
    const initializeAuth = () => {
      const session = getSession();
      if (session && session.email) {
        setUser({
          email: session.email,
          studentId: session.studentId || null,
        });
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  /**
   * Request OTP for email
   */
  const requestOtp = useCallback(async (email) => {
    return await authService.sendOtp(email);
  }, []);

  /**
   * Verify OTP and log in student
   */
  const verifyAndLogin = useCallback(async (email, otp) => {
    const result = await authService.verifyOtp(email, otp);
    if (result.success || result.verified) {
      const sessionData = {
        email,
        studentId: result.studentId || null,
        token: result.token || null,
      };
      saveSession(sessionData);
      setUser({ email, studentId: result.studentId || null });
      setIsAuthenticated(true);
      return result;
    } else {
      throw new Error(result.message || 'OTP verification failed');
    }
  }, []);

  /**
   * Login with Email and Password
   */
  const loginWithPassword = useCallback(async (email, password, rememberMe = false) => {
    const result = await authService.loginWithPassword(email, password, rememberMe);
    if (result.success) {
      const sessionData = {
        email,
        studentId: result.studentId || null,
        token: result.token || null,
      };
      saveSession(sessionData);
      setUser({ email, studentId: result.studentId || null, passwordCreated: result.passwordCreated });
      setIsAuthenticated(true);
      return result;
    } else {
      throw new Error(result.message || 'Login failed');
    }
  }, []);

  /**
   * Set Password
   */
  const setPassword = useCallback(async (password) => {
    const result = await authService.setPassword(password);
    if (result.success) {
      setUser((prev) => ({ ...prev, passwordCreated: true }));
    }
    return result;
  }, []);

  /**
   * Change Password
   */
  const changePassword = useCallback(async (currentPassword, newPassword) => {
    return await authService.changePassword(currentPassword, newPassword);
  }, []);

  /**
   * Reset Password via OTP
   */
  const resetPassword = useCallback(async (email, otp, newPassword) => {
    return await authService.resetPassword(email, otp, newPassword);
  }, []);

  /**
   * Logout current student
   */
  const logout = useCallback(() => {
    clearSession();
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const value = {
    user,
    isAuthenticated,
    isLoading,
    requestOtp,
    verifyAndLogin,
    loginWithPassword,
    setPassword,
    changePassword,
    resetPassword,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
