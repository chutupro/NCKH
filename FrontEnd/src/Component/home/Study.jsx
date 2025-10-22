
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { useEffect } from "react";
import "../../Styles/Home/Exploration.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const Study = () => {
  useEffect(() => {
    const cards = document.querySelectorAll(".content-inf");
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

    cards.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
  return (
    <div className="container-explo">
      <div className="header-explo" >
        <p>Học tập</p>
        <h1>Không gian giáo dục  di sản</h1>
        <p>Nguồn tài nguyên phong phú dành cho giáo viên và học sinh</p>
      </div>
      <div className="container-inf">
        <div className="content-inf content-inf--feature">
          <div className="content-inf-item">
            <p className="eyebrow">Bộ sưu tập</p>
            <h2 className="title">Chuyên đề học tập</h2>
            <span className="desc">Các tài liệu chuyên sâu về lịch sử Đà Nẵng</span>
            <a className="cta" href="#">Xem chi tiết <FontAwesomeIcon icon={faArrowRight} /></a>
          </div>
          <div className="media">
            <img src="https://nhacxua.vn/wp-content/uploads/2021/07/da-nang-48.jpg" alt="feature" />
          </div>
        </div>

        {/* Newest card (text top, image bottom) */}
        <div className="content-inf">
          <div className="content-inf-item">
            <p className="eyebrow">Tài nguyên</p>
            <h2 className="title">Công cụ nguyên cứu</h2>
            <span className="desc">Hướng dẫn và phương pháp nguyên cứu</span>
            <a className="cta" href="#">Xem ngay <FontAwesomeIcon icon={faArrowRight} /></a>
          </div>
          <div className="media">
            <img src="https://nhacxua.vn/wp-content/uploads/2021/07/da-nang-51.jpg" alt="new" />
          </div>
        </div>

        {/* Category card (text top, image bottom) */}
        <div className="content-inf">
          <div className="content-inf-item">
            <p className="eyebrow">Góc giáo dục</p>
            <h2 className="title">Hoạt động ngoại khóa</h2>
            <span className="desc">Các vị trí hổ trợ khám phá lịch sử Đà Nẵng</span>
            <a className="cta" href="#">Khám phá <FontAwesomeIcon icon={faArrowRight} /></a>
          </div>
          <div className="media">
            <img src="https://nhacxua.vn/wp-content/uploads/2021/07/da-nang-52.jpg" alt="category" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Study;