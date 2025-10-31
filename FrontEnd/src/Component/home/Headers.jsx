import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../common/LanguageSwitcher';
import authService from '../../services/authService';
import "../../Styles/Home/Header.css";

const Headers = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    // Check if user is logged in
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);

    // Listen for login events
    const handleUserLogin = () => {
      const updatedUser = authService.getCurrentUser();
      setUser(updatedUser);
    };

    window.addEventListener('userLoggedIn', handleUserLogin);
    return () => window.removeEventListener('userLoggedIn', handleUserLogin);
  }, []);

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await authService.logout();
      setUser(null);
      setShowDropdown(false);
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getInitials = (fullName) => {
    if (!fullName) return 'U';
    const names = fullName.trim().split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    }
    return fullName[0].toUpperCase();
  };

  return (
    <header className="header">
      <nav className="navbar">
        <div className="nav-links">
          <span className="font-handwriting notranslate" translate="no">DynaVault</span>
          <Link to="/" className="nav-link">{t('nav.home')}</Link>
          <Link to="/map" className="nav-link">{t('nav.map')}</Link>
          <Link to="/timeline" className="nav-link">{t('nav.timeline')}</Link>
          <Link to="/community" className="nav-link">{t('nav.community')}</Link>
          <Link to="/ImageLibrary" className="nav-link">{t('nav.collection')}</Link>
        </div>
        <div className="nav-buttons">
          <LanguageSwitcher />
          <Link to="/community" className="nav-buttonDongGop">{t('nav.join')}</Link>
          
          {user ? (
            <div className="user-menu" ref={dropdownRef}>
              <div 
                className="user-avatar" 
                onClick={() => setShowDropdown(!showDropdown)}
              >
                {getInitials(user.fullName)}
              </div>
              
              {showDropdown && (
                <div className="user-dropdown">
                  <div className="dropdown-header">
                    <div className="dropdown-name">{user.fullName || 'User'}</div>
                    <div className="dropdown-email">{user.email}</div>
                  </div>
                  <div className="dropdown-divider"></div>
                  <Link to="/profile" className="dropdown-item" onClick={() => setShowDropdown(false)}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    Trang cá nhân
                  </Link>
                  <Link to="/settings" className="dropdown-item" onClick={() => setShowDropdown(false)}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="3"></circle>
                      <path d="M12 1v6m0 6v6m7.071-13.071l-4.243 4.243m-5.656 5.656l-4.243 4.243m16.97-.001l-4.243-4.243m-5.656-5.656L1.929 1.93"></path>
                    </svg>
                    Cài đặt
                  </Link>
                  <div className="dropdown-divider"></div>
                  <button className="dropdown-item logout-btn" onClick={handleLogout}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                      <polyline points="16 17 21 12 16 7"></polyline>
                      <line x1="21" y1="12" x2="9" y2="12"></line>
                    </svg>
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="nav-buttonThamGia">{t('nav.login')}</Link>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Headers;