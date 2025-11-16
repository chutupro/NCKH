import React, { createContext, useEffect, useState, useMemo, useRef } from 'react';
import { setupTokenGetters } from '../services/api'

// Banner images and locations - only used in this context
const BANNER_IMAGES = [
  'https://www.agoda.com/wp-content/uploads/2024/08/son-tra-da-nang-vietnam-featured.jpg',
  'https://danangfantasticity.com/wp-content/uploads/2022/02/BA-NA-MO-CUA.jpg'
];

const LOCATIONS = [
  {
    name: "Cầu Vàng",
    image: "https://www.kkday.com/vi/blog/wp-content/uploads/B%C3%A0-N%C3%A0-2.jpg",
    mapEmbed: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3792.597!2d107.9914583!3d15.996842988!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3142197153536e11%3A0x6cfe8dc6379f6e9!2sGolden%20Bridge!5e0!3m2!1svi!2s!4v1699999999999!5m2!1svi!2s"
  },
  {
    name: "Cầu Rồng",
    image: "https://danangfantasticity.com/wp-content/uploads/2018/10/cau-rong-top-20-cay-cau-ky-quai-nhat-the-gioi-theo-boredom-therapy.jpg",
    mapEmbed: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3834.28571!2d108.2235971!3d16.0596824!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x314219c792252a83%3A0xfc14e3a044436af!2sDragon%20Bridge!5e0!3m2!1svi!2s!4v1699999999999!5m2!1svi!2s"
  }
];

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {

  const [currentImage, setCurrentImage] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessToken, setAccessToken] = useState(null); // ✅ LƯU ACCESS_TOKEN TRONG MEMORY
  const [isAuthLoading, setIsAuthLoading] = useState(true); // ✅ THÊM: Trạng thái loading auth
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
    accessToken,        // ✅ THÊM
    setAccessToken,     // ✅ THÊM
    isAuthLoading,      // ✅ THÊM
    setIsAuthLoading,   // ✅ THÊM
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

  // Wire api client token getters so axios will attach Authorization header
  useEffect(() => {
    // setupTokenGetters is safe to call; if it throws we don't need to handle it further
    try {
      setupTokenGetters(() => accessToken, setAccessToken)
    } catch (e) {
      void e
    }
  }, [accessToken, setAccessToken])

  // DEBUG: log accessToken/user changes to help diagnose auth timing
  useEffect(() => {
    try {
      console.debug('[AppContext] accessToken changed', { accessToken })
    } catch (e) { void e }
  }, [accessToken])

  useEffect(() => {
    try {
      console.debug('[AppContext] user changed', { user })
    } catch (e) { void e }
  }, [user])

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export default AppContext;
