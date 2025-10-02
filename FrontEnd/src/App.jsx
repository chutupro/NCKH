import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAddressCard, faAngleDoubleDown, faHome, faSquare, faUsers } from "@fortawesome/free-solid-svg-icons";
import "./App.css";

function App() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="app-container">
      <header className="header">
        <nav className="navbar">
          <div className="nav-links">
            <span className="font-handwriting">Logo</span>

            <a href="#" className="nav-link">
              Khám phá
            </a>
            <a href="#" className="nav-link">
              Bản đồ
            </a>
            <a href="#" className="nav-link">
              Timeline
            </a>
            <div className="nav-item">
              <a href="#" onClick={() => setIsOpen(!isOpen)} className="nav-link">
                Tư liệu <FontAwesomeIcon icon={faAngleDoubleDown} />
              </a>
              {isOpen && (
                <div className="sidebar">
                  <div className="container">
                    <div className="menu-column">
                      <div className="menu-item">
                        <a href="#" className="menu-link">
                          <FontAwesomeIcon icon={faHome} /> Trang chủ
                        </a>
                        <a href="#" className="menu-link">
                          Kho lưu trữ di sản văn hóa
                        </a>
                      </div>
                      <div className="menu-item">
                        <a href="#" className="menu-link">
                          <FontAwesomeIcon icon={faSquare} /> Bộ sưu tập
                        </a>
                        <a href="#" className="menu-link">
                          Tài nguyên
                        </a>
                      </div>
                      <div className="menu-item">
                        <a href="#" className="menu-link">
                          <FontAwesomeIcon icon={faUsers} /> Cộng đồng
                        </a>
                        <a href="#" className="menu-link">
                          Hỗ trợ nghiên cứu
                        </a>
                      </div>
                      <div className="menu-item">
                        <a href="#" className="menu-link">
                          <FontAwesomeIcon icon={faAddressCard} /> Liên hệ
                        </a>
                        <a href="#" className="menu-link">
                          Góc học thuật
                        </a>
                      </div>
                    </div>
                    <div className="menu-column">
                      <div className="menu-item">
                        <a href="#" className="menu-link">
                          <FontAwesomeIcon icon={faHome} /> Trang chủ
                        </a>
                        <a href="#" className="menu-link">
                          Kho lưu trữ di sản văn hóa
                        </a>
                      </div>
                      <div className="menu-item">
                        <a href="#" className="menu-link">
                          <FontAwesomeIcon icon={faSquare} /> Bộ sưu tập
                        </a>
                        <a href="#" className="menu-link">
                          Tài nguyên
                        </a>
                      </div>
                      <div className="menu-item">
                        <a href="#" className="menu-link">
                          <FontAwesomeIcon icon={faUsers} /> Cộng đồng
                        </a>
                        <a href="#" className="menu-link">
                          Hỗ trợ nghiên cứu
                        </a>
                      </div>
                      <div className="menu-item">
                        <a href="#" className="menu-link">
                          <FontAwesomeIcon icon={faAddressCard} /> Liên hệ
                        </a>
                        <a href="#" className="menu-link">
                          Góc học thuật
                        </a>
                      </div>
                    </div>
                    <div className="menu-column">
                      <div className="menu-item">
                        <a href="#" className="menu-link">
                          <FontAwesomeIcon icon={faHome} /> Trang chủ
                        </a>
                        <a href="#" className="menu-link">
                          Kho lưu trữ di sản văn hóa
                        </a>
                      </div>
                      <div className="menu-item">
                        <a href="#" className="menu-link">
                          <FontAwesomeIcon icon={faSquare} /> Bộ sưu tập
                        </a>
                        <a href="#" className="menu-link">
                          Tài nguyên
                        </a>
                      </div>
                      <div className="menu-item">
                        <a href="#" className="menu-link">
                          <FontAwesomeIcon icon={faUsers} /> Cộng đồng
                        </a>
                        <a href="#" className="menu-link">
                          Hỗ trợ nghiên cứu
                        </a>
                      </div>
                      <div className="menu-item">
                        <a href="#" className="menu-link">
                          <FontAwesomeIcon icon={faAddressCard} /> Liên hệ
                        </a>
                        <a href="#" className="menu-link">
                          Góc học thuật
                        </a>
                      </div>
                      <div className="menu-it">
                        <h1>Bài Viết nổi bật</h1>

                      </div>
                      
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="nav-buttons">
            <button className="nav-buttonDongGop">Đóng góp</button>
            <button className="nav-buttonThamGia">Tham gia</button>
          </div>
        </nav>
      </header>

    </div>
  );
}

export default App;