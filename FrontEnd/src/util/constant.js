export const items = [
  {
    title: "Tòa thị chính Đà Nẵng (nay là UBND Đà Nẵng)",
    image: "https://nhacxua.vn/wp-content/uploads/2021/07/da-nang-14.jpg",
    href: "#",
    author: "Nguyễn Văn A"
  },
  {
    title: "Cầu chữ T sông Hàn trước tòa thị chính Đà Nẵng",
    image: "https://nhacxua.vn/wp-content/uploads/2021/07/da-nang-64.jpg",
    href: "#",
    author: "Trần Thị B"
  },
  {
    title: "Tòa nhà tại góc ngã ba Bạch Đằng-Phan Đình Phùng",
    image: "https://nhacxua.vn/wp-content/uploads/2021/07/da-nang-22.jpg",
    href: "#",
    author: "Lê Văn C"
  },
  {
    title: "Đường Trần Hưng Đạo, nay là đường Nguyễn Thái Học",
    image: "https://nhacxua.vn/wp-content/uploads/2021/07/da-nang-57.jpg",
    href: "#",
    author: "Phạm Thị D"
  }
];



export const IMAGES = [
	'https://www.agoda.com/wp-content/uploads/2024/08/son-tra-da-nang-vietnam-featured.jpg',
	'https://danangfantasticity.com/wp-content/uploads/2022/02/BA-NA-MO-CUA.jpg'
];

export const TIMELINE = [
	{ label: 'Ancient Era', color: 'green' },
	{ label: 'Colonial Period', color: 'blue' },
	{ label: 'Modern Era', color: 'orange' }
];


const locations = [
  {
    name: "Cầu Vàng",
    image: "https://www.kkday.com/vi/blog/wp-content/uploads/B%C3%A0-N%C3%A0-2.jpg",
    mapEmbed: "https://www.google.com/maps?q=Golden+Bridge+Ba+Na+Hills+Da+Nang&output=embed"
  },
  {
    name: "Cầu Rồng",
    image: "https://danangfantasticity.com/wp-content/uploads/2018/10/cau-rong-top-20-cay-cau-ky-quai-nhat-the-gioi-theo-boredom-therapy.jpg",
    mapEmbed: "https://www.google.com/maps?q=Cau+Rong+Da+Nang&output=embed"
  }
];
export default {
	IMAGES,
	TIMELINE,
	locations,
};

