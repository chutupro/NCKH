import React, { useState, useEffect } from 'react';
import "../Styles/Banner.css";

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

export default Banner;