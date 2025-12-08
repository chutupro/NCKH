import React, { useState } from "react";
import "./ShareModal.css";

const ShareModal = ({ isOpen, onClose, location, mapPosition }) => {
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  // Tạo shareable link với thông tin location và map position
  const createShareLink = () => {
    const baseUrl = window.location.origin;
    const params = new URLSearchParams({
      locationId: location?.id || "",
      locationName: location?.title || "",
      lat: mapPosition?.lat || location?.position?.[0] || "",
      lng: mapPosition?.lng || location?.position?.[1] || "",
      zoom: mapPosition?.zoom || 15,
    });
    return `${baseUrl}/map?${params.toString()}`;
  };

  const shareLink = createShareLink();

  // Copy link to clipboard
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
      // Fallback method
      const textArea = document.createElement("textarea");
      textArea.value = shareLink;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="share-modal-overlay" onClick={onClose}>
      <div className="share-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="share-modal-close" onClick={onClose}>
          ✕
        </button>

        <h2 className="share-modal-title">📍 Chia sẻ địa điểm</h2>

        <p className="share-modal-subtitle">
          {location?.title || "Địa điểm này"}
        </p>

        {/* Link Section */}
        <div className="share-link-section">
          <label>🔗 Đường dẫn chia sẻ:</label>
          <div className="share-link-container">
            <input
              type="text"
              value={shareLink}
              readOnly
              className="share-link-input"
              onClick={(e) => e.target.select()}
            />
            <button
              className={`share-copy-btn ${copiedLink ? "copied" : ""}`}
              onClick={handleCopyLink}
            >
              {copiedLink ? "✓ Đã sao chép" : "📋 Sao chép"}
            </button>
          </div>
          <p className="share-link-note">
            💡 Người nhận link có thể xem địa điểm và chỉ đường mà không cần
            đăng nhập
          </p>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