export const TIMELINE_ITEMS = [
  // Kiến trúc (6 items)
  {
    id: 1,
    date: "1930",
    title: "Nhà thờ Đà Nẵng",
    desc: "Công trình kiến trúc Gothic Pháp nổi tiếng với màu hồng đặc trưng.",
    image: "https://images.unsplash.com/photo-1549880338-65ddcdfd017b?q=80&w=1600&auto=format&fit=crop&ixlib=rb-4.0.3&s=6b4b9d5d5c3d3a2d1f0a",
    category: "Kiến trúc"
  },
  {
    id: 2,
    date: "1965",
    title: "Cầu Sông Hàn",
    desc: "Cây cầu quay độc đáo đầu tiên của Việt Nam bắc qua sông Hàn.",
    image: "https://images.unsplash.com/photo-1548013146-72479768bada?w=400",
    category: "Kiến trúc"
  },
  {
    id: 3,
    date: "2000",
    title: "Cầu Thuận Phước",
    desc: "Cầu treo dây văng lớn nhất Việt Nam, kết nối hai bờ sông Hàn.",
    image: "https://images.unsplash.com/photo-1555881698-7cda2d828814?w=400",
    category: "Kiến trúc"
  },
  {
    id: 4,
    date: "2009",
    title: "Cầu Trần Thị Lý",
    desc: "Cầu dây văng hiện đại với thiết kế hình cánh buồm vươn cao.",
    image: "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=400",
    category: "Kiến trúc"
  },
  {
    id: 5,
    date: "2013",
    title: "Cầu Rồng",
    desc: "Biểu tượng kiến trúc hiện đại của Đà Nẵng, có khả năng phun lửa và nước.",
    image: "https://haycafe.vn/wp-content/uploads/2022/01/Hinh-anh-cau-Rong.jpg",
    category: "Kiến trúc"
  },
  {
    id: 6,
    date: "2018",
    title: "Cầu Vàng Bà Nà",
    desc: "Công trình kiến trúc độc đáo với bàn tay khổng lồ đỡ cầu trên đỉnh núi.",
    image: "https://www.kkday.com/vi/blog/wp-content/uploads/B%C3%A0-N%C3%A0-2.jpg",
    category: "Kiến trúc"
  },

  // Văn hóa (6 items)
  {
    id: 7,
    date: "1915",
    title: "Bảo tàng Chăm",
    desc: "Bảo tàng nghệ thuật điêu khắc Chăm được thành lập, lưu giữ di sản văn hóa Chăm Pa.",
    image: "https://images.unsplash.com/photo-1566127444979-b6a37d6e4b6f?w=400",
    category: "Văn hóa"
  },
  {
    id: 8,
    date: "1985",
    title: "Làng nghề truyền thống",
    desc: "Làng đá mỹ nghệ Non Nước được công nhận làng nghề truyền thống.",
    image: "https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?w=400",
    category: "Văn hóa"
  },
  {
    id: 9,
    date: "1992",
    title: "Di sản Hội An",
    desc: "Phố cổ Hội An được UNESCO công nhận là di sản văn hóa thế giới.",
    image: "https://focusasiatravel.vn/wp-content/uploads/2018/09/Ph%E1%BB%91-C%E1%BB%95-H%E1%BB%99i-An1.jpg",
    category: "Văn hóa"
  },
  {
    id: 10,
    date: "1999",
    title: "Di sản Mỹ Sơn",
    desc: "Thánh địa Mỹ Sơn được UNESCO ghi danh là di sản văn hóa thế giới.",
    image: "https://images.unsplash.com/photo-1583482183758-0cac87828a43?w=400",
    category: "Văn hóa"
  },
  {
    id: 11,
    date: "2008",
    title: "Lễ hội pháo hoa quốc tế",
    desc: "Sự kiện văn hóa lớn thu hút hàng triệu du khách mỗi năm.",
    image: "https://images.unsplash.com/photo-1470770903676-69b98201ea1c?q=80&w=1600&auto=format&fit=crop&ixlib=rb-4.0.3&s=1234567890abcdef1234",
    category: "Văn hóa"
  },
  {
    id: 12,
    date: "2017",
    title: "APEC 2017",
    desc: "Đà Nẵng đăng cai tổ chức APEC, khẳng định vị thế trên bản đồ thế giới.",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400",
    category: "Văn hóa"
  },

  // Du lịch (6 items)
  {
    id: 13,
    date: "1995",
    title: "Khu du lịch Bà Nà",
    desc: "Khu du lịch Bà Nà Hills được khởi động, phát triển du lịch núi cao.",
    image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400",
    category: "Du lịch"
  },
  {
    id: 14,
    date: "2002",
    title: "Biển Mỹ Khê",
    desc: "Bãi biển Mỹ Khê được Forbes bình chọn là một trong những bãi biển đẹp nhất hành tinh.",
    image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400",
    category: "Du lịch"
  },
  {
    id: 15,
    date: "2010",
    title: "Cáp treo Bà Nà",
    desc: "Hệ thống cáp treo Bà Nà kỷ lục thế giới đưa vào hoạt động.",
    image: "https://images.unsplash.com/photo-1528127269322-539801943592?w=400",
    category: "Du lịch"
  },
  {
    id: 16,
    date: "2014",
    title: "Asia Park",
    desc: "Công viên giải trí Asia Park với vòng quay Sun Wheel cao nhất Đông Nam Á.",
    image: "https://images.unsplash.com/photo-1594741158704-5a784b8e59fb?w=400",
    category: "Du lịch"
  },
  {
    id: 17,
    date: "2019",
    title: "Du lịch MICE",
    desc: "Đà Nẵng phát triển du lịch MICE với nhiều trung tâm hội nghị quốc tế.",
    image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400",
    category: "Du lịch"
  },
  {
    id: 18,
    date: "2023",
    title: "Phố đi bộ sông Hàn",
    desc: "Không gian văn hóa - giải trí phố đi bộ dọc sông Hàn thu hút du khách.",
    image: "https://images.unsplash.com/photo-1555881698-7cda2d828814?w=400",
    category: "Du lịch"
  },

  // Thiên nhiên (6 items)
  {
    id: 19,
    date: "1825",
    title: "Ngũ Hành Sơn",
    desc: "Khu danh thắng Ngũ Hành Sơn với 5 ngọn núi đá vôi linh thiêng.",
    image: "https://images.unsplash.com/photo-1528127269322-539801943592?w=400",
    category: "Thiên nhiên"
  },
  {
    id: 20,
    date: "1977",
    title: "Bán đảo Sơn Trà",
    desc: "Khu bảo tồn thiên nhiên Sơn Trà - lá phổi xanh của thành phố.",
    image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400",
    category: "Thiên nhiên"
  },
  {
    id: 21,
    date: "1994",
    title: "Đèo Hải Vân",
    desc: "Đèo Hải Vân được công nhận là danh lam thắng cảnh quốc gia.",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400",
    category: "Thiên nhiên"
  },
  {
    id: 22,
    date: "2005",
    title: "Rừng dừa Bảy Mẫu",
    desc: "Rừng dừa nước Bảy Mẫu - hệ sinh thái độc đáo của vùng cửa sông.",
    image: "https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?w=400",
    category: "Thiên nhiên"
  },
  {
    id: 23,
    date: "2012",
    title: "Vườn quốc gia Bà Nà",
    desc: "Khu rừng nhiệt đới ẩm với hệ động thực vật phong phú trên đỉnh Bà Nà.",
    image: "https://images.unsplash.com/photo-1511497584788-876760111969?w=400",
    category: "Thiên nhiên"
  },
  {
    id: 24,
    date: "2020",
    title: "Vịnh Lăng Cô",
    desc: "Vịnh Lăng Cô được bình chọn là một trong những vịnh đẹp nhất thế giới.",
    image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400",
    category: "Thiên nhiên"
  }
];

