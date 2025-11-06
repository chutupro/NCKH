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
  const { setUser, setIsAuthenticated, setAccessToken } = useContext(AppContext);
  const hasAttemptedRestore = useRef(false); // Chỉ chạy 1 lần

  useEffect(() => {
    // ✅ Tránh chạy nhiều lần
    if (hasAttemptedRestore.current) return;
    hasAttemptedRestore.current = true;

    const restoreSession = async () => {
      try {
        console.log('[Auth Restore] Attempting to restore session...');

        // ✅ Kiểm tra xem có cookie nào không (document.cookie chỉ thấy non-httpOnly)
        // Vì refresh_token là HttpOnly nên không thấy được
        // → Chỉ cần try-catch, nếu 401 thì dừng ngay
        
        // Gọi refresh API - HttpOnly cookie tự động gửi
        const response = await authService.refreshToken();

        if (!response?.accessToken) {
          console.log('[Auth Restore] No access token in response');
          return;
        }

        // Backend đã trả về user info
        const { accessToken, user } = response;
        
        const normalizedUser = {
          userId: user?.userId || user?.UserID || null,
          email: user?.email || user?.Email || '',
          fullName: user?.fullName || user?.FullName || '',
          roleId: user?.roleId || user?.RoleID || null,
        };

        // Restore state
        setAccessToken(accessToken);
        setUser(normalizedUser);
        setIsAuthenticated(true);

        console.log('[Auth Restore] ✅ Session restored successfully', normalizedUser);
      } catch (error) {
        // ✅ 401 Unauthorized → Không có valid refresh token
        // → KHÔNG retry, chỉ log và return
        if (error?.response?.status === 401) {
          console.log('[Auth Restore] No valid session (no cookie or expired)');
        } else {
          console.log('[Auth Restore] Failed to restore session:', error.message);
        }
        // Không làm gì - user vẫn ở trạng thái logout
      }
    };

    restoreSession();
  }, [setUser, setIsAuthenticated, setAccessToken]);
};

