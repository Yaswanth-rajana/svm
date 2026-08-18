import React, { createContext, useContext, useState, useEffect } from 'react';
import { adminAuthService } from '../services/adminAuth.service';
import toast from 'react-hot-toast';

const AdminAuthContext = createContext(null);

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const storedAdmin = localStorage.getItem('smven_admin');
    const token = localStorage.getItem('smven_admin_token');
    
    if (storedAdmin && token) {
      try {
        setAdmin(JSON.parse(storedAdmin));
      } catch (e) {
        localStorage.removeItem('smven_admin');
        localStorage.removeItem('smven_admin_token');
      }
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      const response = await adminAuthService.login(credentials);
      const { admin: adminData, token } = response.data;
      
      setAdmin(adminData);
      localStorage.setItem('smven_admin', JSON.stringify(adminData));
      localStorage.setItem('smven_admin_token', token);
      
      toast.success('Welcome back, Admin!');
      return true;
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Login failed');
      throw error;
    }
  };

  const logout = () => {
    setAdmin(null);
    localStorage.removeItem('smven_admin');
    localStorage.removeItem('smven_admin_token');
    toast.success('Logged out successfully');
  };

  const value = {
    admin,
    loading,
    isAuthenticated: !!admin,
    login,
    logout,
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};
