import React from 'react';
import "../../Styles/Home/Header.css";

import { Link } from 'react-router-dom';

const Headers = () => {
  return (
    <header className="header">
      <nav className="navbar">
        <div className="nav-links">
          <span className="font-handwriting">DynaVault</span>

          <Link to="/" className="nav-link">
            Trang chủ
          </Link>
          <Link to="/map" className="nav-link">Bản đồ</Link>
          <Link to="/timeline" className="nav-link">
            Timeline
          </Link>
          <Link to="/community" className="nav-link">
            Cộng đồng
          </Link>
          <Link to="/ImageLibrary" className="nav-link">
            Bộ sưu tập
          </Link>
          <Link to="/contribute" className="nav-link">
            Góp ảnh
          </Link>
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