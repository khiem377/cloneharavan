import { Navigate, Outlet } from 'react-router-dom';

function getToken() {
  try {
    const stored = localStorage.getItem('admin-auth');
    return stored ? JSON.parse(stored)?.state?.accessToken : null;
  } catch { return null; }
}

export default function ProtectedRoute() {
  const token = getToken();
  if (!token) return <Navigate to="/login" replace />;
  return <Outlet />;
}
