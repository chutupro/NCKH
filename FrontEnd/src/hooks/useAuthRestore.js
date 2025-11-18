import { useEffect, useContext, useRef } from 'react';
import AppContext from '../context/context';
import authService from '../services/authService';

/**
 * Hook để restore authentication sau khi refresh (F5)
 * 
 * Flow:
 * 1. App mount → Kiểm tra HttpOnly cookie (refresh_token)
 * 2. Gọi /auth/refresh để lấy accessToken + user info mới
 * 3. Nếu thành công → restore user session
 * 4. Nếu thất bại → giữ trạng thái logout (KHÔNG retry)
 */
export const useAuthRestore = () => {
  const { setUser, setIsAuthenticated, setAccessToken, setIsAuthLoading } = useContext(AppContext);
  const hasAttemptedRestore = useRef(false); // Chỉ chạy 1 lần

  useEffect(() => {
    // ✅ Tránh chạy nhiều lần
    if (hasAttemptedRestore.current) return;
    hasAttemptedRestore.current = true;

    const restoreSession = async () => {
      const timeoutId = setTimeout(() => {
        setIsAuthLoading(false);
      }, 5000);

      try {
        const response = await authService.refreshToken();

        clearTimeout(timeoutId);

        if (!response?.accessToken) {
          setIsAuthLoading(false);
          return;
        }

        const { accessToken, user } = response;
        
        const normalizedUser = {
          userId: user?.userId || user?.UserID || null,
          email: user?.email || user?.Email || '',
          fullName: user?.fullName || user?.FullName || '',
          roleId: user?.roleId || user?.RoleID || null,
          Role: user?.role || 'User',
          avatar: user?.profile?.avatar || user?.avatar || '/img/default-avatar.png',
        };

        setAccessToken(accessToken);
        setUser(normalizedUser);
        setIsAuthenticated(true);
      } catch (error) {
        clearTimeout(timeoutId);
      } finally {
        setIsAuthLoading(false);
      }
    };

    restoreSession();
  }, [setUser, setIsAuthenticated, setAccessToken, setIsAuthLoading]);
};

