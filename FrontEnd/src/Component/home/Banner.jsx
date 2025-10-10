<<<<<<< Updated upstream
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

=======
import React, { useState, useEffect } from 'react';
import "../../Styles/Home/Banner.css";

const Banner = () => {
  const [currentImage, setCurrentImage] = useState(0);
  const images = [
    "https://www.agoda.com/wp-content/uploads/2024/08/son-tra-da-nang-vietnam-featured.jpg",
    "https://danangfantasticity.com/wp-content/uploads/2022/02/BA-NA-MO-CUA.jpg"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 3000); 
    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className="landing-container" style={{ backgroundImage: `url(${images[currentImage]})` }}>
      <h1>Kho tàng di sản Đà Nẵng - Câu chuyện sông Đông</h1>
      <p>
        Khám phá những câu chuyện ẩn giấu trong từng ngõ phố, từng di tích lịch sử. Chung
        tôi mới bàn giao hơn 1000 tài liệu về khoảnh khắc quan trọng trong thành phố.
      </p>
      <div className="nav-buttons">
        <button className="nav-buttonThamGia">Tham gia</button>
        <button className="nav-buttonDongGop">Đóng góp</button>
      </div>
    </div>
  );
};

>>>>>>> Stashed changes
export default Banner;