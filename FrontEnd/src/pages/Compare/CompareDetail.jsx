import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getImageComparisonById } from '../../API/imageComparisons';
import '../../Styles/CompareCard/CompareDetail.css';
import CompareSlider from '../../Component/Compare/CompareSlider';

const CompareDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    let mounted = true;
    const ac = new AbortController();
    setLoading(true);
    getImageComparisonById(id, ac.signal)
      .then((data) => {
        if (!mounted) return;
        setItem(data || null);
      })
      .catch((err) => {
        if (!mounted) return;
        console.warn(err);
        setItem(null);
      })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; ac.abort(); };
  }, [id]);

  if (loading) {
    return <div className="lib-info-container"><div className="loading">Đang tải...</div></div>;
  }

  if (!item) {
    return (
      <div className="lib-info-container">
        <div className="not-found">
          <h2>Không tìm thấy</h2>
          <Link to="/CompareGallery" className="back-btn">← Quay lại</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="lib-info-container">
      <div className="lib-info-header">
        <button onClick={() => navigate(-1)} className="back-btn">
          <span>←</span> Quay lại
        </button>
        <div className="breadcrumb">
          <Link to="/">Trang chủ</Link>
          <span>/</span>
          <Link to="/compare">Xưa & Nay</Link>
          <span>/</span>
          <span>{item.title}</span>
        </div>
      </div>

      

      <div className="compare-slider-section">
        <h2 className="section-title">So sánh Xưa - Nay</h2>
        <CompareSlider item={item} />
      </div>

      <div className="compare-detail-content">
        <div className="content-section">
          <h3>📍 Vị trí</h3>
          <p>{item.location}</p>
        </div>
        <div className="content-section">
          <h3>📖 Mô tả chi tiết</h3>
          <p>{item.description}</p>
        </div>
      </div>

      <div className="cta-section">
        <h3>Khám phá thêm</h3>
        <div className="cta-buttons">
          <Link to="/compare" className="cta-btn primary">Xem thêm so sánh</Link>
          <Link to="/ImageLibrary" className="cta-btn secondary">Thư viện ảnh</Link>
        </div>
      </div>
    </div>
  );
};

export default CompareDetail;
