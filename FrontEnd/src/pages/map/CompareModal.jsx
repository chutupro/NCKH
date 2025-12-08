// src/pages/map/CompareModal.jsx
import React, { useState, useRef, useEffect, useCallback } from "react";

const CompareModal = ({ place, onClose }) => {
  const [sliderXPercent, setSliderXPercent] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [isMouseOver, setIsMouseOver] = useState(false);
  const sliderRef = useRef(null);
  const autoplayRef = useRef(null);

  const oldImageUrl = place.oldImage
    ? `http://localhost:3000${place.oldImage}`
    : "https://via.placeholder.com/600x400?text=Chưa+có+hình+xưa";

  const currentImageUrl = place.image
    ? `http://localhost:3000${place.image}`
    : "https://via.placeholder.com/600x400?text=Chưa+có+hình+hiện+tại";

  const oldYearLabel = place.oldImageYear || "Chưa rõ";
  const newYearLabel = place.imageYear || "Chưa rõ";

  // Autoplay effect
  const startAutoplay = useCallback(() => {
    const autoplayDuration = 3000;
    const startTime = Date.now();

    const animate = () => {
      if (!isMouseOver) {
        const elapsedTime = Date.now() - startTime;
        const progress =
          (elapsedTime % (autoplayDuration * 2)) / autoplayDuration;
        const percentage =
          progress <= 1 ? progress * 100 : (2 - progress) * 100;
        setSliderXPercent(percentage);
      }
      autoplayRef.current = setTimeout(animate, 16);
    };

    animate();
  }, [isMouseOver]);

  const stopAutoplay = useCallback(() => {
    if (autoplayRef.current) {
      clearTimeout(autoplayRef.current);
      autoplayRef.current = null;
    }
  }, []);

  useEffect(() => {
    startAutoplay();
    return () => stopAutoplay();
  }, [startAutoplay, stopAutoplay]);

  // Mouse/Touch handlers
  const handleMove = useCallback(
    (clientX) => {
      if (!sliderRef.current) return;
      if (isDragging) {
        const rect = sliderRef.current.getBoundingClientRect();
        const x = clientX - rect.left;
        const percent = (x / rect.width) * 100;
        requestAnimationFrame(() => {
          setSliderXPercent(Math.max(0, Math.min(100, percent)));
        });
      }
    },
    [isDragging]
  );

  const handleStart = useCallback(
    (clientX) => {
      setIsDragging(true);
      stopAutoplay();
    },
    [stopAutoplay]
  );

  const handleEnd = useCallback(() => {
    setIsDragging(false);
    startAutoplay();
  }, [startAutoplay]);

  const handleMouseDown = useCallback(
    (e) => handleStart(e.clientX),
    [handleStart]
  );
  const handleMouseUp = useCallback(() => handleEnd(), [handleEnd]);
  const handleMouseMove = useCallback(
    (e) => handleMove(e.clientX),
    [handleMove]
  );
  const handleTouchStart = useCallback(
    (e) => handleStart(e.touches[0].clientX),
    [handleStart]
  );
  const handleTouchEnd = useCallback(() => handleEnd(), [handleEnd]);
  const handleTouchMove = useCallback(
    (e) => handleMove(e.touches[0].clientX),
    [handleMove]
  );

  const mouseEnterHandler = () => {
    setIsMouseOver(true);
    stopAutoplay();
  };

  const mouseLeaveHandler = () => {
    setIsMouseOver(false);
    startAutoplay();
  };

  // Keyboard handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [onClose]);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0,0,0,0.75)",
        backdropFilter: "blur(8px)",
        zIndex: 10001,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        animation: "fadeIn 0.2s ease-in-out",
      }}
      onClick={onClose}
    >
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: scale(0.95);
          }
          to { 
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>

      <div
        style={{
          width: "90%",
          maxWidth: "1000px",
          background: "white",
          borderRadius: "20px",
          overflow: "hidden",
          boxShadow: "0 25px 80px rgba(0,0,0,0.4)",
          position: "relative",
          fontFamily: "system-ui",
          animation: "slideUp 0.2s ease-out",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div
          style={{
            padding: "24px",
            borderBottom: "1px solid #e5e7eb",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <h3
            style={{
              margin: 0,
              fontSize: "1.5rem",
              fontWeight: 700,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            So sánh qua các thời kỳ
          </h3>

          <button
            onClick={onClose}
            style={{
              width: "40px",
              height: "40px",
              background: "#f3f4f6",
              border: "none",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all 0.2s",
              fontSize: "1.5rem",
              color: "#6b7280",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#e5e7eb";
              e.currentTarget.style.transform = "rotate(90deg)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#f3f4f6";
              e.currentTarget.style.transform = "rotate(0deg)";
            }}
          >
            ×
          </button>
        </div>

        {/* COMPARISON CONTAINER */}
        <div style={{ padding: "24px" }}>
          <div
            ref={sliderRef}
            style={{
              position: "relative",
              width: "100%",
              height: "550px",
              borderRadius: "16px",
              overflow: "hidden",
              cursor: isDragging ? "grabbing" : "grab",
              userSelect: "none",
              WebkitUserSelect: "none",
              touchAction: "none",
            }}
            onMouseMove={handleMouseMove}
            onMouseLeave={mouseLeaveHandler}
            onMouseEnter={mouseEnterHandler}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onTouchMove={handleTouchMove}
          >
            {/* CURRENT IMAGE (Background) */}
            <img
              src={currentImageUrl}
              alt="Hình hiện tại"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                zIndex: 1,
                userSelect: "none",
              }}
              draggable={false}
            />

            {/* OLD IMAGE (Clipped) */}
            <div
              style={{
                overflow: "hidden",
                width: "100%",
                height: "100%",
                position: "relative",
                zIndex: 2,
                pointerEvents: "none",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  zIndex: 2,
                  borderRadius: "16px",
                  flexShrink: 0,
                  width: "100%",
                  height: "100%",
                  overflow: "hidden",
                  clipPath: `inset(0 ${100 - sliderXPercent}% 0 0)`,
                }}
              >
                <img
                  src={oldImageUrl}
                  alt="Hình xưa"
                  style={{
                    position: "absolute",
                    inset: 0,
                    zIndex: 2,
                    borderRadius: "16px",
                    flexShrink: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    userSelect: "none",
                  }}
                  draggable={false}
                />
              </div>
            </div>

            {/* SLIDER LINE WITH GRADIENT EFFECTS */}
            <div
              style={{
                height: "100%",
                width: "2px",
                position: "absolute",
                top: 0,
                left: `${sliderXPercent}%`,
                margin: "auto",
                zIndex: 40,
                background:
                  "linear-gradient(to bottom, transparent 0%, transparent 5%, #667eea 5%, #764ba2 95%, transparent 95%, transparent 100%)",
                transition: "left 0s",
              }}
            >
              {/* Left gradient glow */}
              <div
                style={{
                  width: "144px",
                  height: "100%",
                  maskImage:
                    "radial-gradient(100px at left, white, transparent)",
                  WebkitMaskImage:
                    "radial-gradient(100px at left, white, transparent)",
                  position: "absolute",
                  top: "50%",
                  transform: "translateY(-50%)",
                  left: 0,
                  background:
                    "linear-gradient(to right, rgba(102, 126, 234, 0.5), transparent)",
                  zIndex: 20,
                  opacity: 0.5,
                }}
              />

              {/* Small left glow */}
              <div
                style={{
                  width: "40px",
                  height: "50%",
                  maskImage:
                    "radial-gradient(50px at left, white, transparent)",
                  WebkitMaskImage:
                    "radial-gradient(50px at left, white, transparent)",
                  position: "absolute",
                  top: "50%",
                  transform: "translateY(-50%)",
                  left: 0,
                  background:
                    "linear-gradient(to right, rgba(6, 182, 212, 1), transparent)",
                  zIndex: 10,
                  opacity: 1,
                }}
              />

              {/* Handle button */}
              <div
                style={{
                  height: "48px",
                  width: "48px",
                  borderRadius: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "white",
                  zIndex: 30,
                  right: "-24px",
                  position: "absolute",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow:
                    "0px 2px 12px rgba(0,0,0,0.3), 0px -1px 0px 0px rgba(255,255,255,0.25)",
                  transition: "transform 0.2s",
                }}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  style={{ color: "#1f2937" }}
                >
                  <circle cx="12" cy="12" r="1" fill="currentColor" />
                  <circle cx="12" cy="5" r="1" fill="currentColor" />
                  <circle cx="12" cy="19" r="1" fill="currentColor" />
                </svg>
              </div>
            </div>

            {/* LABELS */}
            <div
              style={{
                position: "absolute",
                bottom: "20px",
                left: "20px",
                background: "rgba(0, 0, 0, 0.75)",
                backdropFilter: "blur(8px)",
                color: "white",
                padding: "10px 16px",
                borderRadius: "10px",
                fontSize: "0.9rem",
                fontWeight: "600",
                pointerEvents: "none",
                zIndex: 50,
              }}
            >
              📷 {oldYearLabel}
            </div>

            <div
              style={{
                position: "absolute",
                bottom: "20px",
                right: "20px",
                background: "rgba(0, 0, 0, 0.75)",
                backdropFilter: "blur(8px)",
                color: "white",
                padding: "10px 16px",
                borderRadius: "10px",
                fontSize: "0.9rem",
                fontWeight: "600",
                pointerEvents: "none",
                zIndex: 50,
              }}
            >
              📸 {newYearLabel}
            </div>
          </div>

          {/* HINT */}
          <p
            style={{
              marginTop: "20px",
              textAlign: "center",
              fontSize: "0.95rem",
              color: "#6b7280",
              marginBottom: 0,
            }}
          >
            💡 Kéo thanh trượt hoặc để tự động chạy để xem sự thay đổi qua thời
            gian
          </p>
        </div>
      </div>
    </div>
  );
};

export default CompareModal;
