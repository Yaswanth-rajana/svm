export const ROLES = {
  SUPER_ADMIN: 'Super Admin',
  INSTRUCTOR: 'Instructor',
  CONTENT_MANAGER: 'Content Manager',
};

export const hasPermission = (userRole, requiredRoles) => {
  if (!userRole) return false;
  if (!requiredRoles || requiredRoles.length === 0) return true;
  return requiredRoles.includes(userRole);
};
