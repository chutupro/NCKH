import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppContext } from '../../context/useAppContext';
import { toast } from 'react-toastify';

const FacebookAuthSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setUser, setAccessToken, setIsAuthenticated } = useAppContext();

  useEffect(() => {
    const handleFacebookAuth = async () => {
      const userParam = searchParams.get('user');
      const tokenParam = searchParams.get('token');

      if (userParam && tokenParam) {
        try {
          const userData = JSON.parse(decodeURIComponent(userParam));
          const token = decodeURIComponent(tokenParam);

          setAccessToken(token);

          await new Promise(resolve => setTimeout(resolve, 100));

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

          setUser(profileData);
          setIsAuthenticated(true);

          const returnToPlaceData = localStorage.getItem('returnToPlace');

          setTimeout(() => {
            if (returnToPlaceData) {

              navigate('/map');
            } else if (profileData.Role === 'Admin') {

              navigate('/admin');
            } else {

              navigate('/');
            }
          }, 1000);
        } catch (error) {
          console.error('Error in Facebook auth:', error);
          toast.error('Có lỗi xảy ra khi xử lý thông tin đăng nhập. Vui lòng thử lại.', {
            position: "top-right",
          });
          navigate('/login');
        }
      } else {
        toast.error('Không tìm thấy thông tin người dùng hoặc token', {
          position: "top-right",
        });
        navigate('/login');
      }
    };

    handleFacebookAuth();
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
