import { useContext } from 'react';
import AppContext from './context';

export const useAppContext = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used inside AppProvider');
  return ctx;
};

export default useAppContext;
