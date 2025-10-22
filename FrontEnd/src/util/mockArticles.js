/**
 * =============================================================================
 * MOCK ARTICLES - Dữ liệu cho THƯ VIỆN ẢNH (Image Library)
 * =============================================================================
 * Sử dụng trong:
 * - FrontEnd/src/pages/gallery/ImageLibrary.jsx (Gallery view)
 * - FrontEnd/src/pages/gallery/ImageLibraryInformation.jsx (Detail view)
 * 
 * Cấu trúc:
 * - id: ID duy nhất
 * - title: Tiêu đề bài viết
 * - date: Năm (string, trước năm 2000)
 * - likes: Số lượt thích
 * - category: Thể loại (Văn hóa, Kiến trúc, Du lịch, Thiên nhiên)
 * - image: URL hình ảnh chính
 * - description: Mô tả chi tiết
 * - relatedCompares: Mảng ID liên kết đến compareList (hiển thị ảnh xưa-nay liên quan)
 * 
 * Tổng: 10 articles
 * =============================================================================
 */
const articles = [
  {
    id: 1,
    title: "Chùa Linh Ứng - Bán đảo Sơn Trà",
    date: "1995",
    likes: 1234,
    category: "Văn hóa",
    image: "https://statics.vinpearl.com/chua-linh-ung-da-nang-3.jpg",
    description: "Chùa Linh Ứng trên bán đảo Sơn Trà là một trong những ngôi chùa nổi tiếng nhất ở Đà Nẵng, nổi bật với tượng Bồ Tát cao và tầm nhìn ra biển.",
    relatedCompares: [1] // ID từ compareList
  },
  {
    id: 2,
    title: "Cầu Rồng - Biểu tượng của Đà Nẵng",
    date: "1998",
    likes: 987,
    category: "Kiến trúc",
    image: "https://haycafe.vn/wp-content/uploads/2022/01/Hinh-anh-cau-Rong.jpg",
    description: "Cầu Rồng được thiết kế như một con rồng phun lửa và phun nước vào cuối tuần, là điểm đến hấp dẫn cho cả du khách và người dân địa phương.",
    relatedCompares: [2]
  },
  {
    id: 3,
    title: "Bà Nà Hills - Thiên đường nghỉ dưỡng",
    date: "1992",
    likes: 1456,
    category: "Du lịch",
    image: "https://cdn3.ivivu.com/2024/04/sun-world-ba-na-hills-ivivu45.jpg",
    description: "Bà Nà Hills nổi tiếng với khí hậu mát mẻ, khu vui chơi và kiến trúc châu Âu giả tưởng, phù hợp cho các chuyến dã ngoại gia đình.",
    relatedCompares: [3]
  },
  {
    id: 4,
    title: "Phố cổ Hội An - Di sản văn hóa",
    date: "1987",
    likes: 652,
    category: "Văn hóa",
    image: "https://focusasiatravel.vn/wp-content/uploads/2018/09/Ph%E1%BB%91-C%E1%BB%95-H%E1%BB%99i-An1.jpg",
    description: "Phố cổ Hội An giữ được nhiều nét kiến trúc truyền thống, đèn lồng rực rỡ và ẩm thực đặc sắc, là nơi dừng chân không thể bỏ qua ở miền Trung.",
    relatedCompares: [4, 11]
  },
  {
    id: 5,
    title: "Đồi chè Cầu Đất - Lâm Đồng",
    date: "1990",
    likes: 321,
    category: "Thiên nhiên",
    image: "https://dalattrongtim.com/wp-content/uploads/2022/07/doi-che-cau-dat-2.jpg",
    description: "Đồi chè Cầu Đất trải dài bát ngát, thời tiết mát mẻ, phù hợp để chụp ảnh và trải nghiệm không gian đồng quê yên bình.",
    relatedCompares: [6, 10]
  },
  {
    id: 6,
    title: "Thác Bản Giốc - Kỳ quan miền Bắc",
    date: "1985",
    likes: 890,
    category: "Thiên nhiên",
    image: "https://photo-cms-plo.epicdn.me/Uploaded/2023/lcemdurlq/2022_10_16/thac-ba-gioc3-3757.jpg",
    description: "Thác Bản Giốc nằm trên biên giới Việt-Trung, mang vẻ hùng vĩ và nước chảy trắng xóa, là một trong những thắng cảnh đáng xem.",
    relatedCompares: [6]
  },
  {
    id: 7,
    title: "Nhà thờ Đức Bà - Sài Gòn",
    date: "1993",
    likes: 1102,
    category: "Kiến trúc",
    image: "https://tse2.mm.bing.net/th/id/OIP.iVCPDGJoDJDAO--wsKfvtAHaEo?pid=Api&P=0&h=220",
    description: "Nhà thờ Đức Bà là một công trình kiến trúc Pháp tiêu biểu giữa lòng TP.HCM, thu hút nhiều khách tham quan và nhiếp ảnh gia.",
    relatedCompares: [5, 8]
  },
  {
    id: 8,
    title: "Đà Lạt - Thành phố ngàn hoa",
    date: "1988",
    likes: 980,
    category: "Du lịch",
    image: "https://tse1.mm.bing.net/th/id/OIP.5zDQ4NXe8MNybDiPy7i0tgHaEF?pid=Api&P=0&h=220",
    description: "Đà Lạt nổi tiếng với khí hậu ôn hòa, hoa và rừng thông, là điểm nghỉ dưỡng lãng mạn của nhiều cặp đôi.",
    relatedCompares: [9, 12]
  },
  {
    id: 9,
    title: "Hồ Hoàn Kiếm - Trái tim Hà Nội",
    date: "1991",
    likes: 2100,
    category: "Văn hóa",
    image: "https://tse2.mm.bing.net/th/id/OIP.24VLsgPNrVCfPL3sKj_WPwHaE4?pid=Api&P=0&h=220",
    description: "Hồ Hoàn Kiếm là biểu tượng của Hà Nội, thích hợp cho các buổi dạo bộ, chụp ảnh và tìm hiểu lịch sử Tháp Rùa.",
    relatedCompares: [7]
  },
  {
    id: 10,
    title: "Cồn Cát Mũi Né - Trải nghiệm sa mạc",
    date: "1996",
    likes: 410,
    category: "Du lịch",
    image: "https://tse2.mm.bing.net/th/id/OIP.HWTZraGLciX9ENut9wXjWwHaE7?pid=Api&P=0&h=220",
    description: "Cồn cát Mũi Né cung cấp trải nghiệm trượt cát và ngắm bình minh, rất thú vị cho du khách ưa mạo hiểm.",
    relatedCompares: [3, 9]
  }
];

export default articles;
