import React, { useState } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleDoubleDown, faHome, faSquare } from "@fortawesome/free-solid-svg-icons";
import "../Styles/Header.css";

const Headers = () => {
  const [isOpen, setIsOpen] = useState(false);
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
          <div className="nav-item">
            <a href="#" onClick={() => setIsOpen(!isOpen)} className="nav-link">
              Tư liệu <FontAwesomeIcon icon={faAngleDoubleDown} />
            </a>
            {isOpen && (
              <div className="sidebar">
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
                        <FontAwesomeIcon icon={faSquare} /> Bộ sưu tập
                      </a>
                      <a href="#" className="menu-link">
                        Tài nguyên
                      </a>
                    </div>
                  </div>
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
                        <FontAwesomeIcon icon={faSquare} /> Bộ sưu tập
                      </a>
                      <a href="#" className="menu-link">
                        Tài nguyên
                      </a>
                    </div>
                  </div>
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
                        <FontAwesomeIcon icon={faSquare} /> Bộ sưu tập
                      </a>
                      <a href="#" className="menu-link">
                        Tài nguyên
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

export default Headers;