import React, { createContext, useEffect, useState, useMemo, useRef } from 'react';
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

  // --- CompareCard global drag registry & global listeners ---
  const compareHandlersRef = useRef({}); // id -> { onMove, onUp }
  const draggingIdRef = useRef(null);
  const listenersAttachedRef = useRef(false);

  const onGlobalMove = (e) => {
    const id = draggingIdRef.current;
    if (!id) return;
    const handlers = compareHandlersRef.current[id];
    if (handlers && typeof handlers.onMove === 'function') handlers.onMove(e);
  };

  const onGlobalUp = (e) => {
    const id = draggingIdRef.current;
    if (!id) return;
    const handlers = compareHandlersRef.current[id];
    if (handlers && typeof handlers.onUp === 'function') handlers.onUp(e);
    draggingIdRef.current = null;
  };

  const attachGlobalListeners = () => {
    if (listenersAttachedRef.current) return;
    window.addEventListener('mousemove', onGlobalMove);
    window.addEventListener('mouseup', onGlobalUp);
    window.addEventListener('touchmove', onGlobalMove);
    window.addEventListener('touchend', onGlobalUp);
    listenersAttachedRef.current = true;
  };

  useEffect(() => {
    return () => {
      if (listenersAttachedRef.current) {
        window.removeEventListener('mousemove', onGlobalMove);
        window.removeEventListener('mouseup', onGlobalUp);
        window.removeEventListener('touchmove', onGlobalMove);
        window.removeEventListener('touchend', onGlobalUp);
        listenersAttachedRef.current = false;
      }
      compareHandlersRef.current = {};
      draggingIdRef.current = null;
    };
  }, []);

  const registerCompare = (id, handlers) => {
    if (!id) return;
    compareHandlersRef.current[id] = handlers || {};
  };

  const unregisterCompare = (id) => {
    if (!id) return;
    delete compareHandlersRef.current[id];
    if (draggingIdRef.current === id) draggingIdRef.current = null;
  };

  const startCompareDrag = (id) => {
    if (!id) return;
    draggingIdRef.current = id;
    attachGlobalListeners();
  };

  const stopCompareDrag = () => {
    draggingIdRef.current = null;
  };

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
    registerCompare,
    unregisterCompare,
    startCompareDrag,
    stopCompareDrag,
    isSidebarOpen,
    setIsSidebarOpen,
    setShowMap,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export default AppContext;

// Re-export the hook for backwards compatibility (some files import it from context.jsx)
export { useAppContext } from './useAppContext';
