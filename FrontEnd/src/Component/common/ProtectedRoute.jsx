
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppContext } from '../../context/useAppContext';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, isAuthenticated, isAuthLoading } = useAppContext();
  const location = useLocation();

  if (isAuthLoading) {
    return <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      fontSize: '18px',
      color: '#666'
    }}>Đang kiểm tra phiên đăng nhập...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const userRole = user?.Role || (
    user?.roleId === 1 ? 'Admin' : 
    user?.roleId === 4 ? 'Editor' : 
    'User'
  );

  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {

    alert('⛔ Bạn không có quyền truy cập trang này!');
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
