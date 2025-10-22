import React from 'react';
import "../../Styles/Home/Banner.css";
import { useAppContext } from '../../context/context';

const Banner = () => {
  const { images,locations, locIndex, showMap, setShowMap } = useAppContext();

  const bg = images && images.length ? images[0] : '';
  const currentLocation = locations && locations.length ? locations[locIndex % locations.length] : null;
  const goldenBridgeImage = currentLocation ? currentLocation.image : '';
  const mapEmbedUrl = currentLocation ? currentLocation.mapEmbed : '';

  return (
    <section className="banner-hero" style={{ ['--bg-image']: `url(${bg})`, padding: '40px' }}>
      <div className="banner-inner">
        <div className="banner-left">
          <div className="kicker">Da Nang</div>
          <h1 className="hero-title">Dynamic Vault</h1>
          <p className="hero-sub">Bách khoa toàn thư kỹ thuật số tương tác về bảo tồn di sản</p>
          <p className="hero-desc">Bảo tồn và chia sẻ di sản văn hóa phong phú của Đà Nẵng thông qua công nghệ tiên tiến, hợp tác cộng đồng và quản lý nội dung thông minh.</p>
          <div className="hero-ctas">
            <button className="btn-primary">Bắt đầu <span className="arrow">→</span></button>
            <input className="hero-search" placeholder="Tìm kiếm địa danh" aria-label="search" />
          </div>
        </div>

        <div className="banner-right">
          <div className="image-card">

            <img
              src={goldenBridgeImage}
              alt={currentLocation ? currentLocation.name : 'Location image'}
              style={{ cursor: 'pointer' }}
              role="button"
              tabIndex={0}
              onClick={() => setShowMap((s) => !s)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  setShowMap((s) => !s);
                }
              }}
            />
            <div className="pin">{currentLocation ? currentLocation.name : 'Location'}</div>
            {showMap && mapEmbedUrl && (
              <div className="map-panel" role="dialog" aria-label={`Map for ${currentLocation ? currentLocation.name : 'location'}`}>
                <button
                  className="map-close"
                  onClick={() => setShowMap(false)}
                  aria-label="Close map"
                >
                  ×
                </button>
                <iframe
                  title={`${currentLocation ? currentLocation.name : 'Location'} Map`}
                  src={mapEmbedUrl}
                  width="100%"
                  height="300"
                  style={{ border: 0 }}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            )}
            
          </div>
        </div>
      </div>
    </section>
  );
};

export default Banner;