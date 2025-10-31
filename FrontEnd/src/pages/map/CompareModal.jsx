// src/pages/map/CompareModal.jsx
import React, { useState, useRef, useEffect } from "react";

const CompareModal = ({ place, onClose }) => {
  const [sliderPos, setSliderPos] = useState(50); // % từ trái
  const containerRef = useRef(null);
  const isDragging = useRef(false);

  const oldImageUrl = place.oldImage
    ? `http://localhost:3000${place.oldImage}`
    : "https://via.placeholder.com/600x400?text=Chưa+có+hình+xưa";

  const currentImageUrl = place.image
    ? `http://localhost:3000${place.image}`
    : "https://via.placeholder.com/600x400?text=Chưa+có+hình+hiện+tại";

  // Xử lý kéo chuột / cảm ứng
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMove = (clientX) => {
      if (!isDragging.current) return;
      const rect = container.getBoundingClientRect();
      const x = clientX - rect.left;
      const width = rect.width;
      const percent = Math.max(0, Math.min(100, (x / width) * 100));
      setSliderPos(percent);
    };

    const handleMouseMove = (e) => handleMove(e.clientX);
    const handleTouchMove = (e) => {
      e.preventDefault();
      handleMove(e.touches[0].clientX);
    };

    const handleUp = () => {
      isDragging.current = false;
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleUp);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleUp);
    };

    const handleDown = (e) => {
      isDragging.current = true;
      if (e.type === "mousedown") {
        handleMove(e.clientX);
        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleUp);
      } else if (e.type === "touchstart") {
        handleMove(e.touches[0].clientX);
        document.addEventListener("touchmove", handleTouchMove, { passive: false });
        document.addEventListener("touchend", handleUp);
      }
    };

    container.addEventListener("mousedown", handleDown);
    container.addEventListener("touchstart", handleDown, { passive: false });

    return () => {
      container.removeEventListener("mousedown", handleDown);
      container.removeEventListener("touchstart", handleDown);
      handleUp();
    };
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0,0,0,0.5)",
        backdropFilter: "blur(4px)",
        zIndex: 10001,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "90%",
          maxWidth: "800px",
          maxHeight: "80vh",
          background: "white",
          borderRadius: "16px",
          overflow: "hidden",
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
          position: "relative",
          fontFamily: "system-ui",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ padding: "20px", position: "relative" }}>
          {/* NÚT ĐÓNG */}
          <div
            onClick={onClose}
            style={{
              position: "absolute",
              top: "12px",
              right: "12px",
              width: "36px",
              height: "36px",
              background: "rgba(0,0,0,0.1)",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              zIndex: 10,
            }}
          >
            <span style={{ fontSize: "1.4rem", color: "#666" }}>×</span>
          </div>

          <h3
            style={{
              margin: "0 0 20px",
              fontSize: "1.4rem",
              fontWeight: 600,
              color: "#1a0dab",
              textAlign: "center",
            }}
          >
            So sánh qua các thời kỳ
          </h3>

          {/* CONTAINER SO SÁNH */}
          <div
            ref={containerRef}
            style={{
              position: "relative",
              width: "100%",
              height: "500px",
              borderRadius: "12px",
              overflow: "hidden",
              background: "#f8f9fa",
              cursor: "ew-resize",
              userSelect: "none",
            }}
          >
            {/* ẢNH HIỆN TẠI (PHẢI) */}
            <img
              src={currentImageUrl}
              alt="Hình nay"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />

            {/* ẢNH XƯA (TRÁI) - BỊ CẮT THEO SLIDER */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: `${sliderPos}%`,
                height: "100%",
                overflow: "hidden",
              }}
            >
              <img
                src={oldImageUrl}
                alt="Hình xưa"
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            </div>

            {/* THANH TRƯỢT */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: `${sliderPos}%`,
                width: "4px",
                height: "100%",
                background: "#1a73e8",
                transform: "translateX(-50%)",
                pointerEvents: "none",
                boxShadow: "0 0 8px rgba(0,0,0,0.3)",
                zIndex: 5,
              }}
            />

            {/* NÚT KÉO */}
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: `${sliderPos}%`,
                transform: "translate(-50%, -50%)",
                width: "44px",
                height: "44px",
                background: "white",
                border: "3px solid #1a73e8",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                cursor: "ew-resize",
                zIndex: 6,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1a73e8" strokeWidth="3">
                <path d="M8 5l-4 4 4 4M16 5l4 4-4 4" />
              </svg>
            </div>

            {/* NHÃN */}
            <div
              style={{
                position: "absolute",
                bottom: "16px",
                left: "16px",
                background: "rgba(0,0,0,0.6)",
                color: "white",
                padding: "6px 12px",
                borderRadius: "8px",
                fontSize: "0.85rem",
                fontWeight: "600",
                pointerEvents: "none",
                zIndex: 5,
              }}
            >
              Hình xưa: 1990
            </div>
            <div
              style={{
                position: "absolute",
                bottom: "16px",
                right: "16px",
                background: "rgba(0,0,0,0.6)",
                color: "white",
                padding: "6px 12px",
                borderRadius: "8px",
                fontSize: "0.85rem",
                fontWeight: "600",
                pointerEvents: "none",
                zIndex: 5,
              }}
            >
              Hình nay: 2025
            </div>
          </div>

          {/* CHỮ DƯỚI */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: "16px",
              fontSize: "0.9rem",
              color: "#555",
            }}
          >
            <p>
              <strong>Hình xưa:</strong> {place.oldImage ? "1990" : "Chưa có"}
            </p>
            <p>
              <strong>Hình nay:</strong> {place.image ? "2025" : "Chưa có"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompareModal;