import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { useEffect } from "react";
import "../../Styles/Home/Exploration.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const Exploration = () => {
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
        <p>Khám phá</p>
        <h1>Bộ sưu tập di sản</h1>
        <p>Những tư liệu, hình ảnh và câu chuyện mới nhất về Đà Nẵng</p>
      </div>
      <div className="container-inf">
        <div className="content-inf content-inf--feature">
          <div className="content-inf-item">
            <p className="eyebrow">Nổi bật</p>
            <h2 className="title">Những câu chuyện đáng chú ý</h2>
            <span className="desc">Khám phá những di sản văn hóa độc đáo của Đà Nẵng</span>
            <a className="cta" href="#">Xem chi tiết <FontAwesomeIcon icon={faArrowRight} /></a>
          </div>
          <div className="media">
            <img src="https://nhacxua.vn/wp-content/uploads/2021/07/da-nang-16.jpg" alt="feature" />
          </div>
        </div>

        {/* Newest card (text top, image bottom) */}
        <div className="content-inf">
          <div className="content-inf-item">
            <p className="eyebrow">Mới đăng</p>
            <h2 className="title">Tư liệu mới</h2>
            <span className="desc">Những phát hiện mới nhất về lịch sử địa phương</span>
            <a className="cta" href="#">Xem ngay <FontAwesomeIcon icon={faArrowRight} /></a>
          </div>
          <div className="media">
            <img src="https://nhacxua.vn/wp-content/uploads/2021/07/da-nang-18.jpg" alt="new" />
          </div>
        </div>

        {/* Category card (text top, image bottom) */}
        <div className="content-inf">
          <div className="content-inf-item">
            <p className="eyebrow">Theo chủ đề</p>
            <h2 className="title">Chuyên mục</h2>
            <span className="desc">Khám phá di sản theo từng lĩnh vực cụ thể</span>
            <a className="cta" href="#">Khám phá <FontAwesomeIcon icon={faArrowRight} /></a>
          </div>
          <div className="media">
            <img src="https://nhacxua.vn/wp-content/uploads/2021/07/da-nang-8.jpg" alt="category" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Exploration;
