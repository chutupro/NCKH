import React, { useRef } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleDoubleDown, faFolder, faGift, faHome, faRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import "../../Styles/Home/Header.css";
import useAppContext from '../../context/useAppContext';

import { Link } from 'react-router-dom';

const Headers = () => {
  const { isSidebarOpen: isOpen, setIsSidebarOpen: setIsOpen } = useAppContext();
  const timeoutRef = useRef(null);

  const handleClick = () => {
    setIsOpen(!isOpen); // Toggle sidebar on click
  };

  const handleMouseLeave = () => {
    // Close sidebar when mouse leaves
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 200);
  };

  const handleMouseEnterSidebar = () => {
    // Prevent sidebar from closing while mouse is over it
    clearTimeout(timeoutRef.current);
  };

  return (
    <header className="header">
      <nav className="navbar">
        <div className="nav-links">
          <span className="font-handwriting">DynaVault</span>

          <Link to="/" className="nav-link">
            Trang chủ
          </Link>
          <a href="#" className="nav-link">
            Bản đồ
          </a>
          <Link to="/timeline" className="nav-link">
            Timeline
          </Link>
          <div
            className={`nav-item ${isOpen ? 'open' : ''}`}
            onClick={handleClick}
          >
            <a className="nav-link">
              Tư liệu <FontAwesomeIcon icon={faAngleDoubleDown} />
            </a>
            {isOpen && (
              <div
                className="sidebar"
                onMouseEnter={handleMouseEnterSidebar}
                onMouseLeave={handleMouseLeave}
              >
                <div className="sidebar-inner">
                  <div className="menu-column">
                    <div className="menu-item">
                      <Link to="/community" className="menu-link">
                        <FontAwesomeIcon icon={faHome} /> Cộng đồng
                      </Link>
                    </div>
                    <div className="menu-item">
                      <Link to="/ImageLibrary" className="menu-link">
                        <FontAwesomeIcon icon={faFolder} /> Bộ sưu tập
                      </Link>
                    </div>
                  </div>
                  <div className="menu-column">
                    <div className="menu-item">
                      <Link to="/compare" className="menu-link">
                        <FontAwesomeIcon icon={faRightFromBracket} /> Xưa và nay
                      </Link>
                    </div>
                    <div className="menu-item">
                      <Link to="/contribute" className="menu-link">
                        <FontAwesomeIcon icon={faGift} /> Góp ảnh
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="nav-buttons">
          <Link to="/community" className="nav-buttonDongGop">Tham gia</Link>
          <Link to="/login" className="nav-buttonThamGia">Đăng Nhập</Link>
        </div>
      </nav>
    </header>
  );
};

export default Headers;