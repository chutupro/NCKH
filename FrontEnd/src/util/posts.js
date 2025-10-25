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
  {
    id: 3,
    author: 'Trần Minh C',
    when: '2 ngày trước',
    category: 'Kiến trúc',
    text: 'Cầu Rồng về đêm lung linh ánh đèn, phun lửa và nước vào cuối tuần. Một kiệt tác kiến trúc hiện đại của Đà Nẵng! 🐉',
    likes: 567,
    image: 'https://haycafe.vn/wp-content/uploads/2022/01/Hinh-anh-cau-Rong.jpg'
  },
  {
    id: 4,
    author: 'Phạm Thu D',
    when: '5 ngày trước',
    category: 'Thiên nhiên',
    text: 'Bãi biển Mỹ Khê - một trong những bãi biển đẹp nhất hành tinh. Nước trong xanh, cát trắng mịn. Tuyệt vời! 🌊',
    likes: 432,
    image: 'https://images.unsplash.com/photo-1549880338-65ddcdfd017b?w=800'
  },
  {
    id: 5,
    author: 'Hoàng Văn E',
    when: '1 tuần trước',
    category: 'Văn hóa',
    text: 'Phố cổ Hội An với những chiếc đèn lồng rực rỡ. Khung cảnh thơ mộng đến lạ thường, như lạc vào thế giới cổ tích! 🏮',
    likes: 823,
    image: 'https://focusasiatravel.vn/wp-content/uploads/2018/09/Ph%E1%BB%91-C%E1%BB%95-H%E1%BB%99i-An1.jpg'
  },
  {
    id: 6,
    author: 'Vũ Thị F',
    when: '10 ngày trước',
    category: 'Du lịch',
    text: 'Bà Nà Hills - thiên đường trên mây. Cầu Vàng và Làng Pháp tạo nên một không gian tuyệt đẹp! ☁️',
    likes: 945,
    image: 'https://cdn3.ivivu.com/2024/04/sun-world-ba-na-hills-ivivu45.jpg'
  },
  {
    id: 7,
    author: 'Đỗ Minh G',
    when: '2 tuần trước',
    category: 'Kiến trúc',
    text: 'Bảo tàng Điêu khắc Chăm - nơi lưu giữ nền văn hóa Chăm Pa cổ kính. Những tác phẩm điêu khắc tinh xảo đến khó tin! 🗿',
    likes: 289,
    image: 'https://statics.vinpearl.com/bao-tang-dieu-khac-cham-da-nang-05_1625911239.jpg'
  },
]

export default posts
