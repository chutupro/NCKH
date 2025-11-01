import { useEffect, useContext } from 'react';
import AppContext from '../context/context';
import { setupTokenGetters } from '../services/api';

/**
 * Hook để setup token getters cho axios interceptor
 * Phải gọi trong component bọc bởi AppProvider
 */
export const useSetupApiAuth = () => {
  const { accessToken, setAccessToken } = useContext(AppContext);

  useEffect(() => {
    // Setup getters cho api.js
    setupTokenGetters(
      () => accessToken,  // Getter
      setAccessToken      // Setter
    );
  }, [accessToken, setAccessToken]);
};
