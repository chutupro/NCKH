import React from 'react';
import { useParams, Link } from 'react-router-dom';
import articles from '../../util/mockArticles';
import '../../Styles/ImageLibrary/ImageLibrary.css';

const ImageLibraryInformation = () => {
  const { id } = useParams();
  const articleId = Number(id);
  const article = articles.find(a => a.id === articleId);

  if (!article) {
    return (
      <div className="detail-container">
        <p>Bài viết không tìm thấy.</p>
        <Link to="/ImageLibrary">Quay lại</Link>
      </div>
    );
  }

  return (
    <div className="detail-container">
      <Link to="/ImageLibrary" className="back-link">← Quay lại</Link>
      <div className="detail-card">
        <div className="detail-image" style={{ backgroundImage: `url(${article.image})` }} />
        <div className="detail-content">
          <h1 className="detail-title">{article.title}</h1>
          <div className="detail-meta">{article.author} • {article.date} • {article.category}</div>
          <div className="detail-stats">👁️ {article.views} &nbsp; ❤️ {article.likes}</div>
          <p className="detail-description">{article.description}</p>
        </div>
      </div>
    </div>
  );
};

export default ImageLibraryInformation;
