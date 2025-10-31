/**
 * =============================================================================
 * CONSTANT.JS - Các dữ liệu cố định cho ứng dụng
 * =============================================================================
 */

// =============================================================================
// TIMELINE_ITEMS - Dữ liệu cho trang DÒNG THỜI GIAN
// =============================================================================
// Sử dụng trong: FrontEnd/src/pages/Timeline/Timeline.jsx
// 
// Cấu trúc:
// - id: ID duy nhất
// - date: Năm (string) - dùng để sắp xếp theo thời gian
// - title: Tiêu đề sự kiện
// - desc: Mô tả ngắn gọn
// - image: URL hình ảnh
// - category: Thể loại (Kiến trúc | Văn hóa | Du lịch | Thiên nhiên)
//
// Có 4 categories chính, mỗi category có 6 items = tổng 24 items
// =============================================================================
export const TIMELINE_ITEMS = [
  // =============================================================================
  // CATEGORY: KIẾN TRÚC - 6 items
  // =============================================================================
  // Các công trình kiến trúc nổi bật của Đà Nẵng qua các thời kỳ
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

  // =============================================================================
  // CATEGORY: VĂN HÓA - 6 items
  // =============================================================================
  // Di sản văn hóa, lễ hội, bảo tàng và các sự kiện văn hóa quan trọng
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

  // =============================================================================
  // CATEGORY: DU LỊCH - 6 items
  // =============================================================================
  // Các điểm đến, khu du lịch và cơ sở hạ tầng du lịch
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

  // =============================================================================
  // CATEGORY: THIÊN NHIÊN - 6 items
  // =============================================================================
  // Danh lam thắng cảnh, khu bảo tồn thiên nhiên và di sản thiên nhiên
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
  ,
  // Thêm nhiều bài viết vào bộ sưu tập (mở rộng dữ liệu)
  {
    id: 25,
    date: "2013",
    title: "Trung tâm Hội nghị thành phố",
    desc: "Công trình hiện đại phục vụ các sự kiện quốc tế và hội thảo lớn.",
    content: "Trung tâm Hội nghị thành phố được thiết kế để tổ chức các hội nghị, triển lãm và sự kiện văn hóa quy mô lớn.\n\nNơi đây đã ghi dấu nhiều chương trình quan trọng, góp phần đưa thành phố lên bản đồ sự kiện khu vực.",
    image: "https://images.unsplash.com/photo-1505843475684-29b1e2b8b3d8?w=800",
    category: "Kiến trúc"
  },
  {
    id: 26,
    date: "2013",
    title: "Nhà hát thành phố",
    desc: "Nhà hát được trùng tu, nâng cấp khán phòng và sân khấu chuyên nghiệp.",
    image: "https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?w=800",
    category: "Kiến trúc"
  },
  {
    id: 27,
    date: "2019",
    title: "Cầu đi bộ ven sông",
    desc: "Đường đi bộ mới dọc sông tạo không gian công cộng cho người dân và du khách.",
    image: "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=800",
    category: "Du lịch"
  },
  {
    id: 28,
    date: "2019",
    title: "Liên hoan ẩm thực 2019",
    desc: "Sự kiện ẩm thực tập hợp các đầu bếp và món ăn truyền thống cùng sáng tạo.",
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800",
    category: "Du lịch"
  },
  {
    id: 29,
    date: "2023",
    title: "Khu ẩm thực ven sông",
    desc: "Chuỗi cửa hàng ẩm thực mở cửa quanh khu ven sông, đa dạng món ăn địa phương.",
    content: "Khu ẩm thực ven sông là điểm đến mới cho người yêu ẩm thực, kết hợp không gian mở và trải nghiệm ẩm thực đường phố.\n\nNhiều quầy hàng giới thiệu món ăn bản địa và các phiên chợ cuối tuần thu hút gia đình và du khách.",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800",
    category: "Du lịch"
  },
  {
    id: 30,
    date: "2023",
    title: "Triển lãm nghệ thuật 2023",
    desc: "Triển lãm trưng bày tác phẩm đương đại và nghệ sĩ địa phương.",
    image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800",
    category: "Văn hóa"
  },
  {
    id: 31,
    date: "2020",
    title: "Đảo Xanh Resort",
    desc: "Khu nghỉ dưỡng đảo xanh được phát triển với tiêu chí sinh thái và bền vững.",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800",
    category: "Thiên nhiên"
  },
  {
    id: 32,
    date: "2008",
    title: "Lễ hội văn hóa truyền thống",
    desc: "Sự kiện tái hiện các nghi lễ và trình diễn nghệ thuật dân gian.",
    image: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800",
    category: "Văn hóa"
  },
  {
    id: 33,
    date: "1995",
    title: "Khai trương khu du lịch sinh thái",
    desc: "Khu du lịch sinh thái mở cửa phục vụ du khách trong và ngoài nước.",
    image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800",
    category: "Du lịch"
  },
  {
    id: 34,
    date: "1965",
    title: "Tượng đài lịch sử",
    desc: "Tượng đài kỷ niệm các sự kiện lịch sử của địa phương.",
    image: "https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d?w=800",
    category: "Kiến trúc"
  },
  {
    id: 35,
    date: "1915",
    title: "Di tích lịch sử văn hóa",
    desc: "Công trình di tích được bảo tồn với nhiều giá trị văn hóa lâu đời.",
    image: "https://images.unsplash.com/photo-1470770903676-69b98201ea1c?q=80&w=1600&auto=format&fit=crop&ixlib=rb-4.0.3&s=1234567890abcdef1234",
    category: "Văn hóa"
  },
  {
    id: 36,
    date: "1825",
    title: "Địa danh lịch sử",
    desc: "Địa danh có giá trị tự nhiên và lịch sử, điểm đến tham quan lâu đời.",
    image: "https://images.unsplash.com/photo-1528127269322-539801943592?w=800",
    category: "Thiên nhiên"
  },
  {
  "id": 37,
  "date": "1945",
  "title": "Chủ tịch Hồ Chí Minh đọc Tuyên ngôn Độc lập",
  "desc": "Chủ tịch Hồ Chí Minh đọc bản Tuyên ngôn Độc lập, khai sinh nước Việt Nam Dân chủ Cộng hòa",
  "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/Ho_Chi_Minh_1946.jpg/800px-Ho_Chi_Minh_1946.jpg",
  "category": "Lịch sử"
}
];

