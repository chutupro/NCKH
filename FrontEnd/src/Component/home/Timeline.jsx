import "../../Styles/Home/Timeline.css";
import { useEffect } from "react";

const TIMELINE_ITEMS = [
  { date: "1890", title: "Hình thành khu dân cư", desc: "Những cộng đồng đầu tiên sinh sống và phát triển." },
  { date: "1930", title: "Công trình lịch sử", desc: "Nhiều công trình kiến trúc được xây dựng, lưu dấu thời gian." },
  { date: "1975", title: "Bước ngoặt lịch sử", desc: "Giai đoạn chuyển mình mạnh mẽ về văn hoá và xã hội." },
  { date: "2000", title: "Hiện đại hoá", desc: "Hạ tầng và đời sống đô thị phát triển nhanh chóng." },
  { date: "2025", title: "Bảo tồn & Phát huy", desc: "Gìn giữ di sản, lan toả giá trị đến cộng đồng." }
];

const Timeline = () => {
  useEffect(() => {
    const items = document.querySelectorAll(".tl-item");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate");
          } else {
            entry.target.classList.remove("animate");
          }
        });
      },
      { threshold: 0.25 }
    );
    items.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section className="timeline">
      <h2 className="tl-heading">Dòng thời gian</h2>
      <div className="tl-container">
        <div className="tl-line" />
        {TIMELINE_ITEMS.map((item, idx) => (
          <div key={item.date} className={`tl-item ${idx % 2 === 0 ? "left" : "right"}`}>
            <div className="tl-dot" />
            <a className="tl-card" href="#">
              <div className="tl-date">{item.date}</div>
              <div className="tl-title">{item.title}</div>
              <div className="tl-desc">{item.desc}</div>
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Timeline;
