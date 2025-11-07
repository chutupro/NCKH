// src/Component/common/ProtectedRoute.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppContext } from '../../context/useAppContext';

/**
 * ProtectedRoute - Bảo vệ routes theo vai trò
 * @param {React.ReactNode} children - Component con cần bảo vệ
 * @param {string[]} allowedRoles - Mảng các vai trò được phép (vd: ['Admin', 'Editor'])
 */
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, isAuthenticated, isAuthLoading } = useAppContext();
  const location = useLocation();

  // ✅ Đợi auth restore xong mới check
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

  // Debug log
  console.log('[ProtectedRoute] User:', user, 'IsAuth:', isAuthenticated, 'AllowedRoles:', allowedRoles);

  // Nếu chưa đăng nhập → redirect về /login
  if (!isAuthenticated) {
    console.log('[ProtectedRoute] Not authenticated, redirecting to /login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Map RoleID sang RoleName nếu chưa có Role field
  // RoleID: 1=Admin, 2=User, 4=Editor
  const userRole = user?.Role || (
    user?.roleId === 1 ? 'Admin' : 
    user?.roleId === 4 ? 'Editor' : 
    'User'
  );
  
  console.log('[ProtectedRoute] User Role:', userRole);

  // Nếu đã đăng nhập nhưng không có quyền → redirect về trang chủ với thông báo
  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    console.log('[ProtectedRoute] Access denied! User role:', userRole, 'Required:', allowedRoles);
    // Hiển thị thông báo lỗi
    alert('⛔ Bạn không có quyền truy cập trang này!');
    return <Navigate to="/" replace />;
  }

  console.log('[ProtectedRoute] Access granted!');
  // Nếu có quyền → render component
  return children;
};

export default ProtectedRoute;