// Nếu một item không có trường `content`, dùng helper này để tạo nội dung bài báo cơ bản
export function getTimelineArticleContent(item) {
  if (!item) return "";
  if (item.content && item.content.trim()) return item.content;
  // Sinh nội dung chi tiết dạng bài báo từ dữ liệu ngắn (title, date, desc, category)
  const base = item.desc || "";
  const title = item.title || "Sự kiện";
  const year = item.date || "";
  const category = item.category || "";

  const parts = [];
  // Lead / tóm tắt ngắn
  parts.push(`${title} — ${category} (${year})`);
  parts.push(`${base} Đây là phần mở rộng mô tả để hiển thị như một bài báo. Đoạn này tóm tắt nội dung chính và cung cấp ngữ cảnh cho độc giả.`);

  // Lịch sử / bối cảnh
  parts.push(`Lịch sử và bối cảnh: ${title} xuất hiện vào năm ${year} và có vai trò quan trọng trong giai đoạn đó. Phần này mô tả các nguyên nhân dẫn đến sự xuất hiện của sự kiện/công trình, các nhân vật, tổ chức liên quan, và những mốc thời gian quan trọng.`);

  // Đặc điểm / mô tả chi tiết
  parts.push(`Mô tả chi tiết: ${title} có những đặc điểm nổi bật về mặt kiến trúc, tổ chức hoặc văn hóa. Nếu là công trình kiến trúc, có thể ghi chi tiết về vật liệu, phong cách, họa tiết và những điểm khác biệt; nếu là sự kiện, mô tả qui mô, hình thức tổ chức và các hoạt động chính.`);

  // Ý nghĩa / tác động
  parts.push(`Ý nghĩa và tác động: Phân tích tác động xã hội, kinh tế và văn hóa của ${title}. Nêu rõ vì sao địa điểm/sự kiện này quan trọng với cộng đồng địa phương hoặc với lịch sử vùng miền.`);

  // Tình trạng hiện tại & bảo tồn
  parts.push(`Tình trạng hiện nay: Ghi chú về tình trạng bảo tồn, những nỗ lực tu sửa, hoặc cách mà địa phương đang quản lý/khai thác địa điểm này cho mục đích du lịch hoặc giáo dục.`);

  // Tham khảo / gợi ý đọc thêm
  parts.push(`Tham khảo & đọc thêm: Để tìm hiểu sâu hơn về ${title}, bạn có thể tra cứu các nguồn lịch sử, bài báo chuyên khảo hoặc trang chính thức của cơ quan quản lý liên quan.`);

  return parts.join('\n\n');
}

