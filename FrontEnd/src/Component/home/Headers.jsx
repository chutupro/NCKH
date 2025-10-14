import React, { useRef } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleDoubleDown, faFolder, faGift, faGraduationCap, faHome, faRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import "../../Styles/Home/Header.css";
import useAppContext from '../../context/useAppContext';
import { faDiscourse } from '@fortawesome/free-brands-svg-icons';
import { Link } from 'react-router-dom';

const Headers = () => {
  const { isSidebarOpen: isOpen, setIsSidebarOpen: setIsOpen } = useAppContext();
  const timeoutRef = useRef(null);

  const handleMouseEnter = () => {
    clearTimeout(timeoutRef.current);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 200);
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
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <a className="nav-link">
              Tư liệu <FontAwesomeIcon icon={faAngleDoubleDown} />
            </a>
            {isOpen && (
              <div
                className="sidebar"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <div className="container">
                  <div className="menu-column">
                    <div className="menu-item">
                      <a href="#" className="menu-link">
                        <FontAwesomeIcon icon={faHome} /> Cộng đồng
                      </a>
                    </div>
                    <div className="menu-item">
                      <Link to="/ImageLibrary" className="menu-link">
                        <FontAwesomeIcon icon={faFolder} /> Bộ sưu tập
                      </Link>
                    </div>
                  </div>
                  <div className="menu-column">
                    <div className="menu-item">
                      <a href="#" className="menu-link">
                        <FontAwesomeIcon icon={faRightFromBracket} /> Xưa và nay
                      </a>
                    </div>
                    <div className="menu-item">
                      <a href="#" className="menu-link">
                        <FontAwesomeIcon icon={faGraduationCap} /> Học Tập
                      </a>
                    </div>
                  </div>
                  <div className="menu-column">
                    <div className="menu-item">
                      <a href="#" className="menu-link">
                        <FontAwesomeIcon icon={faDiscourse} /> Khám Phá
                      </a>
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
          <button className="nav-buttonDongGop">Tham gia</button>
          <button className="nav-buttonThamGia">Đăng Nhập</button>
        </div>
      </nav>
    </header>
  );
};

export default Headers;