// src/Component/Contribute/UserInputFields.jsx
import React from 'react';

export default function UserInputFields({ formData, setFormData }) {
  return (
    <div className="user-input-fields">
      <div className="space-y-2">
        <label htmlFor="author" style={{ color: '#E8DCC4' }}>Họ và tên *</label>
        <input id="author" placeholder="Nhập họ và tên của bạn" value={formData.author} onChange={(e) => setFormData({ ...formData, author: e.target.value })} required className="bg-black/30 border-[#D4C5A9]/30 focus:border-[#C4B998]" style={{ color: '#D4C5A9' }} />
      </div>
      <div className="space-y-2">
        <label htmlFor="description" style={{ color: '#E8DCC4' }}>Mô tả chi tiết *</label>
        <textarea id="description" placeholder="Chia sẻ những gì bạn biết về di sản này: lịch sử, ý nghĩa, đặc điểm, giá trị văn hóa..." rows={8} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required className="bg-black/30 border-[#D4C5A9]/30 focus:border-[#C4B998]" style={{ color: '#D4C5A9' }} />
        <p className="text-xs opacity-70" style={{ color: '#D4C5A9' }}>Tối thiểu 100 ký tự</p>
      </div>
    </div>
  );
}