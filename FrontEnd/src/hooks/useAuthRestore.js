import { useEffect, useContext, useRef } from 'react';
import AppContext from '../context/context';
import authService from '../services/authService';

export const useAuthRestore = () => {
  const { setUser, setIsAuthenticated, setIsAuthLoading } = useContext(AppContext);
  const hasAttemptedRestore = useRef(false); // Chỉ chạy 1 lần

  useEffect(() => {

    if (hasAttemptedRestore.current) return;
    hasAttemptedRestore.current = true;

    const restoreSession = async () => {
      const timeoutId = setTimeout(() => {
        setIsAuthLoading(false);
      }, 5000);

      try {

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

