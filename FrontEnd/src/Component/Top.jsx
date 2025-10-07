import React, { useEffect } from 'react';
import "../Styles/Top.css";

const items = [
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

const Top = () => {
  useEffect(() => {
    const cards = document.querySelectorAll('.top-card');
    const singles = document.querySelectorAll('.top-header h2, .top-actions .top-button');
    const containers = document.querySelectorAll('.top-header, .top-actions');
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        const ratio = e.intersectionRatio || 0;
        if (ratio >= 0.25) {
          e.target.classList.add('show');
        } else if (ratio <= 0.05) {
          e.target.classList.remove('show');
        }
      });
    }, { threshold: [0, 0.05, 0.25], root: null, rootMargin: '0px' });
    cards.forEach((c, i) => {
      c.style.transitionDelay = `${0.08 * i}s`;
      io.observe(c);
    });
    singles.forEach((el) => io.observe(el));
    containers.forEach((el) => io.observe(el));

    const maybeReveal = (el) => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.9) {
        el.classList.add('show');
      }
    };
    requestAnimationFrame(() => {
      cards.forEach(maybeReveal);
      singles.forEach(maybeReveal);
      containers.forEach(maybeReveal);
    });
    return () => io.disconnect();
  }, []);

  return (
    <section className="top-section">
      <div className="top-header">
        <h2>Top tin mới</h2>
      </div>
      <div className="top-grid">
        {items.map((it) => (
          <a key={it.title} className="top-card" href={it.href}>
            <div className="top-media">
              <img src={it.image} alt={it.title} />
            </div>
            <div className="top-content">
              <div className="top-title">{it.title}</div>
              <div className="top-author">Người đăng: {it.author}</div>
            </div>
          </a>
        ))}
      </div>
      <div className="top-actions">
        <a className="top-button" href="#">Xem nhiều câu truyện</a>
      </div>
    </section>
  );
};

export default Top;
