import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RoleRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-blood-200 border-t-blood-600 rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-500 font-medium">Checking role permissions...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    // Redirect to their appropriate dashboard based on role
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    if (user.role === 'donor') return <Navigate to="/donor/dashboard" replace />;
    if (user.role === 'requester') return <Navigate to="/requester/dashboard" replace />;
    return <Navigate to="/" replace />;
  }

  return children;
};

export default RoleRoute;
