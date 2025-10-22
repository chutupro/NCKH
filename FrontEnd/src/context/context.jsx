import React, { createContext, useEffect, useState, useMemo } from 'react';
import constants from '../util/constant';

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {

  const [currentImage, setCurrentImage] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [locIndex, setLocIndex] = useState(0);
  const [showMap, setShowMap] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const locations = useMemo(() => constants.locations || [], []);

  useEffect(() => {
    const id = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % (constants.IMAGES?.length || 1));
    }, 2000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!locations || locations.length <= 1 || showMap) return undefined;
    const id = setInterval(() => {
      setLocIndex((i) => (i + 1) % locations.length);
    }, 2000);
    return () => clearInterval(id);
  }, [locations, showMap]);

  const value = {
    images: constants.IMAGES,
    currentImage,
    setCurrentImage,
    searchQuery,
    setSearchQuery,
    user,
    setUser,
    isAuthenticated,
    setIsAuthenticated,
    locations,
    locIndex,
    setLocIndex,
    showMap,
    isSidebarOpen,
    setIsSidebarOpen,
    setShowMap,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export default AppContext;

// Re-export the hook for backwards compatibility (some files import it from context.jsx)
export { useAppContext } from './useAppContext';
