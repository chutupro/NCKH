<<<<<<< Updated upstream
import React, { useState, useRef } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleDoubleDown, faFolder, faGift, faGraduationCap, faHome, faRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import "../../Styles/Home/Header.css";
import { faDiscourse } from '@fortawesome/free-brands-svg-icons';

const Headers = () => {
  const [isOpen, setIsOpen] = useState(false);
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

          <a href="#" className="nav-link">
            Khám phá
          </a>
          <a href="#" className="nav-link">
            Bản đồ
          </a>
          <a href="#" className="nav-link">
            Timeline
          </a>
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
                        <FontAwesomeIcon icon={faHome} /> Trang chủ
                      </a>
                      <a href="#" className="menu-link">
                        Kho lưu trữ di sản văn hóa
                      </a>
                    </div>
                    <div className="menu-item">
                      <a href="#" className="menu-link">
                        <FontAwesomeIcon icon={faFolder} /> Bộ sưu tập
                      </a>
                      <a href="#" className="menu-link">
                        Tài nguyên
                      </a>
                    </div>
                  </div>
                  <div className="menu-column">
                    <div className="menu-item">
                      <a href="#" className="menu-link">
                        <FontAwesomeIcon icon={faRightFromBracket} /> Đăng Nhập
                      </a>
                      <a href="#" className="menu-link">
                        Đăng nhập để xem nhiêu hơn
                      </a>
                    </div>
                    <div className="menu-item">
                      <a href="#" className="menu-link">
                        <FontAwesomeIcon icon={faGraduationCap} /> Học Tập
                      </a>
                      <a href="#" className="menu-link">
                        Tài nguyên học tập
                      </a>
                    </div>
                  </div>
                  <div className="menu-column">
                    <div className="menu-item">
                      <a href="#" className="menu-link">
                        <FontAwesomeIcon icon={faDiscourse} /> Khám Phá
                      </a>
                      <a href="#" className="menu-link">
                        Bộ ảnh
                      </a>
                    </div>
                    <div className="menu-item">
                      <a href="#" className="menu-link">
                        <FontAwesomeIcon icon={faGift} /> Góp ảnh
                      </a>
                      <a href="#" className="menu-link">
                        Gốp phần phát triễn web
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="nav-buttons">
          <button className="nav-buttonDongGop">Đóng góp</button>
          <button className="nav-buttonThamGia">Tham gia</button>
        </div>
      </nav>
    </header>
  );
};

=======
import React, { useState, useRef } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleDoubleDown, faFolder, faGift, faGraduationCap, faHome, faRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import "../../Styles/Home/Header.css";
import { faDiscourse } from '@fortawesome/free-brands-svg-icons';

const Headers = () => {
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef(null); // Ref để lưu timeout

  // Mở sidebar
  const handleMouseEnter = () => {
    clearTimeout(timeoutRef.current); // Xóa timeout cũ nếu có
    setIsOpen(true);
  };

  // Đóng sidebar sau delay
  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 200); // Delay 200ms để người dùng di chuột xuống sidebar
  };

  return (
    <header className="header">
      <nav className="navbar">
        <div className="nav-links">
          <span className="font-handwriting">DynaVault</span>

          <a href="#" className="nav-link">
            Khám phá
          </a>
          <a href="#" className="nav-link">
            Bản đồ
          </a>
          <a href="#" className="nav-link">
            Timeline
          </a>
          <div 
            className={`nav-item ${isOpen ? 'open' : ''}`}
            onMouseEnter={handleMouseEnter} // Mở khi hover vào nav-item
            onMouseLeave={handleMouseLeave} // Đóng khi rời khỏi nav-item
          >
            <a className="nav-link">
              Tư liệu <FontAwesomeIcon icon={faAngleDoubleDown} />
            </a>
            {isOpen && (
              <div 
                className="sidebar"
                onMouseEnter={handleMouseEnter} // Giữ mở khi hover vào sidebar
                onMouseLeave={handleMouseLeave} // Đóng khi rời sidebar
              >
                <div className="container">
                  <div className="menu-column">
                    <div className="menu-item">
                      <a href="#" className="menu-link">
                        <FontAwesomeIcon icon={faHome} /> Trang chủ
                      </a>
                      <a href="#" className="menu-link">
                        Kho lưu trữ di sản văn hóa
                      </a>
                    </div>
                    <div className="menu-item">
                      <a href="#" className="menu-link">
                        <FontAwesomeIcon icon={faFolder} /> Bộ sưu tập
                      </a>
                      <a href="#" className="menu-link">
                        Tài nguyên
                      </a>
                    </div>
                  </div>
                  <div className="menu-column">
                    <div className="menu-item">
                      <a href="#" className="menu-link">
                        <FontAwesomeIcon icon={faRightFromBracket} /> Đăng Nhập
                      </a>
                      <a href="#" className="menu-link">
                        Đăng nhập để xem nhiêu hơn
                      </a>
                    </div>
                    <div className="menu-item">
                      <a href="#" className="menu-link">
                        <FontAwesomeIcon icon={faGraduationCap} /> Học Tập
                      </a>
                      <a href="#" className="menu-link">
                        Tài nguyên học tập
                      </a>
                    </div>
                  </div>
                  <div className="menu-column">
                    <div className="menu-item">
                      <a href="#" className="menu-link">
                        <FontAwesomeIcon icon={faDiscourse} /> Khám Phá
                      </a>
                      <a href="#" className="menu-link">
                        Bộ ảnh
                      </a>
                    </div>
                    <div className="menu-item">
                      <a href="#" className="menu-link">
                        <FontAwesomeIcon icon={faGift} /> Góp ảnh
                      </a>
                      <a href="#" className="menu-link">
                        Gốp phần phát triễn web
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="nav-buttons">
          <button className="nav-buttonDongGop">Đóng góp</button>
          <button className="nav-buttonThamGia">Tham gia</button>
        </div>
      </nav>
    </header>
  );
};

>>>>>>> Stashed changes
export default Headers;