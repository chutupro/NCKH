import React, { useEffect, useContext } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AppContext from '../../context/context';
import { toast } from 'react-toastify';

const GoogleAuthSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setUser, setIsAuthenticated } = useContext(AppContext);

  useEffect(() => {
    try {
      // Lấy user data từ URL params
      const userParam = searchParams.get('user');
      
      if (userParam) {
        const user = JSON.parse(decodeURIComponent(userParam));
        
        // Lưu vào Context
        setUser(user);
        setIsAuthenticated(true);
        
        toast.success(`Đăng nhập thành công! Chào mừng ${user.fullName}!`, {
          position: "top-right",
          autoClose: 2000,
        });
        
        // Redirect về trang chủ
        setTimeout(() => navigate('/'), 500);
      } else {
        throw new Error('No user data received');
      }
    } catch (error) {
      console.error('Google auth error:', error);
      toast.error('Đăng nhập Google thất bại!', {
        position: "top-right",
      });
      navigate('/login');
    }
  }, [searchParams, setUser, setIsAuthenticated, navigate]);

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      flexDirection: 'column',
      gap: '20px'
    }}>
      <div style={{ fontSize: '48px' }}>✅</div>
      <h2>Đang xử lý đăng nhập...</h2>
      <p>Vui lòng đợi trong giây lát</p>
    </div>
  );
};

export default GoogleAuthSuccess;
