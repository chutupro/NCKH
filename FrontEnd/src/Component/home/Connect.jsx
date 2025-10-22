import React from 'react';
import "../../Styles/Home/Connect.css";

const Connect = () => {
  return (
    <section className="connect-section">
      <div className="connect-container">
        <div className="connect-header">
          <h3 className="connect-subtitle">Kết nối</h3>
          <h1 className="connect-title">Chia sẻ và lưu giữ di sản Đà Nẵng</h1>
          <p className="connect-description">
            Chúng tôi mong muốn xây dựng một không gian chung để mọi người cùng góp phần bảo tồn và lan tỏa giá trị văn hóa.
          </p>
        </div>
        
        
        <div className="connect-actions">
          <button className="connect-btn-primary">Gửi tư liệu</button>
          <a href="#" className="connect-link">Tìm hiểu thêm →</a>
        </div>
      </div>
      
      {/* Image Container */}
      <div className="image-container">
        <div className="placeholder-image">
          <img 
            src="https://nhacxua.vn/wp-content/uploads/2021/07/da-nang-39.jpg" 
            alt="Đà Nẵng heritage" 
            className="heritage-image"
            loading="lazy"
          />
        </div>
      </div>
    </section>
  );
};

export default Connect;
