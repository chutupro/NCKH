import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Headers from '../Component/home/Headers'; // Đảm bảo đường dẫn đúng
import Footer from '../Component/home/Footer'; // Đảm bảo đường dẫn đúng
import '../Styles/imgs/ImageGallery.css';

const ImageGallery = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [searchQuery, setSearchQuery] = useState('');
  const [likes, setLikes] = useState({});

  const categories = [
    'Tất cả',
    'Thiên nhiên',
    'Kiến trúc',
    'Ẩm thực',
    'Nghệ thuật',
    'Du lịch',
    'Thể thao',
    'Công nghệ',
    'Thời trang',
    'Động vật',
  ];

  const images = [
    {
      id: 1,
      src: 'https://via.placeholder.com/300x200/4CAF50/FFFFFF?text=Thien+nhien',
      title: 'Khung cảnh thiên nhiên tuyệt đẹp',
      user: 'nature_lover',
      category: 'Thiên nhiên',
      detail: 'Một bức ảnh đẹp trời tại vùng núi phía Bắc.',
      initialLikes: 1234,
    },
    {
      id: 2,
      src: 'https://via.placeholder.com/300x200/2196F3/FFFFFF?text=Kien+truc',
      title: 'Kiến trúc thành phố hiện đại',
      user: 'city_explorer',
      category: 'Kiến trúc',
      detail: 'Những tòa nhà cao tầng lấp lánh ánh đèn.',
      initialLikes: 892,
    },
    {
      id: 3,
      src: 'https://via.placeholder.com/300x200/FF5722/FFFFFF?text=Am+thuc',
      title: 'Món ăn ngon tuyệt',
      user: 'foodie_photos',
      category: 'Ẩm thực',
      detail: 'Bữa brunch cuối tuần tại nhà hàng yêu thích.',
      initialLikes: 2156,
    },
    {
      id: 4,
      src: 'https://via.placeholder.com/300x200/9C27B0/FFFFFF?text=Ngh%C3%A9+thu%E1%BA%ADt',
      title: 'Nghệ thuật trừu tượng',
      user: 'art_enthusiast',
      category: 'Nghệ thuật',
      detail: 'Bức tranh trừu tượng với màu sắc rực rỡ.',
      initialLikes: 1456,
    },
    {
      id: 5,
      src: 'https://via.placeholder.com/300x200/FFC107/FFFFFF?text=Du+l%C3%ADch',
      title: 'Du lịch bãi biển',
      user: 'travel_bug',
      category: 'Du lịch',
      detail: 'Bãi biển nhiệt đới với cát trắng và nước trong.',
      initialLikes: 1789,
    },
    {
      id: 6,
      src: 'https://via.placeholder.com/300x200/03A9F4/FFFFFF?text=Th%E1%BB%83+thao',
      title: 'Thể thao bóng đá',
      user: 'sports_fan',
      category: 'Thể thao',
      detail: 'Trận đấu bóng đá kịch tính tại sân vận động.',
      initialLikes: 2100,
    },
  ];

  const filteredImages = images.filter((image) => {
    const matchesCategory = selectedCategory === 'Tất cả' || image.category === selectedCategory;
    const matchesSearch = image.title.toLowerCase().includes(searchQuery.toLowerCase()) || image.detail.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleLike = (id) => {
    setLikes((prevLikes) => ({
      ...prevLikes,
      [id]: (prevLikes[id] || 0) + 1,
    }));
  };

  return (
    <div className="gallery-page">
      <Headers />
      <div className="gallery-container">
        <aside className="sidebar">
          <h3 className="sidebar-title">Tìm kiếm</h3>
          <input
            type="search"
            placeholder="Tìm kiếm bài viết..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <h3 className="sidebar-title">Danh mục</h3>
          <ul className="category-list">
            {categories.map((cat) => (
              <li
                key={cat}
                className={`category-item ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </li>
            ))}
          </ul>
        </aside>
        <main className="main-gallery">
          <div className="gallery-grid">
            {filteredImages.map((image) => (
              <div
                key={image.id}
                className="image-card"
                onClick={() => navigate(`/image-detail/${image.id}`)}
              >
                <img src={image.src} alt={image.title} className="image-img" />
                <div className="image-info">
                  <h4 className="image-title">{image.title}</h4>
                  <p className="image-detail">{image.detail}</p>
                  <div className="user-likes">
                    <div className="user-profile">
                      <img src={`https://via.placeholder.com/40?text=${image.user[0]}`} alt={image.user} className="user-avatar" />
                      <span className="user-name">{image.user}</span>
                    </div>
                    <div className="likes-section">
                      <span className="like-count">❤️ {image.initialLikes + (likes[image.id] || 0)}</span>
                      <button
                        className="like-button"
                        onClick={(e) => { e.stopPropagation(); handleLike(image.id); }}
                      >
                        Like
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default ImageGallery;