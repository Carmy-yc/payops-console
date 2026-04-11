import type { PropsWithChildren } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../features/auth/store/AuthProvider';
import type { PermissionKey } from '../../shared/constants/permissions';

export function RequireAuth({ children }: PropsWithChildren) {
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}

type RequirePermissionProps = PropsWithChildren<{
  permission: PermissionKey;
}>;

export function RequirePermission({ permission, children }: RequirePermissionProps) {
  const { currentUser } = useAuth();

  if (!currentUser?.permissions.includes(permission)) {
    return <Navigate to="/403" replace />;
  }

  return children;
}

