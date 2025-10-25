import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import articles from '../../util/mockArticles';
import compareList from '../../util/compareList';
import '../../Styles/ImageLibrary/ImageLibraryInformation.css';
import { useTranslation } from 'react-i18next';
import { displayCategoryName } from '../../util/categoryMap';

const ImageLibraryInformation = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const articleId = Number(id);
  const article = articles.find(a => a.ArticleID === articleId);

  if (!article) {
    return (
      <div className="lib-info-container">
        <div className="not-found">
          <h2>{t('imageInfo.notFound')}</h2>
          <Link to="/ImageLibrary" className="back-btn">← {t('imageInfo.backToLibrary')}</Link>
        </div>
      </div>
    );
  }

  // main image from Images.FilePath
  const mainImage = article.images && article.images.length ? article.images[0].FilePath : '';

  // related compares: article.relatedCompareIds may reference compareList.id or ComparisonID
  const relatedCompares = (article.relatedCompareIds || [])
    .map(refId => compareList.find(c => c.id === refId || c.ComparisonID === refId))
    .filter(Boolean)
    .slice(0, 2);

  return (
    <div className="lib-info-container">
      <div className="lib-info-header">
        <button onClick={() => navigate(-1)} className="back-btn">
          <span>←</span> {t('imageInfo.back')}
        </button>
        <div className="breadcrumb">
          <Link to="/">{t('nav.home')}</Link>
          <span>/</span>
          <Link to="/ImageLibrary">{t('imageInfo.library')}</Link>
          <span>/</span>
          <span>{article.Title}</span>
        </div>
      </div>

      <div className="lib-info-hero">
        <div className="hero-image" style={{ backgroundImage: `url(${mainImage})` }}>
          <div className="hero-overlay">
            <span className="hero-category">{displayCategoryName(article.categoryName, t)}</span>
          </div>
        </div>
        <div className="hero-content">
          <h1 className="hero-title">{article.Title}</h1>
          <div className="hero-meta">
            <span className="meta-item">📅 {t('imageInfo.yearPrefix')} {new Date(article.CreatedAt).getFullYear()}</span>
            <span className="meta-item">❤️ {article.likes || 0} {t('imageInfo.likes')}</span>
          </div>
          <p className="hero-description">{article.description || article.Content}</p>
        </div>
      </div>

      {relatedCompares.length > 0 && (
        <div className="related-section">
          <h2 className="section-title">{t('imageInfo.thenNowTitle')}</h2>
          <p className="section-subtitle">{t('imageInfo.thenNowSubtitle')}</p>
          <div className="compare-grid">
            {relatedCompares.map(compare => (
              <div
                key={compare.ComparisonID ?? compare.id}
                className="compare-item"
                onClick={() => navigate(`/compare/${compare.id ?? compare.ComparisonID}`)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter') navigate(`/compare/${compare.id ?? compare.ComparisonID}`); }}
              >
                <div className="compare-images">
                  <div className="compare-old">
                    <img src={compare.oldSrc} alt={`${compare.title} - ${t('compareCommon.altOld')}`} />
                    <div className="compare-label old-label">{t('compareCommon.oldLabel')} ({compare.yearOld})</div>
                  </div>
                  <div className="compare-divider">→</div>
                  <div className="compare-new">
                    <img src={compare.newSrc} alt={`${compare.title} - ${t('compareCommon.altNew')}`} />
                    <div className="compare-label new-label">{t('compareCommon.newLabel')} ({compare.yearNew})</div>
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

      <div className="cta-section">
        <h3>{t('imageInfo.exploreMore')}</h3>
        <div className="cta-buttons">
          <Link to="/ImageLibrary" className="cta-btn primary">{t('imageInfo.viewMorePosts')}</Link>
          <Link to="/compare" className="cta-btn secondary">{t('compareDetail.compareTitle')}</Link>
        </div>
      </div>
    </div>
  );
};

export default ImageLibraryInformation;
