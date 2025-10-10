import React, { createContext, useContext, useEffect, useState } from 'react';
import { IMAGES, TIMELINE } from '../util/constant';

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {

  const [currentImage, setCurrentImage] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const id = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % IMAGES.length);
    }, 3000);
    return () => clearInterval(id);
  }, []);

  const value = {
    images: IMAGES,
    currentImage,
    setCurrentImage,
    searchQuery,
    setSearchQuery,
    user,
    setUser,
    isAuthenticated,
    setIsAuthenticated,
    timeline: TIMELINE,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used inside AppProvider');
  return ctx;
};

export default AppContext;
