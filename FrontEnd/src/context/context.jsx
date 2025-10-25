import React, { createContext, useEffect, useState, useMemo, useRef } from 'react';

// Banner images and locations - only used in this context
const BANNER_IMAGES = [
  'https://www.agoda.com/wp-content/uploads/2024/08/son-tra-da-nang-vietnam-featured.jpg',
  'https://danangfantasticity.com/wp-content/uploads/2022/02/BA-NA-MO-CUA.jpg'
];

const LOCATIONS = [
  {
    name: "Cầu Vàng",
    image: "https://www.kkday.com/vi/blog/wp-content/uploads/B%C3%A0-N%C3%A0-2.jpg",
    mapEmbed: "https://www.google.com/maps?q=Golden+Bridge+Ba+Na+Hills+Da+Nang&output=embed"
  },
  {
    name: "Cầu Rồng",
    image: "https://danangfantasticity.com/wp-content/uploads/2018/10/cau-rong-top-20-cay-cau-ky-quai-nhat-the-gioi-theo-boredom-therapy.jpg",
    mapEmbed: "https://www.google.com/maps?q=Cau+Rong+Da+Nang&output=embed"
  }
];

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {

  const [currentImage, setCurrentImage] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [locIndex, setLocIndex] = useState(0);
  const [showMap, setShowMap] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const locations = useMemo(() => LOCATIONS, []);

  useEffect(() => {
    const id = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % BANNER_IMAGES.length);
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
    images: BANNER_IMAGES,
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
