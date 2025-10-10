import React from 'react';
import "../../Styles/Home/Banner.css";
import { useAppContext } from '../../context/context';

const Banner = () => {
  const { images, currentImage, timeline } = useAppContext();

  const bg = images && images.length ? images[currentImage] : '';

  return (
    <section className="banner-hero" style={{ ['--bg-image']: `url(${bg})` }}>
      <div className="banner-inner">
        <div className="banner-left">
          <div className="kicker">Da Nang</div>
          <h1 className="hero-title">Dynamic Vault</h1>
          <p className="hero-sub">Interactive Digital Encyclopedia for Heritage Conservation</p>
          <p className="hero-desc">Preserving and sharing Da Nang's rich cultural heritage through cutting-edge technology, community collaboration, and intelligent content management.</p>
          <div className="hero-ctas">
            <button className="btn-primary">Get Started <span className="arrow">→</span></button>
            <input className="hero-search" placeholder="" aria-label="search" />
          </div>
        </div>

        <div className="banner-right">
          <div className="image-card">
            <img src="https://images.unsplash.com/photo-1549880338-65ddcdfd017b?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3&s=2b3a6d6d4b0f6f0f3c6c" alt="Da Nang street vendor" />
            <div className="pin">Da Nang</div>
            <div className="timeline-card">
              <div className="timeline-title">Heritage Timeline</div>
              <ul>
                {timeline && timeline.map((t, i) => (
                  <li key={i}><span className={`dot ${t.color}`}></span> {t.label}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Banner;