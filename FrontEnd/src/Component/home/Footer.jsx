import React from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMapMarkerAlt, faPhone, faEnvelope } from "@fortawesome/free-solid-svg-icons";
import { faFacebook, faTwitter, faInstagram, faLinkedin, faYoutube } from "@fortawesome/free-brands-svg-icons";
import "../../Styles/Home/Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Footer Top */}
        <div className="footer-top">
          <div className="footer-content">
            {/* Company Info */}
            <div className="footer-section">
              <h3 className="footer-logo">DynaVault</h3>
              <p className="footer-description">
                Kho tàng di sản Đà Nẵng - Nơi lưu giữ và chia sẻ những giá trị văn hóa quý báu của thành phố.
              </p>
              <div className="social-links">
                <a href="#" className="social-link facebook">
                  <FontAwesomeIcon icon={faFacebook} />
                </a>
                <a href="#" className="social-link twitter">
                  <FontAwesomeIcon icon={faTwitter} />
                </a>
                <a href="#" className="social-link instagram">
                  <FontAwesomeIcon icon={faInstagram} />
                </a>
                <a href="#" className="social-link linkedin">
                  <FontAwesomeIcon icon={faLinkedin} />
                </a>
                <a href="#" className="social-link youtube">
                  <FontAwesomeIcon icon={faYoutube} />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div className="footer-section">
              <h4 className="footer-title">Liên kết nhanh</h4>
              <ul className="footer-links">
                <li><a href="#explore">Khám phá</a></li>
                <li><a href="#timeline">Dòng thời gian</a></li>
                <li><a href="#top-news">Tin mới</a></li>
                <li><a href="#connect">Kết nối</a></li>
                <li><a href="#about">Về chúng tôi</a></li>
              </ul>
            </div>

            {/* Categories */}
            <div className="footer-section">
              <h4 className="footer-title">Danh mục</h4>
              <ul className="footer-links">
                <li><a href="#architecture">Kiến trúc</a></li>
                <li><a href="#history">Lịch sử</a></li>
                <li><a href="#culture">Văn hóa</a></li>
                <li><a href="#traditions">Truyền thống</a></li>
                <li><a href="#modern">Hiện đại</a></li>
              </ul>
            </div>

            {/* Contact Info */}
            <div className="footer-section">
              <h4 className="footer-title">Liên hệ</h4>
              <div className="contact-info">
                <div className="contact-item">
                  <FontAwesomeIcon icon={faMapMarkerAlt} className="contact-icon" />
                  <span>Đại học Duy Tân, Đà Nẵng</span>
                </div>
                <div className="contact-item">
                  <FontAwesomeIcon icon={faPhone} className="contact-icon" />
                  <span>0123456789</span>
                </div>
                <div className="contact-item">
                  <FontAwesomeIcon icon={faEnvelope} className="contact-icon" />
                  <span>phandoanh2110@gmail.com</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <div className="copyright">
              <p>&copy; 2024 DynaVault. Tất cả quyền được bảo lưu.</p>
            </div>
            <div className="footer-bottom-links">
              <a href="#privacy">Chính sách bảo mật</a>
              <a href="#terms">Điều khoản sử dụng</a>
              <a href="#cookies">Cookie Policy</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
