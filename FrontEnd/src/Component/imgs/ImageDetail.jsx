import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../../Styles/imgs/ImageDetail.css';

const ImageDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const image = {
    id: parseInt(id),
    src: 'https://cdn.pixabay.com/photo/2023/08/18/15/03/hills-8199447_1280.jpg',
    title: 'Bà Nà Hills Đà Nẵng',
    description: 'Trải nghiệm tuyệt vời tại Bà Nà Hills với khung cảnh thiên nhiên tuyệt đẹp và cầu Vàng nổi tiếng.',
    user: 'duyan1508',
    followers: '10000 followers',
    license: 'Free for use under the PixabayContent License',
  };
  const relatedImages = [
    { id: 2, src: 'https://example.com/image2.jpg', title: 'Hình ảnh 2' },
    { id: 3, src: 'https://example.com/image3.jpg', title: 'Hình ảnh 3' },
  ];

  return (
    <div className="detail-container">
      <button onClick={() => navigate('/gallery')}>Quay lại</button>
      <img src={image.src} alt={image.title} className="detail-image" />
      <div className="detail-content">
        <h1>{image.title}</h1>
        <p>{image.description}</p>
        <div className="user-info">
          <img src="https://via.placeholder.com/40" alt={image.user} className="user-avatar" />
          <div>
            <p>{image.user}</p>
            <p>{image.followers}</p>
          </div>
        </div>
        <p className="license">{image.license}</p>
        <div className="related-images">
          <p>related images</p>
          {relatedImages.map((img) => (
            <img
              key={img.id}
              src={img.src}
              alt={img.title}
              onClick={() => navigate(`/image-detail/${img.id}`)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ImageDetail;