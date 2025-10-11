import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Styles/imgs/ImageGallery.css'; // Đảm bảo đường dẫn đúng

const ImageGallery = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [searchQuery, setSearchQuery] = useState('');

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
      src: 'https://via.placeholder.com/300x200/4CAF50/FFFFFF?text=Khung+c%E1%BA%A3nh+thi%C3%AAn+nhi%C3%AAn+tuy%E1%BA%BFt+%C4%91%E1%BA%B9p',
      title: 'Khung cảnh thiên nhiên tuyệt đẹp',
      description: 'Một bức sáng đẹp trời tại vùng núi phía Bắc. Không khí trong lành...',
      user: 'nature_lover',
      likes: 1234,
      category: 'Thiên nhiên',
    },
    {
      id: 2,
      src: 'https://via.placeholder.com/300x200/2196F3/FFFFFF?text=Ki%E1%BA%BFn+tr%C3%BAc+th%C3%A0nh+ph%E1%BB%91+hi%E1%BB%87n+%C4%91%E1%BA%A1i',
      title: 'Kiến trúc thành phố hiện đại',
      description: 'Những tòa nhà cao tầng lấp lánh ánh đèn, kết hợp hài hòa...',
      user: 'city_explorer',
      likes: 892,
      category: 'Kiến trúc',
    },
    {
      id: 3,
      src: 'https://via.placeholder.com/300x200/FF5722/FFFFFF?text=M%C3%B3n+%C4%83n+ngon+tuy%E1%BA%BFt',
      title: 'Món ăn ngon tuyệt',
      description: 'Bữa brunch cuối tuần tại nhà hàng yêu thích. Các món ăn được trình bày...',
      user: 'foodie_photos',
      likes: 2156,
      category: 'Ẩm thực',
    },
    {
      id: 4,
      src: 'https://via.placeholder.com/300x200/9C27B0/FFFFFF?text=Ngh%E1%BB%87+thu%E1%BA%ADt+tr%E1%BB%ABu+t%C6%B0%E1%BB%A3ng',
      title: 'Nghệ thuật trừu tượng',
      description: 'Bức tranh trừu tượng với màu sắc rực rỡ, thể hiện cảm xúc...',
      user: 'art_enthusiast',
      likes: 1456,
      category: 'Nghệ thuật',
    },
    {
      id: 5,
      src: 'https://via.placeholder.com/300x200/FFC107/FFFFFF?text=Du+l%E1%BB%8Bch+b%E1%BA%A3i+bi%E1%BB%83n',
      title: 'Du lịch bãi biển',
      description: 'Bãi biển nhiệt đới với cát trắng và nước trong xanh...',
      user: 'travel_bug',
      likes: 1789,
      category: 'Du lịch',
    },
    {
      id: 6,
      src: 'https://via.placeholder.com/300x200/03A9F4/FFFFFF?text=Th%E1%BB%83+thao+b%C3%B3ng+%C4%91%C3%A1',
      title: 'Thể thao bóng đá',
      description: 'Trận đấu bóng đá kịch tính tại sân vận động lớn...',
      user: 'sports_fan',
      likes: 2100,
      category: 'Thể thao',
    },
    {
      id: 7,
      src: 'https://via.placeholder.com/300x200/673AB7/FFFFFF?text=C%C3%B4ng+ngh%E1%BB%87+AI',
      title: 'Công nghệ AI',
      description: 'Mô hình trí tuệ nhân tạo tiên tiến đang thay đổi thế giới...',
      user: 'tech_geek',
      likes: 1345,
      category: 'Công nghệ',
    },
    {
      id: 8,
      src: 'https://via.placeholder.com/300x200/F44336/FFFFFF?text=Th%E1%BB%9Di+trang+ph%E1%BB%91',
      title: 'Thời trang phố',
      description: 'Phong cách thời trang đường phố trẻ trung và năng động...',
      user: 'fashionista',
      likes: 1678,
      category: 'Thời trang',
    },
    {
      id: 9,
      src: 'https://via.placeholder.com/300x200/8BC34A/FFFFFF?text=%C4%90%E1%BB%99ng+v%E1%BA%ADt+hoang+d%C3%A3',
      title: 'Động vật hoang dã',
      description: 'Hình ảnh sư tử trong môi trường tự nhiên tại châu Phi...',
      user: 'wildlife_photographer',
      likes: 1987,
      category: 'Động vật',
    },
    {
      id: 10,
      src: 'https://via.placeholder.com/300x200/FF9800/FFFFFF?text=Ki%E1%BA%BFn+tr%C3%BAc+c%E1%BB%95+%C4%91i%E1%BB%83n',
      title: 'Kiến trúc cổ điển',
      description: 'Ngôi đền cổ kính với kiến trúc tinh xảo từ thời cổ đại...',
      user: 'history_buff',
      likes: 1123,
      category: 'Kiến trúc',
    },
    // Bạn có thể thêm nhiều hình ảnh hơn ở đây nếu cần
  ];

  const filteredImages = images.filter((image) => {
    const matchesCategory = selectedCategory === 'Tất cả' || image.category === selectedCategory;
    const matchesSearch = image.title.toLowerCase().includes(searchQuery.toLowerCase()) || image.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleLike = (id) => {
    // Giả lập tăng like, có thể kết nối backend sau
    console.log(`Liked image ${id}`);
  };

  return (
    <div className="image-gallery-container gallery-page">
      <header className="gallery-header">
        <span className="logo">DynaVault</span>
      </header>
      <div className="gallery-content">
        <aside className="sidebar">
          <h3>Tìm kiếm</h3>
          <input
            type="search"
            placeholder="Tìm kiếm bài viết..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <h3>Danh mục</h3>
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
                  <div className="user-likes">
                    <div className="user-profile">
                      <img src="https://via.placeholder.com/40" alt={image.user} className="user-avatar" />
                      <span className="user-name">{image.user}</span>
                    </div>
                    <div className="likes">
                      <span className="like-count">❤️ {image.likes}</span>
                      <button className="like-button" onClick={(e) => { e.stopPropagation(); handleLike(image.id); }}>
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
    </div>
  );
};

export default ImageGallery;