import React from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMapMarkerAlt, faPhone, faEnvelope } from "@fortawesome/free-solid-svg-icons";
import { faFacebook, faTwitter, faInstagram, faLinkedin, faYoutube } from "@fortawesome/free-brands-svg-icons";
import "../../Styles/Home/Footer.css";

const Footer = () => {
  const { t } = useTranslation();

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
                {t('footer.description')}
              </p>
              <div className="social-links">
                <button className="social-link facebook" aria-label="Facebook">
                  <FontAwesomeIcon icon={faFacebook} />
                </button>
                <button className="social-link twitter" aria-label="Twitter">
                  <FontAwesomeIcon icon={faTwitter} />
                </button>
                <button className="social-link instagram" aria-label="Instagram">
                  <FontAwesomeIcon icon={faInstagram} />
                </button>
                <button className="social-link linkedin" aria-label="LinkedIn">
                  <FontAwesomeIcon icon={faLinkedin} />
                </button>
                <button className="social-link youtube" aria-label="YouTube">
                  <FontAwesomeIcon icon={faYoutube} />
                </button>
              </div>
            </div>

            {/* Quick Links */}
            <div className="footer-section">
              <h4 className="footer-title">{t('footer.quickLinks')}</h4>
              <ul className="footer-links">
                <li><a href="#explore">{t('footer.explore')}</a></li>
                <li><a href="#timeline">{t('footer.timeline')}</a></li>
                <li><a href="#top-news">{t('footer.news')}</a></li>
                <li><a href="#connect">{t('footer.connect')}</a></li>
                <li><a href="#about">{t('footer.aboutUs')}</a></li>
              </ul>
            </div>

            {/* Categories */}
            <div className="footer-section">
              <h4 className="footer-title">{t('footer.categories')}</h4>
              <ul className="footer-links">
                <li><a href="#architecture">{t('footer.architecture')}</a></li>
                <li><a href="#history">{t('footer.history')}</a></li>
                <li><a href="#culture">{t('footer.culture')}</a></li>
                <li><a href="#traditions">{t('footer.traditions')}</a></li>
                <li><a href="#modern">{t('footer.modern')}</a></li>
              </ul>
            </div>

            {/* Contact Info */}
            <div className="footer-section">
              <h4 className="footer-title">{t('footer.contact')}</h4>
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
              <p>{t('footer.copyright')}</p>
            </div>
            <div className="footer-bottom-links">
              <a href="#privacy">{t('footer.privacy')}</a>
              <a href="#terms">{t('footer.terms')}</a>
              <a href="#cookies">Cookie Policy</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
