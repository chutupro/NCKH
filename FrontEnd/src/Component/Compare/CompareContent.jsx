import React from 'react';

const CompareContent = ({ item }) => {
  return (
    <div className="cd-main-content">
      <section className="cd-section">
        <h3>Mô tả</h3>
        <p>{item.description || 'Chưa có mô tả chi tiết.'}</p>
      </section>

      {item.historicalNote && (
        <section className="cd-section">
          <h3>Lịch sử</h3>
          <p>{item.historicalNote}</p>
        </section>
      )}

      {item.culturalValue && (
        <section className="cd-section">
          <h3>Giá trị văn hóa</h3>
          <p>{item.culturalValue}</p>
        </section>
      )}
    </div>
  );
};

export default CompareContent;
