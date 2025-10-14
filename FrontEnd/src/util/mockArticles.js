const articles = [
  {
    id: 1,
    title: "Chùa Linh Ứng - Bán đảo Sơn Trà",
    author: "Nguyễn Văn An",
    date: "15/1/2024",
    views: 15420,
    likes: 1234,
    category: "Văn hóa",
    image: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?q=80&w=1600&auto=format&fit=crop&ixlib=rb-4.0.3&s=1",
    description: "Chùa Linh Ứng trên bán đảo Sơn Trà là một trong những ngôi chùa nổi tiếng nhất ở Đà Nẵng, nổi bật với tượng Bồ Tát cao và tầm nhìn ra biển."
  },
  {
    id: 2,
    title: "Cầu Rồng - Biểu tượng của Đà Nẵng",
    author: "Trần Thị Mai",
    date: "20/1/2024",
    views: 12350,
    likes: 987,
    category: "Kiến trúc",
    image: "https://images.unsplash.com/photo-1494526585095-c41746248156?q=80&w=1600&auto=format&fit=crop&ixlib=rb-4.0.3&s=2",
    description: "Cầu Rồng được thiết kế như một con rồng phun lửa và phun nước vào cuối tuần, là điểm đến hấp dẫn cho cả du khách và người dân địa phương."
  },
  {
    id: 3,
    title: "Bà Nà Hills - Thiên đường nghỉ dưỡng",
    author: "Ngô Thu Hương",
    date: "10/3/2024",
    views: 11200,
    likes: 1456,
    category: "Du lịch",
    image: "https://images.unsplash.com/photo-1508264165352-c5c9a2b1a7f4?q=80&w=1600&auto=format&fit=crop&ixlib=rb-4.0.3&s=3",
    description: "Bà Nà Hills nổi tiếng với khí hậu mát mẻ, khu vui chơi và kiến trúc châu Âu giả tưởng, phù hợp cho các chuyến dã ngoại gia đình." 
  },
  {
    id: 4,
    title: "Phố cổ Hội An - Di sản văn hóa",
    author: "Lê Minh",
    date: "05/2/2024",
    views: 8420,
    likes: 652,
    category: "Văn hóa",
    image: "https://images.unsplash.com/photo-1505765052546-7a8a2f9f9c3a?q=80&w=1600&auto=format&fit=crop&ixlib=rb-4.0.3&s=4",
    description: "Phố cổ Hội An giữ được nhiều nét kiến trúc truyền thống, đèn lồng rực rỡ và ẩm thực đặc sắc, là nơi dừng chân không thể bỏ qua ở miền Trung." 
  },
  {
    id: 5,
    title: "Đồi chè Cầu Đất - Lâm Đồng",
    author: "Phạm Huy",
    date: "22/4/2024",
    views: 4320,
    likes: 321,
    category: "Thiên nhiên",
    image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1600&auto=format&fit=crop&ixlib=rb-4.0.3&s=5",
    description: "Đồi chè Cầu Đất trải dài bát ngát, thời tiết mát mẻ, phù hợp để chụp ảnh và trải nghiệm không gian đồng quê yên bình." 
  },
  {
    id: 6,
    title: "Thác Bản Giốc - Kỳ quan miền Bắc",
    author: "Nguyễn Khánh",
    date: "12/5/2024",
    views: 9800,
    likes: 890,
    category: "Thiên nhiên",
    image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1600&auto=format&fit=crop&ixlib=rb-4.0.3&s=6",
    description: "Thác Bản Giốc nằm trên biên giới Việt-Trung, mang vẻ hùng vĩ và nước chảy trắng xóa, là một trong những thắng cảnh đáng xem." 
  },
  {
    id: 7,
    title: "Nhà thờ Đức Bà - Sài Gòn",
    author: "Trần Văn",
    date: "30/6/2024",
    views: 15230,
    likes: 1102,
    category: "Kiến trúc",
    image: "https://images.unsplash.com/photo-1509395176047-4a66953fd231?q=80&w=1600&auto=format&fit=crop&ixlib=rb-4.0.3&s=7",
    description: "Nhà thờ Đức Bà là một công trình kiến trúc Pháp tiêu biểu giữa lòng TP.HCM, thu hút nhiều khách tham quan và nhiếp ảnh gia." 
  },
  {
    id: 8,
    title: "Đà Lạt - Thành phố ngàn hoa",
    author: "Hà My",
    date: "18/7/2024",
    views: 14320,
    likes: 980,
    category: "Du lịch",
    image: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?q=80&w=1600&auto=format&fit=crop&ixlib=rb-4.0.3&s=8",
    description: "Đà Lạt nổi tiếng với khí hậu ôn hòa, hoa và rừng thông, là điểm nghỉ dưỡng lãng mạn của nhiều cặp đôi." 
  },
  {
    id: 9,
    title: "Hồ Hoàn Kiếm - Trái tim Hà Nội",
    author: "Ngô Lan",
    date: "01/8/2024",
    views: 20120,
    likes: 2100,
    category: "Văn hóa",
    image: "https://images.unsplash.com/photo-1509395176047-4a66953fd231?q=80&w=1600&auto=format&fit=crop&ixlib=rb-4.0.3&s=9",
    description: "Hồ Hoàn Kiếm là biểu tượng của Hà Nội, thích hợp cho các buổi dạo bộ, chụp ảnh và tìm hiểu lịch sử Tháp Rùa." 
  },
  {
    id: 10,
    title: "Cồn Cát Mũi Né - Trải nghiệm sa mạc",
    author: "Lê Hồng",
    date: "11/9/2024",
    views: 6320,
    likes: 410,
    category: "Du lịch",
    image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1600&auto=format&fit=crop&ixlib=rb-4.0.3&s=10",
    description: "Cồn cát Mũi Né cung cấp trải nghiệm trượt cát và ngắm bình minh, rất thú vị cho du khách ưa mạo hiểm." 
  },
  {
    id: 11,
    title: "Đền Hùng - Tín ngưỡng dân tộc",
    author: "Phan Lê",
    date: "25/9/2024",
    views: 5420,
    likes: 300,
    category: "Văn hóa",
    image: "https://images.unsplash.com/photo-1505765052546-7a8a2f9f9c3a?q=80&w=1600&auto=format&fit=crop&ixlib=rb-4.0.3&s=11",
    description: "Đền Hùng là nơi thờ các vua Hùng, là trung tâm các hoạt động văn hóa và lễ hội truyền thống lớn của Việt Nam." 
  },
  {
    id: 12,
    title: "Hang Sơn Đoòng - Kỳ quan thế giới",
    author: "Huỳnh An",
    date: "03/10/2024",
    views: 8600,
    likes: 720,
    category: "Thiên nhiên",
    image: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?q=80&w=1600&auto=format&fit=crop&ixlib=rb-4.0.3&s=12",
    description: "Hang Sơn Đoòng là hang động lớn nhất thế giới, với hệ sinh thái và cảnh quan nội thất độc đáo, chỉ dành cho những chuyến thám hiểm có hướng dẫn." 
  },
  {
    id: 13,
    title: "Phật Bà Tây Ninh - Núi Bà",
    author: "Trần Đăng",
    date: "20/10/2024",
    views: 4220,
    likes: 210,
    category: "Văn hóa",
    image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1600&auto=format&fit=crop&ixlib=rb-4.0.3&s=13",
    description: "Núi Bà Tây Ninh là điểm hành hương lớn, với quần thể kiến trúc tôn giáo và lễ hội đông đảo vào dịp cuối tuần." 
  },
  {
    id: 14,
    title: "Lăng Khải Định - Kiến trúc triều Nguyễn",
    author: "Vũ Quỳnh",
    date: "05/11/2024",
    views: 3120,
    likes: 180,
    category: "Kiến trúc",
    image: "https://images.unsplash.com/photo-1509395176047-4a66953fd231?q=80&w=1600&auto=format&fit=crop&ixlib=rb-4.0.3&s=14",
    description: "Lăng Khải Định kết hợp hoa văn phương Tây và phương Đông, là một công trình kiến trúc độc đáo của triều Nguyễn." 
  },
  {
    id: 15,
    title: "Vịnh Hạ Long - Thiên nhiên kỳ vĩ",
    author: "Nguyễn Phương",
    date: "12/11/2024",
    views: 27200,
    likes: 3200,
    category: "Thiên nhiên",
    image: "https://images.unsplash.com/photo-1508264165352-c5c9a2b1a7f4?q=80&w=1600&auto=format&fit=crop&ixlib=rb-4.0.3&s=15",
    description: "Vịnh Hạ Long với hàng nghìn đảo đá vôi, là một trong những di sản thiên nhiên quan trọng và thu hút du lịch quốc tế." 
  },
  {
    id: 16,
    title: "Cù Lao Chàm - Bảo tồn biển",
    author: "Hoàng Yến",
    date: "01/12/2024",
    views: 2120,
    likes: 150,
    category: "Du lịch",
    image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1600&auto=format&fit=crop&ixlib=rb-4.0.3&s=16",
    description: "Cù Lao Chàm là khu dự trữ sinh quyển với hệ san hô phong phú, phù hợp cho lặn biển và khám phá sinh học biển." 
  },
  {
    id: 17,
    title: "Đền Ngọc Sơn - Văn hóa Hà Nội",
    author: "Trịnh Mai",
    date: "17/12/2024",
    views: 4120,
    likes: 340,
    category: "Văn hóa",
    image: "https://images.unsplash.com/photo-1505765052546-7a8a2f9f9c3a?q=80&w=1600&auto=format&fit=crop&ixlib=rb-4.0.3&s=17",
    description: "Đền Ngọc Sơn nằm trên hồ Hoàn Kiếm, là nơi lưu giữ nhiều giá trị văn hóa và được nhiều người dân địa phương lui tới thắp hương." 
  },
  {
    id: 18,
    title: "Hồ Xuân Hương - Trung tâm Đà Lạt",
    author: "Nguyễn Hằng",
    date: "02/01/2025",
    views: 7320,
    likes: 610,
    category: "Du lịch",
    image: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?q=80&w=1600&auto=format&fit=crop&ixlib=rb-4.0.3&s=18",
    description: "Hồ Xuân Hương là điểm nhộn nhịp ở Đà Lạt, thích hợp cho các hoạt động dạo bộ, café và chụp ảnh." 
  },
  {
    id: 19,
    title: "Thành cổ Quảng Trị - Lịch sử chiến tranh",
    author: "Phạm Đức",
    date: "15/02/2025",
    views: 1820,
    likes: 90,
    category: "Lịch sử",
    image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1600&auto=format&fit=crop&ixlib=rb-4.0.3&s=19",
    description: "Thành cổ Quảng Trị ghi dấu những trận chiến lịch sử, hiện là nơi tưởng niệm và nghiên cứu lịch sử chiến tranh." 
  },
  {
    id: 20,
    title: "Cánh đồng lau Phú Yên - Mùa đẹp",
    author: "Lê Ánh",
    date: "01/03/2025",
    views: 940,
    likes: 60,
    category: "Thiên nhiên",
    image: "https://images.unsplash.com/photo-1508264165352-c5c9a2b1a7f4?q=80&w=1600&auto=format&fit=crop&ixlib=rb-4.0.3&s=20",
    description: "Cánh đồng lau Phú Yên mang vẻ đẹp hoang sơ vào mùa lau trắng, là bối cảnh lý tưởng cho ảnh nghệ thuật." 
  }
];

export default articles;
