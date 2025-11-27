import { useEffect, useContext, useRef } from 'react';
import AppContext from '../context/context';
import axios from 'axios';

/**
 * Hook để restore authentication sau khi refresh (F5)
 * 
 * Flow:
 * 1. App mount → Gọi /users/me (backend tự đọc access_token từ cookie)
 * 2. Nếu thành công → restore user session
 * 3. Nếu 401 → user chưa đăng nhập hoặc token hết hạn
 */
export const useAuthRestore = () => {
  const { setUser, setIsAuthenticated, setIsAuthLoading } = useContext(AppContext);
  const hasAttemptedRestore = useRef(false); // Chỉ chạy 1 lần

  useEffect(() => {
    // ✅ Tránh chạy nhiều lần
    if (hasAttemptedRestore.current) return;
    hasAttemptedRestore.current = true;

    const restoreSession = async () => {
      try {
        setIsAuthLoading(true);

        // 🔥 GỌI /users/me - Backend tự đọc access_token từ HttpOnly cookie
        const response = await axios.get('http://localhost:3000/users/me', {
          withCredentials: true, // Quan trọng: Gửi cookie
          timeout: 5000,
        });

        const user = response.data;

        // ✅ Normalize user data (backend trả về PascalCase hoặc camelCase)
        const roleId = user?.RoleID || user?.roleId || null;
        const roleName = user?.Role || user?.role || (
          roleId === 1 ? 'Admin' : 
          roleId === 3 ? 'Moderator' :
          roleId === 4 ? 'Editor' : 
          'User'
        );
        
        const normalizedUser = {
          userId: user?.UserID || user?.userId || null,
          email: user?.Email || user?.email || '',
          fullName: user?.FullName || user?.fullName || '',
          roleId: roleId,
          Role: roleName,
          avatar: user?.profile?.Avatar || user?.profile?.avatar || user?.Avatar || user?.avatar || '/img/default-avatar.png',
        };

        // ✅ Set user state → isAuthenticated = true
        setUser(normalizedUser);
        setIsAuthenticated(true);

        console.log('✅ [useAuthRestore] Session restored:', normalizedUser.email);
      } catch (error) {
        // ❌ 401 = Chưa đăng nhập hoặc token hết hạn
        if (error.response?.status === 401) {
          console.log('⚠️ [useAuthRestore] Not authenticated (401)');
        } else {
          console.error('❌ [useAuthRestore] Error:', error.message);
        }

        // Clear state
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsAuthLoading(false);
      }
    };

    restoreSession();
  }, [setUser, setIsAuthenticated, setIsAuthLoading]);
};

