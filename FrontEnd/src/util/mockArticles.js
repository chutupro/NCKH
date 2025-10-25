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
 /**
 * Mock data aligned with your database schema (ArticleID, Images, MapLocations, Timelines...)
 * Fields:
 * - ArticleID, Title, Content, Language, CreatedAt, UpdatedAt, UserID, CategoryID
 * - images: array of objects matching Images table (ImageID, FilePath, AltText, Type)
 * - likes, categoryName, description, relatedCompareIds (reference to compareList ids)
 */
const articles = [
  {
    ArticleID: 1,
    Title: "Chùa Linh Ứng - Bán đảo Sơn Trà",
    Content: "Chùa Linh Ứng trên bán đảo Sơn Trà là một trong những ngôi chùa nổi tiếng nhất ở Đà Nẵng...",
    Language: "vi",
    CreatedAt: "1995-01-01T00:00:00.000Z",
    UpdatedAt: "2024-01-01T00:00:00.000Z",
    UserID: 1,
    CategoryID: 1,
    categoryName: "Văn hóa",
    likes: 1234,
    description: "Nổi bật với tượng Bồ Tát cao và tầm nhìn ra biển.",
    images: [
      { ImageID: 101, FilePath: "https://statics.vinpearl.com/chua-linh-ung-da-nang-3.jpg", AltText: "Chùa Linh Ứng", Type: "main" }
    ],
    relatedCompareIds: [1]
  },
  {
    ArticleID: 2,
    Title: "Cầu Rồng - Biểu tượng của Đà Nẵng",
    Content: "Cầu Rồng được thiết kế như một con rồng phun lửa và phun nước...",
    Language: "vi",
    CreatedAt: "1998-01-01T00:00:00.000Z",
    UpdatedAt: "2024-01-01T00:00:00.000Z",
    UserID: 2,
    CategoryID: 2,
    categoryName: "Kiến trúc",
    likes: 987,
    description: "Điểm đến hấp dẫn cho cả du khách và người dân địa phương.",
    images: [
      { ImageID: 102, FilePath: "https://haycafe.vn/wp-content/uploads/2022/01/Hinh-anh-cau-Rong.jpg", AltText: "Cầu Rồng", Type: "main" }
    ],
    relatedCompareIds: [2]
  },
  {
    ArticleID: 3,
    Title: "Bà Nà Hills - Thiên đường nghỉ dưỡng",
    Content: "Bà Nà Hills nổi tiếng với khí hậu mát mẻ và kiến trúc châu Âu giả tưởng...",
    Language: "vi",
    CreatedAt: "1992-01-01T00:00:00.000Z",
    UpdatedAt: "2024-01-01T00:00:00.000Z",
    UserID: 3,
    CategoryID: 3,
    categoryName: "Du lịch",
    likes: 1456,
    description: "Phù hợp cho các chuyến dã ngoại gia đình.",
    images: [
      { ImageID: 103, FilePath: "https://cdn3.ivivu.com/2024/04/sun-world-ba-na-hills-ivivu45.jpg", AltText: "Bà Nà Hills", Type: "main" }
    ],
    relatedCompareIds: [3]
  },
  {
    ArticleID: 4,
    Title: "Phố cổ Hội An - Di sản văn hóa",
    Content: "Phố cổ Hội An giữ được nhiều nét kiến trúc truyền thống...",
    Language: "vi",
    CreatedAt: "1987-01-01T00:00:00.000Z",
    UpdatedAt: "2024-01-01T00:00:00.000Z",
    UserID: 4,
    CategoryID: 1,
    categoryName: "Văn hóa",
    likes: 652,
    description: "Đèn lồng rực rỡ và ẩm thực đặc sắc.",
    images: [
      { ImageID: 104, FilePath: "https://focusasiatravel.vn/wp-content/uploads/2018/09/Ph%E1%BB%91-C%E1%BB%95-H%E1%BB%99i-An1.jpg", AltText: "Phố cổ Hội An", Type: "main" }
    ],
    relatedCompareIds: [4, 11]
  },
  {
    ArticleID: 5,
    Title: "Đồi chè Cầu Đất - Lâm Đồng",
    Content: "Đồi chè Cầu Đất trải dài bát ngát...",
    Language: "vi",
    CreatedAt: "1990-01-01T00:00:00.000Z",
    UpdatedAt: "2024-01-01T00:00:00.000Z",
    UserID: 5,
    CategoryID: 4,
    categoryName: "Thiên nhiên",
    likes: 321,
    description: "Thời tiết mát mẻ, phù hợp để chụp ảnh.",
    images: [
      { ImageID: 105, FilePath: "https://dalattrongtim.com/wp-content/uploads/2022/07/doi-che-cau-dat-2.jpg", AltText: "Đồi chè Cầu Đất", Type: "main" }
    ],
    relatedCompareIds: [6, 10]
  },
  {
    ArticleID: 6,
    Title: "Bảo tàng Điêu khắc Chăm - Đà Nẵng",
    Content: "Bảo tàng lưu giữ những tác phẩm điêu khắc quý giá của nền văn hóa Chăm Pa...",
    Language: "vi",
    CreatedAt: "1985-01-01T00:00:00.000Z",
    UpdatedAt: "2024-01-01T00:00:00.000Z",
    UserID: 6,
    CategoryID: 1,
    categoryName: "Văn hóa",
    likes: 789,
    description: "Nơi lưu giữ di sản văn hóa Chăm Pa cổ kính và tinh xảo.",
    images: [
      { ImageID: 106, FilePath: "https://statics.vinpearl.com/bao-tang-dieu-khac-cham-da-nang-05_1625911239.jpg", AltText: "Bảo tàng Chăm", Type: "main" }
    ],
    relatedCompareIds: [1]
  },
  {
    ArticleID: 7,
    Title: "Ngũ Hành Sơn - Núi Non Nước",
    Content: "Ngũ Hành Sơn gồm 5 ngọn núi đá vôi tượng trưng cho ngũ hành...",
    Language: "vi",
    CreatedAt: "1988-01-01T00:00:00.000Z",
    UpdatedAt: "2024-01-01T00:00:00.000Z",
    UserID: 7,
    CategoryID: 4,
    categoryName: "Thiên nhiên",
    likes: 1123,
    description: "Danh thắng nổi tiếng với động Huyền Không và chùa Linh Ứng.",
    images: [
      { ImageID: 107, FilePath: "https://tse3.mm.bing.net/th?id=OIP.8vYWfqYxK9rWAXX7LR0d3AHaE8&pid=Api", AltText: "Ngũ Hành Sơn", Type: "main" }
    ],
    relatedCompareIds: [2, 3]
  },
  {
    ArticleID: 8,
    Title: "Bãi biển Mỹ Khê - Đà Nẵng",
    Content: "Một trong những bãi biển đẹp nhất thế giới theo bình chọn...",
    Language: "vi",
    CreatedAt: "1993-01-01T00:00:00.000Z",
    UpdatedAt: "2024-01-01T00:00:00.000Z",
    UserID: 8,
    CategoryID: 3,
    categoryName: "Du lịch",
    likes: 2045,
    description: "Bãi biển với cát trắng mịn, nước trong xanh tuyệt đẹp.",
    images: [
      { ImageID: 108, FilePath: "https://images.unsplash.com/photo-1549880338-65ddcdfd017b?w=800", AltText: "Bãi biển Mỹ Khê", Type: "main" }
    ],
    relatedCompareIds: [3]
  },
  {
    ArticleID: 9,
    Title: "Cầu Vàng - Bà Nà Hills",
    Content: "Cầu Vàng với đôi bàn tay khổng lồ nâng đỡ, biểu tượng kiến trúc độc đáo...",
    Language: "vi",
    CreatedAt: "1996-01-01T00:00:00.000Z",
    UpdatedAt: "2024-01-01T00:00:00.000Z",
    UserID: 9,
    CategoryID: 2,
    categoryName: "Kiến trúc",
    likes: 3210,
    description: "Công trình kiến trúc ấn tượng giữa núi rừng Bà Nà.",
    images: [
      { ImageID: 109, FilePath: "https://tse4.mm.bing.net/th?id=OIP.jQc5x3v6zTD5YW0fPzKZzgHaEK&pid=Api", AltText: "Cầu Vàng", Type: "main" }
    ],
    relatedCompareIds: [3]
  },
];

export default articles;
