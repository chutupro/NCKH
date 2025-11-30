import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
// LanguageSwitcher removed from header per request
import authService from '../../services/authService';
import { useAppContext } from '../../context/useAppContext';
import "../../Styles/Home/Header.css";

const Headers = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, setUser, setAccessToken, setIsAuthenticated } = useAppContext(); // ✅ DÙNG CONTEXT
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

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
      // ✅ CLEAR CONTEXT
      setUser(null);
      setAccessToken(null);
      setIsAuthenticated(false);
      setShowDropdown(false);
      navigate('/login'); // ✅ CHUYỂN VỀ TRANG LOGIN
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
          {user ? (
            <div className="user-menu" ref={dropdownRef}>
              <div 
                className="user-avatar" 
                onClick={() => setShowDropdown(!showDropdown)}
                style={{
                  backgroundImage: user.avatar ? `url(${user.avatar})` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                {!user.avatar && getInitials(user.fullName)}
              </div>
              
              {showDropdown && (
                <div className="user-dropdown">
                  <div className="dropdown-header">
                    <div className="dropdown-name">{user.fullName || 'User'}</div>
                    <div className="dropdown-email">{user.email}</div>
                  </div>

                  {/* Personal is intentionally placed above language per user request */}
                  <Link to="/Personal" className="dropdown-item" onClick={() => setShowDropdown(false)}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    Trang cá nhân
                  </Link>

                  <div className="dropdown-divider"></div>

                  <div className="dropdown-language">
                    <button
                      type="button"
                      className="dropdown-item"
                      onClick={() => {
                        // debug + robust navigation: close dropdown then navigate
                        console.log('User clicked language in dropdown')
                        setShowDropdown(false)
                        try {
                          navigate('/language')
                        } catch (e) {
                          console.warn('navigate failed, falling back to location.href', e)
                          window.location.href = '/language'
                        }
                        setTimeout(() => {
                          if (typeof window !== 'undefined' && window.location.pathname !== '/language') {
                            window.location.href = '/language'
                          }
                        }, 150)
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 8 }}>
                        <path d="M12 2v20M2 12h20" />
                      </svg>
                      Ngôn ngữ
                    </button>
                  </div>

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