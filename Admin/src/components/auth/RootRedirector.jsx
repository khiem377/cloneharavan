import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { getDefaultRedirectPath } from '../../utils/permissionUtils';

export default function RootRedirector() {
  const user = useAuthStore((state) => state.user);
  const targetPath = getDefaultRedirectPath(user);
  return <Navigate to={targetPath} replace />;
}
