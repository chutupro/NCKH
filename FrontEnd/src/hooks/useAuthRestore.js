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
      // ✅ Timeout fallback: Nếu sau 5 giây vẫn chưa xong → force set loading = false
      const timeoutId = setTimeout(() => {
        console.log('[Auth Restore] ⏰ Timeout - forcing isAuthLoading = false');
        setIsAuthLoading(false);
      }, 5000);

      try {
        console.log('[Auth Restore] Attempting to restore session...');

        // ✅ Kiểm tra xem có cookie nào không (document.cookie chỉ thấy non-httpOnly)
        // Vì refresh_token là HttpOnly nên không thấy được
        // → Chỉ cần try-catch, nếu 401 thì dừng ngay
        
        // Gọi refresh API - HttpOnly cookie tự động gửi
        const response = await authService.refreshToken();

        clearTimeout(timeoutId); // ✅ Clear timeout on success

        if (!response?.accessToken) {
          console.log('[Auth Restore] No access token in response');
          setIsAuthLoading(false); // ✅ Xong loading
          return;
        }

        // Backend đã trả về user info
        const { accessToken, user } = response;
        
        const normalizedUser = {
          userId: user?.userId || user?.UserID || null,
          email: user?.email || user?.Email || '',
          fullName: user?.fullName || user?.FullName || '',
          roleId: user?.roleId || user?.RoleID || null,
          Role: user?.role || 'User', // ✅ THÊM ROLE NAME
          avatar: user?.profile?.avatar || user?.avatar || '/img/default-avatar.png', // ✅ THÊM AVATAR
        };

        // Restore state
        setAccessToken(accessToken);
        setUser(normalizedUser);
        setIsAuthenticated(true);

        console.log('[Auth Restore] ✅ Session restored successfully', normalizedUser);
      } catch (error) {
        clearTimeout(timeoutId); // ✅ Clear timeout on error
        // ✅ 401 Unauthorized → Không có valid refresh token
        // → KHÔNG retry, chỉ log và return
        console.log('[Auth Restore] ❌ Error caught:', error);
        if (error?.response?.status === 401 || error?.status === 401 || error?.statusCode === 401) {
          console.log('[Auth Restore] No valid session (no cookie or expired)');
        } else {
          console.log('[Auth Restore] Failed to restore session:', error);
        }
        // Không làm gì - user vẫn ở trạng thái logout
      } finally {
        console.log('[Auth Restore] ✅ Setting isAuthLoading = false');
        setIsAuthLoading(false); // ✅ Luôn set loading = false khi xong
      }
    };

    restoreSession();
  }, [setUser, setIsAuthenticated, setAccessToken, setIsAuthLoading]);
};

