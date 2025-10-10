import "../Styles/Timeline/Timeline.css";
import { useEffect } from "react";
import { TIMELINE_ITEMS } from "../util/constant";
import Headers from "../Component/home/Headers";

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
    <div>
      <Headers />
    <section className="timeline">
      <h2 className="tl-heading">Dòng thời gian</h2>
      <div className="tl-container">
        <div className="tl-line" />
        {TIMELINE_ITEMS.map((item, idx) => (
          <div key={item.date} className={`tl-item ${idx % 2 === 0 ? "left" : "right"}`}>
            <div className="tl-dot" />
            <a
              className="tl-card"
              href="#"
              // set a CSS custom property for the ::before blurred layer and keep backgroundImage as fallback
              style={{ ['--tl-bg']: `url(${item.image})`, backgroundImage: `url(${item.image})` }}
            >
              <div className="tl-card-overlay" />
              <div className="tl-date">{item.date}</div>
              <div className="tl-title">{item.title}</div>
              <div className="tl-desc">{item.desc}</div>
            </a>
          </div>
        ))}
      </div>
    </section>
    </div>
  );
}

export default Timeline;
