/**
 * =============================================================================
 * COMPARE LIST - Dữ liệu cho trang SO SÁNH XƯA - NAY
 * =============================================================================
 * Sử dụng trong:
 * - FrontEnd/src/Component/Compare/CompareGallery.jsx (Gallery hiển thị tất cả ảnh so sánh)
 * - FrontEnd/src/pages/Compare/CompareDetail.jsx (Chi tiết từng ảnh so sánh)
 * - FrontEnd/src/pages/gallery/ImageLibraryInformation.jsx (Phần "Related Compare")
 * 
 * Mỗi item bao gồm:
 * - id: ID duy nhất
 * - title: Tên địa điểm/công trình
 * - oldSrc: URL ảnh XƯA
 * - newSrc: URL ảnh NAY
 * - yearOld: Năm chụp ảnh cũ
 * - yearNew: Năm chụp ảnh mới
 * - category: Thể loại (Văn hóa, Kiến trúc, Du lịch, Thiên nhiên)
 * - description: Mô tả chi tiết
 * - historicalNote: Ghi chú lịch sử
 * - culturalValue: Giá trị văn hóa
 * =============================================================================
 */
/**
 * Compare list aligned with DB (ImageComparisons + Images + Articles)
 * Fields kept for frontend convenience:
 * - id: local id (kept for existing components)
 * - ComparisonID: PK from ImageComparisons
 * - HistoricalImageID, ModernImageID: FK to images table
 * - ArticleID: related article
 * - oldSrc/newSrc: image URLs (from Images.FilePath)
 * - yearOld/yearNew, location, likes, category, description...
 */
const compareList = [
  {
    id: 1,
    ComparisonID: 1,
  ArticleID: 1,
    title: "Chùa Linh Ứng",
    oldSrc: "https://tse2.mm.bing.net/th/id/OIP.24VLsgPNrVCfPL3sKj_WPwHaE4?pid=Api&P=0&h=220",
    newSrc: "https://statics.vinpearl.com/chua-linh-ung-da-nang-3.jpg",
    yearOld: "1950",
    yearNew: "2024",
    likes: 245,
    category: "Văn hóa",
    location: "Bán đảo Sơn Trà, Đà Nẵng",
    description:
      "So sánh hình ảnh cho thấy sự mở rộng và tu bổ của chùa qua nhiều thập kỷ.",
    historicalNote:
      "Ban đầu là ngôi chùa nhỏ, nhiều lần trùng tu đặc biệt sau 2004.",
    culturalValue:
      "Biểu tượng văn hóa - tâm linh của Đà Nẵng."
  },
  {
    id: 2,
    ComparisonID: 2,
  ArticleID: 2,
    title: "Cầu Rồng",
    oldSrc: "https://example.com/dragon_old.jpg",
    newSrc: "https://haycafe.vn/wp-content/uploads/2022/01/Hinh-anh-cau-Rong.jpg",
    yearOld: "2009",
    yearNew: "2024",
    likes: 189,
    category: "Kiến trúc",
    location: "Sông Hàn, Đà Nẵng",
    description: "Cầu Rồng - biểu tượng kiến trúc hiện đại của thành phố.",
    historicalNote: "Khởi công 2009, khánh thành 2013.",
    culturalValue: "Biểu tượng thành phố, thu hút du lịch."
  },
  {
    id: 3,
    ComparisonID: 3,
  ArticleID: 3,
    title: "Bãi biển Mỹ Khê",
    oldSrc: "https://example.com/mykhe_old.jpg",
    newSrc: "https://images.unsplash.com/photo-1549880338-65ddcdfd017b",
    yearOld: "1970",
    yearNew: "2024",
    likes: 156,
    category: "Du lịch",
    location: "Phường Phước Mỹ, Đà Nẵng",
    description: "Bãi biển thay đổi theo thời kỳ phát triển du lịch.",
    historicalNote: "Từ hoang sơ tới điểm nóng du lịch.",
    culturalValue: "Thể hiện phát triển du lịch bền vững."
  },
  // thêm item khác nếu cần...
];

export default compareList;
