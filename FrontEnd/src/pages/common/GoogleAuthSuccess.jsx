import React, { useEffect, useContext } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AppContext from '../../context/context';
import { toast } from 'react-toastify';

const GoogleAuthSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setUser, setIsAuthenticated, setAccessToken } = useContext(AppContext);

  useEffect(() => {
    const handleGoogleAuth = async () => {
      try {
        // Lấy user data và token từ URL params
        const userParam = searchParams.get('user');
        const tokenParam = searchParams.get('token');
        
        if (userParam && tokenParam) {
          const user = JSON.parse(decodeURIComponent(userParam));
          const token = decodeURIComponent(tokenParam);
          
          console.log('📱 [GoogleAuth] Token received, length:', token.length);
          
          // Lưu token vào context (giống như đăng nhập thường)
          setAccessToken(token);
          
          // ✅ DELAY 100ms để cookie kịp được browser set
          await new Promise(resolve => setTimeout(resolve, 100));
          
          // Fetch profile với token trong header (vì cookie có thể chưa được set kịp)
          const response = await fetch('/users/profile/me', {
            method: 'GET',
            credentials: 'include', // Gửi cookie kèm theo (nếu có)
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`, // ✅ GỬI TOKEN QUA HEADER
            },
          });

          if (!response.ok) {
            throw new Error('Failed to verify authentication');
          }

          const profileData = await response.json();
          
          // Lưu vào Context
          setUser(profileData);
          setIsAuthenticated(true);
          
          toast.success(`Đăng nhập thành công! Chào mừng ${profileData.fullName || user.fullName}!`, {
            position: "top-right",
            autoClose: 2000,
          });
          
          // Kiểm tra xem có địa điểm cần quay lại không (từ map review)
          const returnToPlaceData = localStorage.getItem('returnToPlace');
          
          // Redirect
          setTimeout(() => {
            if (returnToPlaceData) {
              // Nếu có returnToPlace, redirect về map (không xóa localStorage, để MapPage xử lý)
              navigate('/map');
            } else if (profileData.Role === 'Admin') {
              // Nếu là Admin, redirect về trang admin
              navigate('/admin');
            } else {
              // Nếu không, redirect về trang chủ
              navigate('/');
            }
          }, 500);
        } else {
          throw new Error('No user data or token received');
        }
      } catch (error) {
        console.error('Google auth error:', error);
        toast.error('Đăng nhập Google thất bại! Vui lòng thử lại.', {
          position: "top-right",
        });
        navigate('/login');
      }
    };

    handleGoogleAuth();
  }, [searchParams, setUser, setIsAuthenticated, setAccessToken, navigate]);

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
