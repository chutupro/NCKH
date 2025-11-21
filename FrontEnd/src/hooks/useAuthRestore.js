import { useEffect, useContext, useRef } from 'react';
import AppContext from '../context/context';
import authService from '../services/authService';

/**
 * Hook để restore authentication sau khi refresh (F5)
 * 
 * Flow:
 * 1. App mount → Kiểm tra HttpOnly cookie (refresh_token)
 * 2. Gọi /auth/refresh để lấy cookie mới
 * 3. Gọi /users/me để lấy user info
 * 4. Nếu thành công → restore user session
 * 5. Nếu thất bại → giữ trạng thái logout (KHÔNG retry)
 */
export const useAuthRestore = () => {
  const { setUser, setIsAuthenticated, setIsAuthLoading } = useContext(AppContext);
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
        // 🔥 GỌI /auth/refresh + /users/me
        const response = await authService.refreshToken();

        clearTimeout(timeoutId);

        if (!response?.user) {
          setIsAuthLoading(false);
          return;
        }

        const { user } = response;
        
        const normalizedUser = {
          userId: user?.userId || user?.UserID || null,
          email: user?.email || user?.Email || '',
          fullName: user?.fullName || user?.FullName || '',
          roleId: user?.roleId || user?.RoleID || null,
          Role: user?.role || 'User',
          avatar: user?.profile?.avatar || user?.avatar || '/img/default-avatar.png',
        };

        // 🔥 KHÔNG set accessToken vì đã trong cookie
        setUser(normalizedUser);
        setIsAuthenticated(true);
        setIsAuthenticated(true);
      } catch (error) {
        clearTimeout(timeoutId);
      } finally {
        setIsAuthLoading(false);
      }
    };

    restoreSession();
  }, [setUser, setIsAuthenticated, setIsAuthLoading]);
};

