import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import articles from '../../util/mockArticles';
import compareList from '../../util/compareList';
import '../../Styles/ImageLibrary/ImageLibraryInformation.css';

const ImageLibraryInformation = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const articleId = Number(id);
  const article = articles.find(a => a.id === articleId);

  if (!article) {
    return (
      <div className="lib-info-container">
        <div className="not-found">
          <h2>Bài viết không tìm thấy</h2>
          <Link to="/ImageLibrary" className="back-btn">← Quay lại thư viện</Link>
        </div>
      </div>
    );
  }

  // Get related compare items
  const relatedCompares = article.relatedCompares 
    ? compareList.filter(c => article.relatedCompares.includes(c.id)).slice(0, 2)
    : [];

  return (
    <div className="lib-info-container">
      {/* Header with back button */}
      <div className="lib-info-header">
        <button onClick={() => navigate(-1)} className="back-btn">
          <span>←</span> Quay lại
        </button>
        <div className="breadcrumb">
          <Link to="/">Trang chủ</Link>
          <span>/</span>
          <Link to="/ImageLibrary">Thư viện ảnh</Link>
          <span>/</span>
          <span>{article.title}</span>
        </div>
      </div>

      {/* Hero Section */}
      <div className="lib-info-hero">
        <div className="hero-image" style={{ backgroundImage: `url(${article.image})` }}>
          <div className="hero-overlay">
            <span className="hero-category">{article.category}</span>
          </div>
        </div>
        <div className="hero-content">
          <h1 className="hero-title">{article.title}</h1>
          <div className="hero-meta">
            <span className="meta-item">📅 Năm {article.date}</span>
            <span className="meta-item">❤️ {article.likes} lượt thích</span>
          </div>
          <p className="hero-description">{article.description}</p>
        </div>
      </div>

      {/* Related Compare Section */}
      {relatedCompares.length > 0 && (
        <div className="related-section">
          <h2 className="section-title">Ảnh Xưa và Nay</h2>
          <p className="section-subtitle">Khám phá sự thay đổi qua thời gian</p>
          <div className="compare-grid">
            {relatedCompares.map(compare => (
              <div key={compare.id} className="compare-item" onClick={() => navigate(`/compare/${compare.id}`)}>
                <div className="compare-images">
                  <div className="compare-old">
                    <img src={compare.oldSrc} alt={`${compare.title} - Xưa`} />
                    <div className="compare-label old-label">XƯA ({compare.yearOld})</div>
                  </div>
                  <div className="compare-divider">→</div>
                  <div className="compare-new">
                    <img src={compare.newSrc} alt={`${compare.title} - Nay`} />
                    <div className="compare-label new-label">NAY ({compare.yearNew})</div>
                  </div>
                </div>
                <div className="compare-info">
                  <h3 className="compare-title">{compare.title}</h3>
                  <p className="compare-description">{compare.description}</p>
                  <div className="compare-stats">
                    <span>📍 {compare.location}</span>
                    <span>❤️ {compare.likes}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Call to Action */}
      <div className="cta-section">
        <h3>Khám phá thêm</h3>
        <div className="cta-buttons">
          <Link to="/ImageLibrary" className="cta-btn primary">Xem thêm bài viết</Link>
          <Link to="/compare" className="cta-btn secondary">So sánh xưa - nay</Link>
        </div>
      </div>
    </div>
  );
};

export default ImageLibraryInformation;
