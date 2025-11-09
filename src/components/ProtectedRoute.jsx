import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = sessionStorage.getItem('is-authenticated') === 'true';
  const user = JSON.parse(sessionStorage.getItem('user') || 'null');

  if (!isAuthenticated || !user || user.admin !== 1) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;