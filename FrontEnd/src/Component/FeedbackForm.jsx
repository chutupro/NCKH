// src/components/FeedbackForm.jsx
import React, { useState } from "react";
import axios from "axios";

import React, { useState } from 'react';
import { toast } from 'react-toastify';

const FeedbackForm = ({ locationId, onClose }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0 || !comment.trim()) return;

    setLoading(true);
    try {
      await axios.post(`http://localhost:3000/map-locations/${locationId}/feedback`, {
        userId: 1,
        rating,
        comment,
      });
      onSuccess?.();
      setComment("");
      setRating(0);
      toast.success("Gửi đánh giá thành công!", { position: "top-right", autoClose: 2000 });
    } catch (err) {
      toast.error("Lỗi: " + (err.response?.data?.message || err.message), { position: "top-right" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: "#f9f9f9", padding: 16, borderRadius: 12, fontSize: "0.9rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <div style={{
          width: 36, height: 36, borderRadius: "50%", background: "#ddd",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontWeight: "bold", color: "#555"
        }}>U</div>
        <div>
          <div style={{ fontWeight: 600, fontSize: "0.95rem" }}>Bạn</div>
          <div style={{ fontSize: "0.75rem", color: "#888" }}>Vừa xong</div>
        </div>
      </div>

      <div style={{ marginBottom: 12 }}>
        {[1, 2, 3, 4, 5].map((s) => (
          <span
            key={s}
            onClick={() => setRating(s)}
            style={{
              cursor: "pointer",
              fontSize: "1.3rem",
              color: s <= rating ? "#f39c12" : "#ccc",
              marginRight: 4
            }}
          >
            Star
          </span>
        ))}
      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Chia sẻ cảm nhận..."
        style={{
          width: "100%",
          height: 60,
          padding: 10,
          border: "1px solid #ddd",
          borderRadius: 8,
          fontSize: "0.85rem",
          resize: "none"
        }}
        required
      />

      <button
        onClick={handleSubmit}
        disabled={loading || rating === 0}
        style={{
          marginTop: 12,
          padding: "8px 16px",
          background: rating === 0 ? "#ccc" : "#1a73e8",
          color: "white",
          border: "none",
          borderRadius: 8,
          fontSize: "0.85rem",
          cursor: rating === 0 ? "not-allowed" : "pointer",
          width: "100%"
        }}
      >
        {loading ? "Đang gửi..." : "Gửi đánh giá"}
      </button>
    </div>
  );
};

export default FeedbackForm;