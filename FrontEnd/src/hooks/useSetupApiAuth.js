import { useEffect, useContext } from 'react';
import AppContext from '../context/context';
import { setupTokenGetters } from '../services/api';

export const useSetupApiAuth = () => {
  const { accessToken, setAccessToken } = useContext(AppContext);

  useEffect(() => {

    setupTokenGetters(
      () => accessToken,  // Getter
      setAccessToken      // Setter
    );
  }, [accessToken, setAccessToken]);
};
