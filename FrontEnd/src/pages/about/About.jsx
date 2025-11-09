import React, { useState } from 'react'
import '../../Styles/About/About.css'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import ProtectedLink from '../../Component/common/ProtectedLink'

const About = () => {
  const { t } = useTranslation()

  // Team: top 3 in first row, 2 in second row (centered)
  const team = [
    { id: 1, name: 'Nguyễn Minh Khán', role: 'AI', img: '/images/team/nguyen-minh-khan.jpg', bio: 'Nghiên cứu và triển khai mô hình AI cho tìm kiếm hình ảnh.' },
    { id: 2, name: 'Lê Văn Nghĩa', role: 'Full Stack', img: '/images/team/le-van-nghia.jpg', bio: 'Kiến trúc hệ thống, API và tích hợp backend/frontend.' },
    { id: 3, name: 'Phan Tấn Doanh', role: 'Frontend', img: '/images/team/phan-tan-doanh.jpg', bio: 'Thiết kế giao diện và trải nghiệm người dùng.' },
    { id: 4, name: 'Huỳnh Duy Ân', role: 'Full Stack', img: '/images/team/huynh-duy-an.jpg', bio: 'Phát triển tính năng và tối ưu hiệu năng.' },
    { id: 5, name: 'Nguyễn Văn Đức', role: 'Backend', img: '/images/team/nguyen-van-duc.jpg', bio: 'Quản lý cơ sở dữ liệu và xử lý ảnh trên server.' }
  ]

  // FAQ state
  const [openFaq, setOpenFaq] = useState(null)

  const faqs = [
    { q: 'Làm sao để đóng góp ảnh?', a: 'Bạn vào trang Đóng góp (Contribute), chọn ảnh, điền thông tin và gửi. Ảnh sẽ được kiểm duyệt trước khi hiển thị.' },
    { q: 'Ảnh có bị cấm đăng không?', a: 'Chúng tôi tuân thủ chính sách nội dung. Ảnh có nội dung bạo lực, khiêu dâm hoặc vi phạm bản quyền sẽ không được chấp nhận.' },
    { q: 'Làm sao để liên hệ hợp tác?', a: 'Gửi email trực tiếp tới phandoanh2110@gmail.com hoặc dùng form liên hệ bên dưới.' },
    { q: 'Kích thước và định dạng ảnh?', a: 'Chúng tôi hỗ trợ JPG, PNG và WEBP. Kích thước tối đa khuyến nghị là 10MB. Ảnh lớn có thể bị nén tự động khi tải lên.' },
    { q: 'Quyền sở hữu ảnh sau khi đóng góp?', a: 'Bạn giữ bản quyền ảnh; khi đóng góp bạn đồng ý cho phép nền tảng hiển thị và sử dụng ảnh cho mục đích giáo dục và trưng bày với ghi nguồn.' },
    { q: 'Dữ liệu cá nhân được xử lý thế nào?', a: 'Chúng tôi chỉ lưu thông tin liên hệ để quản lý đóng góp và liên hệ khi cần. Không chia sẻ dữ liệu cá nhân cho bên thứ ba trái phép.' }
  ]

  return (
    <main className="about-page">
      <div className="about-hero">
        <div className="about-hero-inner">
          <h1 className="about-title">{t('about.title') || 'Về chúng tôi'}</h1>
          <p className="about-sub">{t('about.subtitle') || 'Kho tàng di sản Đà Nẵng - Nơi lưu giữ và chia sẻ những giá trị văn hóa quý báu của thành phố.'}</p>
          <div className="about-hero-actions">
            <ProtectedLink to="/contribute" className="about-cta">{t('about.contributeNow') || 'Đóng góp ảnh'}</ProtectedLink>
            <Link to="/ImageLibrary" className="about-cta ghost">{t('about.browse') || 'Duyệt bộ sưu tập'}</Link>
          </div>
        </div>
      </div>

      <div className="about-content container">
        <section className="about-section">
          <h2>Chúng tôi làm gì</h2>
          <p>
            Chúng tôi xây dựng một nền tảng để cộng đồng có thể lưu giữ, đóng góp và khám phá những hình ảnh, câu chuyện về văn hoá, kiến trúc và đời sống của Đà Nẵng.
            Dữ liệu này phục vụ cho nghiên cứu, giáo dục và truyền thông văn hoá địa phương.
          </p>

          <div className="values-grid">
            <div className="value-item">
              <strong>Bảo tồn</strong>
              <p>Giữ gìn ký ức và tư liệu số.</p>
            </div>
            <div className="value-item">
              <strong>Cộng đồng</strong>
              <p>Khuyến khích mọi người cùng đóng góp và chia sẻ.</p>
            </div>
            <div className="value-item">
              <strong>Tính minh bạch</strong>
              <p>Quy trình kiểm duyệt và sử dụng dữ liệu rõ ràng.</p>
            </div>
          </div>
        </section>

        

        

        <section className="about-section">
          <h2>Đội ngũ</h2>
          <div className="team-grid-top">
            {team.slice(0,3).map(member => (
              <div className="team-member" key={member.id}>
                <div className="avatar-wrap">
                  {member.img ? (
                    <img src={member.img} alt={member.name} className="avatar-img" />
                  ) : (
                    <div className="avatar-initials">{member.name.split(' ').map(n => n[0]).slice(-2).join('')}</div>
                  )}
                </div>
                <h4 className="member-name">{member.name}</h4>
                <p className="member-role">{member.role}</p>
                <p className="member-bio">{member.bio}</p>
              </div>
            ))}
          </div>

          <div className="team-grid-bottom">
            {team.slice(3).map(member => (
              <div className="team-member" key={member.id}>
                <div className="avatar-wrap">
                  {member.img ? (
                    <img src={member.img} alt={member.name} className="avatar-img" />
                  ) : (
                    <div className="avatar-initials">{member.name.split(' ').map(n => n[0]).slice(-2).join('')}</div>
                  )}
                </div>
                <h4 className="member-name">{member.name}</h4>
                <p className="member-role">{member.role}</p>
                <p className="member-bio">{member.bio}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="about-section">
          <h2>FAQ</h2>
          <div className="faq">
            {faqs.map((f, i) => (
              <div className={`faq-item ${openFaq === i ? 'open' : ''}`} key={i} onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                <div className="faq-q">{f.q}</div>
                {openFaq === i && <div className="faq-a">{f.a}</div>}
              </div>
            ))}
          </div>
        </section>

        <section className="about-section">
          <h2>Liên hệ</h2>
          <p>Nếu bạn muốn hợp tác hoặc có câu hỏi, hãy gửi mail cho chúng tôi hoặc sử dụng form dưới đây.</p>
          <form className="contact-form" onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.target); console.log('Contact form', Object.fromEntries(fd)); alert('Cảm ơn! Chúng tôi sẽ liên hệ lại sớm.'); e.target.reset(); }}>
            <div className="form-row">
              <input name="name" placeholder="Họ và tên" required />
              <input name="email" type="email" placeholder="Email" required />
            </div>
            <textarea name="message" placeholder="Nội dung" rows={4} required />
            <div className="form-actions">
              <button className="about-cta" type="submit">Gửi</button>
              <a className="about-cta ghost" href="mailto:phandoanh2110@gmail.com">Gửi email trực tiếp</a>
            </div>
          </form>
        </section>
      </div>
    </main>
  )
}

export default About
