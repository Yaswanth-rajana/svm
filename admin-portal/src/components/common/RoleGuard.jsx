import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { hasPermission } from '../../utils/permissions';
import { ADMIN_ROUTES } from '../../constants/routes';

export const RoleGuard = ({ children, requiredRoles = [] }) => {
  const { admin, loading } = useAdminAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0b0f14]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#ff0064] border-t-transparent"></div>
      </div>
    );
  }

  if (!admin) {
    return <Navigate to={ADMIN_ROUTES.LOGIN} replace />;
  }

  if (!hasPermission(admin.role, requiredRoles)) {
    return <Navigate to={ADMIN_ROUTES.FORBIDDEN} replace />;
  }

  return <>{children}</>;
};
