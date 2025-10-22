/**
 * =============================================================================
 * POSTS - Dữ liệu cho CỘNG ĐỒNG (Community)
 * =============================================================================
 * Sử dụng trong:
 * - FrontEnd/src/pages/community/Community.jsx (Hiển thị các bài đăng của cộng đồng)
 * - FrontEnd/src/Component/Community/PostCard.jsx (Card component cho mỗi post)
 * 
 * Cấu trúc:
 * - id: ID duy nhất
 * - author: Tên người đăng
 * - when: Thời gian đăng (string format tương đối)
 * - category: Thể loại bài viết
 * - text: Nội dung bài đăng
 * - likes: Số lượt thích
 * - image: URL hình ảnh đính kèm
 * 
 * Note: Đây là dữ liệu mẫu cho phần Community/Social feed
 * =============================================================================
 */
const posts = [
  {
    id: 1,
    author: 'Nguyễn Văn An',
    when: '582 ngày trước',
    category: 'Văn hóa',
    text: 'Chùa Linh Ứng trên bán đảo Sơn Trà - một trong những biểu tượng tâm linh của Đà Nẵng. Tượng Phật Quan Âm cao 67m thực sự ấn tượng! 🙏',
    likes: 245,
    image: 'https://tse2.mm.bing.net/th/id/OIP.HWTZraGLciX9ENut9wXjWwHaE7?pid=Api&P=0&h=220'
  },
  {
    id: 2,
    author: 'Lê Thị B',
    when: '120 ngày trước',
    category: 'Du lịch',
    text: 'Hoàng hôn trên sông Hàn thật đẹp!',
    likes: 98,
    image: 'https://tse2.mm.bing.net/th/id/OIP.24VLsgPNrVCfPL3sKj_WPwHaE4?pid=Api&P=0&h=220'
  },
  
]

export default posts
