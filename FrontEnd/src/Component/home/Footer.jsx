import React from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMapMarkerAlt, faPhone, faEnvelope } from "@fortawesome/free-solid-svg-icons";
import { faFacebook, faTwitter, faInstagram, faLinkedin, faYoutube } from "@fortawesome/free-brands-svg-icons";
import "../../Styles/Home/Footer.css";
import { Link, useNavigate } from 'react-router-dom'
import { KNOWN_CODES, labelFor } from '../../util/categoryMap'

const Footer = () => {
  const { t } = useTranslation();
  const navigate = useNavigate()

  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Footer Top */}
        <div className="footer-top">
          <div className="footer-content">
            {/* Company Info */}
            <div className="footer-section">
              <h3 className="footer-logo notranslate" translate="no">DynaVault</h3>
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

            {/* Quick Links (use same routes as header) */}
            <div className="footer-section">
              <h4 className="footer-title">{t('footer.quickLinks')}</h4>
              <ul className="footer-links">
                <li><Link to="/">{t('nav.home')}</Link></li>
                <li><Link to="/map">{t('nav.map')}</Link></li>
                <li><Link to="/timeline">{t('nav.timeline')}</Link></li>
                <li><Link to="/community">{t('nav.community')}</Link></li>
                <li><Link to="/ImageLibrary">{t('nav.collection')}</Link></li>
                <li><Link to="/about">{t('footer.aboutUs')}</Link></li>
              </ul>
            </div>

            {/* Categories (dynamically from util/categoryMap) */}
            <div className="footer-section">
              <h4 className="footer-title">{t('footer.categories')}</h4>
              <ul className="footer-links">
                {['all', ...KNOWN_CODES].map(code => (
                  <li key={code}>
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        // navigate to ImageLibrary with category query param
                        navigate({ pathname: '/ImageLibrary', search: `?category=${encodeURIComponent(code)}` });
                      }}
                    >
                      {labelFor(code, t)}
                    </a>
                  </li>
                ))}
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
