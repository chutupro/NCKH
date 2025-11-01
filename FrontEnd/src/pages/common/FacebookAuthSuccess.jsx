import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppContext } from '../../context/useAppContext';
import { toast } from 'react-toastify';

const FacebookAuthSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setUser, setAccessToken, setIsAuthenticated } = useAppContext();

  useEffect(() => {
    const userParam = searchParams.get('user');
    
    if (userParam) {
      try {
        const userData = JSON.parse(decodeURIComponent(userParam));
        
        // Lưu user vào Context
        setUser(userData);
        setIsAuthenticated(true);
        
        // Hiển thị thông báo
        toast.success(`Chào mừng ${userData.fullName}! Đăng nhập Facebook thành công.`, {
          position: "top-right",
          autoClose: 3000,
        });
        
        // Redirect về trang chủ sau 1 giây
        setTimeout(() => {
          navigate('/');
        }, 1000);
      } catch (error) {
        console.error('Error parsing user data:', error);
        toast.error('Có lỗi xảy ra khi xử lý thông tin đăng nhập', {
          position: "top-right",
        });
        navigate('/login');
      }
    } else {
      toast.error('Không tìm thấy thông tin người dùng', {
        position: "top-right",
      });
      navigate('/login');
    }
  }, [searchParams, navigate, setUser, setIsAuthenticated]);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      flexDirection: 'column',
      gap: '20px'
    }}>
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
      <p>Đang xử lý đăng nhập Facebook...</p>
    </div>
  );
};

export default FacebookAuthSuccess;
