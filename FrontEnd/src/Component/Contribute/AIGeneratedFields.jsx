// src/Component/Contribute/AIGeneratedFields.jsx
import React from 'react';

export default function AIGeneratedFields({ aiCategory, setAiCategory, aiTitle, setAiTitle }) {
  return (
    <div className="ai-generated-fields" style={{ backgroundColor: 'rgba(212, 197, 169, 0.1)', border: '1px solid rgba(212, 197, 169, 0.2)' }}>
      <div className="flex items-center gap-2 mb-2">
        <span style={{ color: '#C4B998' }}>✨</span>
        <h4 style={{ color: '#E8DCC4' }}>Kết quả phân tích AI</h4>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="category" style={{ color: '#D4C5A9' }}>Danh mục (AI gợi ý)</label>
          <input id="category" value={aiCategory} onChange={(e) => setAiCategory(e.target.value)} className="w-full" style={{ backgroundColor: 'rgba(0,0,0,0.3)', borderColor: 'rgba(212,197,169,0.3)', color: '#E8DCC4' }} />
        </div>
        <div className="space-y-2">
          <label htmlFor="title" style={{ color: '#D4C5A9' }}>Tiêu đề (AI gợi ý)</label>
          <input id="title" value={aiTitle} onChange={(e) => setAiTitle(e.target.value)} className="w-full" style={{ backgroundColor: 'rgba(0,0,0,0.3)', borderColor: 'rgba(212,197,169,0.3)', color: '#E8DCC4' }} />
        </div>
      </div>
      <p className="text-xs opacity-70" style={{ color: '#D4C5A9' }}>💡 Bạn có thể chỉnh sửa các gợi ý của AI nếu cần</p>
    </div>
  );
}