import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "../../Styles/Home/Banner.css";
import { useAppContext } from '../../context/useAppContext';
import MapPanel from './MapPanel';

const Banner = () => {
  // Replaced i18n calls with Vietnamese literals (vi.json)
  const navigate = useNavigate();
  const { images, locations, locIndex, showMap, setShowMap } = useAppContext();
  const [query, setQuery] = useState('');

  const bg = images?.[0] || '';
  const safeLocLength = locations?.length || 1;
  const currentLocation = locations?.[locIndex % safeLocLength] || null;
  const goldenBridgeImage = currentLocation?.image || '';
  const mapEmbedUrl = currentLocation?.mapEmbed || '';

  return (
    <section 
      className="banner-hero" 
      style={{ 
        backgroundImage: bg ? `url(${bg})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        padding: '40px'
      }}
    >
      <div className="banner-inner">
        <div className="banner-left">
          <div className="kicker">Da Nang</div>
          <h1 className="hero-title">Dynamic Vault</h1>
          <p className="hero-sub">Bách khoa toàn thư kỹ thuật số tương tác về bảo tồn di sản</p>
          <p className="hero-desc">Bảo tồn và chia sẻ di sản văn hóa phong phú của Đà Nẵng thông qua công nghệ tiên tiến, hợp tác cộng đồng và quản lý nội dung thông minh.</p>
          <div className="hero-ctas">
            <button
              className="btn-primary"
              onClick={() => navigate('/community')}
            >
              Bắt đầu
            </button>
            <input
              className="hero-search"
              placeholder={"Tìm kiếm địa danh"}
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
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Image clicked! Current showMap:', showMap, 'Will toggle to:', !showMap);
                setShowMap(prev => {
                  console.log('setShowMap called, prev:', prev, 'next:', !prev);
                  return !prev;
                });
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setShowMap(s => !s);
                }
              }}
            />
            <div className="pin">{currentLocation?.name || 'Location'}</div>
            {console.log('🗺️ Banner render - showMap:', showMap, 'mapEmbedUrl:', mapEmbedUrl ? 'EXISTS' : 'MISSING')}
            {showMap && mapEmbedUrl ? (
              <MapPanel
                location={currentLocation}
                mapEmbedUrl={mapEmbedUrl}
                onClose={() => {
                  console.log('MapPanel close clicked');
                  setShowMap(false);
                }}
              />
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Banner;