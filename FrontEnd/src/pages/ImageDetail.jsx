import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Headers from '../Component/home/Headers'; // Đảm bảo đường dẫn đúng
import Footer from '../Component/home/Footer'; // Đảm bảo đường dẫn đúng
import '../Styles/imgs/ImageDetail.css';

const ImageDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const image = {
    id: parseInt(id),
    src: 'https://nhacxua.vn/wp-content/uploads/2021/07/da-nang-8.jpg',
    title: 'Bà Nà Hills Đà Nẵng',
    user: 'duyan1508',
    category: 'Du lịch',
    detail: 'Trải nghiệm tuyệt vời tại Bà Nà Hills với khung cảnh thiên nhiên tuyệt đẹp và cầu Vàng nổi tiếng.',
    license: 'Free for use under the PixabayContent License',
    initialLikes: 1234,
  };
  const relatedImages = [
    { id: 2, src: 'https://via.placeholder.com/150x100/2196F3?text=Lien+quan+2', title: 'Hình ảnh liên quan 2' },
    { id: 3, src: 'https://via.placeholder.com/150x100/FF5722?text=Lien+quan+3', title: 'Hình ảnh liên quan 3' },
    { id: 4, src: 'https://via.placeholder.com/150x100/4CAF50?text=Lien+quan+4', title: 'Hình ảnh liên quan 4' },
  ];

  const comments = [
    { user: 'nghiaNgu', text: 'Hình ảnh đẹp quá!' },
    { user: 'doanh', text: 'Tôi muốn đến thăm nơi này.' },
  ];

  const handleLike = () => {
    console.log('Liked');
  };

  return (
    <div className="detail-page">
      <Headers />
      <div className="detail-container">
        <button className="back-button" onClick={() => navigate('/gallery')}>Quay lại</button>
        <img src={image.src} alt={image.title} className="detail-image" />
        <div className="detail-header-info">
          <h1 className="detail-title">{image.title}</h1>
          <p className="image-author">Tác giả: {image.user}</p>
          <p className="image-category">Thể loại: {image.category}</p>
        </div>
        <p className="detail-description">{image.detail}</p>
        <p className="detail-license">{image.license}</p>
        <div className="likes-section">
          <span className="like-count">❤️ {image.initialLikes}</span>
          <button className="like-button" onClick={handleLike}>Like</button>
        </div>
        <div className="comments-section">
          <h2 className="section-title">Bình luận</h2>
          {comments.map((comment, index) => (
            <div key={index} className="comment">
              <strong className="comment-user">{comment.user}:</strong> <span className="comment-text">{comment.text}</span>
            </div>
          ))}
          <input type="text" placeholder="Thêm bình luận..." className="comment-input" />
        </div>
        <div className="related-section">
          <h2 className="section-title">Hình ảnh liên quan</h2>
          <div className="related-grid">
            {relatedImages.map((img) => (
              <img
                key={img.id}
                src={img.src}
                alt={img.title}
                onClick={() => navigate(`/image-detail/${img.id}`)}
                className="related-image"
              />
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ImageDetail;