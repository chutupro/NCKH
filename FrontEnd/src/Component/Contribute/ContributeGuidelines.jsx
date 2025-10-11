// src/Component/Contribute/ContributeGuidelines.jsx
import React from 'react';

export default function ContributeGuidelines() {
  return (
    <div className="guidelines" style={{ backgroundColor: 'rgba(212, 197, 169, 0.1)', border: '1px solid rgba(212, 197, 169, 0.2)' }}>
      <h4 style={{ color: '#E8DCC4' }}>Lưu ý:</h4>
      <ul className="text-sm space-y-1 opacity-85" style={{ color: '#D4C5A9' }}>
        <li>• Thông tin phải chính xác và có nguồn gốc rõ ràng</li>
        <li>• Không sử dụng ngôn từ xúc phạm hoặc không phù hợp</li>
        <li>• Đóng góp sẽ được kiểm duyệt trước khi hiển thị công khai</li>
      </ul>
    </div>
  );
}