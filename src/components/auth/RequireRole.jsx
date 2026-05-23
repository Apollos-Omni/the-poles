import React from 'react';
import { useAuth } from '@/lib/AuthContext';
import AccessDenied from '@/pages/AccessDenied';
import { userHasRole } from '@/lib/rbac';

export default function RequireRole({ roles, children }) {
  const { user, isLoadingAuth, isLoadingPublicSettings } = useAuth();

  if (isLoadingAuth || isLoadingPublicSettings) {
    return null;
  }

  if (!userHasRole(user, roles)) {
    return <AccessDenied />;
  }

  return children;
}
