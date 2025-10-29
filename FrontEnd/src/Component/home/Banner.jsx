import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import "../../Styles/Home/Banner.css";
import { useAppContext } from '../../context/useAppContext';
import MapPanel from './MapPanel';

const Banner = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { images, locations, locIndex, showMap, setShowMap } = useAppContext();
  const [query, setQuery] = useState('');

  const bg = images?.[0] || '';
  const currentLocation = locations?.[locIndex % locations.length] || null;
  const goldenBridgeImage = currentLocation?.image || '';
  const mapEmbedUrl = currentLocation?.mapEmbed || '';

  return (
    <section className="banner-hero" style={{ '--bg-image': `url(${bg})`, padding: '40px' }}>
      <div className="banner-inner">
        <div className="banner-left">
          <div className="kicker">Da Nang</div>
          <h1 className="hero-title">{t('banner.title')}</h1>
          <p className="hero-sub">{t('banner.subtitle')}</p>
          <p className="hero-desc">{t('banner.description')}</p>
          <div className="hero-ctas">
            <button
              className="btn-primary"
              onClick={() => navigate('/community')}
            >
              {t('banner.start')}
            </button>
            <input
              className="hero-search"
              placeholder={t('banner.search')}
              aria-label="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const q = (query || '').trim();
                  if (q) navigate(`/ImageLibrary?query=${encodeURIComponent(q)}`);
                }
              }}
            />
          </div>
        </div>

        <div className="banner-right">
          <div className="image-card">
            <img
              src={goldenBridgeImage}
              alt={currentLocation?.name || 'Location image'}
              style={{ cursor: 'pointer' }}
              role="button"
              tabIndex={0}
              onClick={() => setShowMap(s => !s)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  setShowMap(s => !s);
                }
              }}
            />
            <div className="pin">{currentLocation?.name || 'Location'}</div>
            {showMap && mapEmbedUrl && (
              <MapPanel
                location={currentLocation}
                mapEmbedUrl={mapEmbedUrl}
                onClose={() => setShowMap(false)}
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Banner;