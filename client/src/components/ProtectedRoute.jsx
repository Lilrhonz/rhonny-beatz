import { Navigate, useOutletContext, Outlet } from 'react-router-dom';

export default function ProtectedRoute() {
  const context = useOutletContext();
  const { user } = context;

  if (!user) {
    return <Navigate to="/" replace />;
  }
  if (user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <Outlet context={context} />;
}