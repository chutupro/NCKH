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

  // Share via Facebook Messenger
  const shareViaMessenger = () => {
    const shareData = {
      title: location?.title || "Địa điểm",
      text: `📍 ${location?.title || "Địa điểm"} - Xem trên bản đồ`,
      url: shareLink,
    };

    // Kiểm tra xem trình duyệt có hỗ trợ Web Share API không
    if (navigator.share) {
      navigator
        .share(shareData)
        .then(() => console.log("Đã chia sẻ thành công"))
        .catch((err) => {
          // Nếu hủy hoặc lỗi, fallback sang cách khác
          fallbackMessengerShare();
        });
    } else {
      // Không hỗ trợ Web Share API, dùng cách thông thường
      fallbackMessengerShare();
    }
  };

  // Fallback: Copy link và mở Messenger
  const fallbackMessengerShare = () => {
    handleCopyLink();

    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    if (isMobile) {
      // Mobile: Mở Messenger app
      setTimeout(() => {
        window.location.href = "fb-messenger://";
      }, 500);

      setTimeout(() => {
        alert(
          "💬 Link đã được sao chép!\n\n" +
            "Messenger sẽ mở (nếu đã cài đặt).\n" +
            "Hãy chọn bạn bè và dán link để gửi."
        );
      }, 1000);
    } else {
      // Desktop: Mở Messenger web
      window.open("https://www.messenger.com/", "_blank");
      setTimeout(() => {
        alert(
          "💬 Link đã được sao chép!\n\n" +
            "Messenger Web đã mở.\n" +
            "Hãy chọn cuộc trò chuyện và dán link để gửi."
        );
      }, 500);
    }
  };

  // Share via Zalo
  const shareViaZalo = () => {
    // Copy link trước
    handleCopyLink();

    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    if (isMobile) {
      // Mobile: Thử mở Zalo app
      window.location.href = "zalo://";

      setTimeout(() => {
        alert(
          "💚 Link đã được sao chép!\n\nZalo đã mở (hoặc cần cài đặt).\nHãy:\n1. Chọn bạn bè hoặc nhóm\n2. Dán link để chia sẻ"
        );
      }, 1000);
    } else {
      // Desktop: Mở Zalo web
      window.open("https://chat.zalo.me/", "_blank");
      setTimeout(() => {
        alert(
          "💚 Link đã được sao chép!\n\nZalo Web đã mở.\nHãy chọn cuộc trò chuyện và dán link để gửi."
        );
      }, 300);
    }
  };

  // Share via Instagram
  const shareViaInstagram = () => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    // Copy link trước
    handleCopyLink();

    if (isMobile) {
      // Mobile: Mở Instagram Direct
      window.location.href = "instagram://direct";

      setTimeout(() => {
        alert(
          "📸 Link đã được sao chép!\n\n" +
            "Instagram Direct đã mở.\n" +
            "Hãy chọn bạn bè và dán link để gửi."
        );
      }, 1000);
    } else {
      // Desktop: Mở Instagram Direct web
      window.open("https://www.instagram.com/direct/inbox/", "_blank");
      setTimeout(() => {
        alert(
          "📸 Link đã được sao chép!\n\n" +
            "Instagram Direct đã mở.\n" +
            "Hãy chọn cuộc trò chuyện và dán link để gửi."
        );
      }, 300);
    }
  };

  // Share via Facebook/Messenger - Cả 2 icon đều mở Messenger để gửi cho bạn bè
  const shareViaFacebook = () => {
    shareViaMessenger(); // Dùng cùng logic với Messenger
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

        {/* Social Media Icons */}
        <div className="share-icons-grid">
          <button
            className="share-icon facebook"
            onClick={shareViaFacebook}
            title="Chia sẻ qua Facebook"
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M22,12c0-5.52-4.48-10-10-10S2,6.48,2,12c0,4.84,3.44,8.87,8,9.8V15H8v-3h2V9.5C10,7.57,11.57,6,13.5,6H16v3h-2 c-0.55,0-1,0.45-1,1v2h3v3h-3v6.95C18.05,21.45,22,17.19,22,12z" />
            </svg>
            <span>Facebook</span>
          </button>

          <button
            className="share-icon zalo"
            onClick={shareViaZalo}
            title="Chia sẻ qua Zalo"
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12,2C6.477,2,2,6.477,2,12c0,5.523,4.477,10,10,10s10-4.477,10-10C22,6.477,17.523,2,12,2z M16.898,16.223 c-0.195,0.195-0.512,0.195-0.707,0l-3.191-3.191l-3.191,3.191c-0.195,0.195-0.512,0.195-0.707,0s-0.195-0.512,0-0.707l3.191-3.191 L8.293,9.293c-0.195-0.195-0.195-0.512,0-0.707s0.512-0.195,0.707,0L12,11.586l3.191-3.191c0.195-0.195,0.512-0.195,0.707,0 s0.195,0.512,0,0.707l-3.191,3.191l3.191,3.191C17.094,15.711,17.094,16.027,16.898,16.223z" />
            </svg>
            <span>Zalo</span>
          </button>

          <button
            className="share-icon instagram"
            onClick={shareViaInstagram}
            title="Chia sẻ qua Instagram"
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12,2.162c3.204,0,3.584,0.012,4.849,0.07c1.366,0.062,2.633,0.336,3.608,1.311c0.975,0.975,1.249,2.242,1.311,3.608 c0.058,1.265,0.07,1.645,0.07,4.849s-0.012,3.584-0.07,4.849c-0.062,1.366-0.336,2.633-1.311,3.608 c-0.975,0.975-2.242,1.249-3.608,1.311c-1.265,0.058-1.645,0.07-4.849,0.07s-3.584-0.012-4.849-0.07 c-1.366-0.062-2.633-0.336-3.608-1.311c-0.975-0.975-1.249-2.242-1.311-3.608c-0.058-1.265-0.07-1.645-0.07-4.849 s0.012-3.584,0.07-4.849c0.062-1.366,0.336-2.633,1.311-3.608c0.975-0.975,2.242-1.249,3.608-1.311 C8.416,2.174,8.796,2.162,12,2.162 M12,0C8.741,0,8.332,0.014,7.052,0.072C5.197,0.157,3.355,0.673,2.014,2.014 C0.673,3.355,0.157,5.197,0.072,7.052C0.014,8.332,0,8.741,0,12c0,3.259,0.014,3.668,0.072,4.948 c0.085,1.855,0.601,3.697,1.942,5.038c1.341,1.341,3.183,1.857,5.038,1.942C8.332,23.986,8.741,24,12,24s3.668-0.014,4.948-0.072 c1.855-0.085,3.697-0.601,5.038-1.942c1.341-1.341,1.857-3.183,1.942-5.038C23.986,15.668,24,15.259,24,12 s-0.014-3.668-0.072-4.948c-0.085-1.855-0.601-3.697-1.942-5.038C20.645,0.673,18.803,0.157,16.948,0.072 C15.668,0.014,15.259,0,12,0z M12,5.838c-3.403,0-6.162,2.759-6.162,6.162S8.597,18.162,12,18.162s6.162-2.759,6.162-6.162 S15.403,5.838,12,5.838z M12,16c-2.209,0-4-1.791-4-4s1.791-4,4-4s4,1.791,4,4S14.209,16,12,16z M18.406,4.155 c-0.796,0-1.441,0.645-1.441,1.441s0.645,1.441,1.441,1.441s1.441-0.645,1.441-1.441S19.201,4.155,18.406,4.155z" />
            </svg>
            <span>Instagram</span>
          </button>
        </div>

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

        {/* Instructions */}
        <div className="share-instructions">
          <h4>📱 Cách chia sẻ:</h4>
          <ul>
            <li>
              🔵 <strong>Messenger/Facebook:</strong> Chọn bạn bè và gửi ngay
            </li>
            <li>
              💬 <strong>Zalo:</strong> Chọn người nhận hoặc nhóm để chia sẻ
            </li>
            <li>
              📸 <strong>Instagram:</strong> Sao chép link và dán vào story/bio
            </li>
            <li>
              🔗 <strong>Sao chép link:</strong> Dán vào bất kỳ đâu bạn muốn
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
