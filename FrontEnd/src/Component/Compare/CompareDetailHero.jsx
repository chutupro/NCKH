import React from 'react';

const CompareDetailHero = ({ item }) => {
  return (
    <div className="cd-hero">
      <div className="cd-hero-content">
        <span className="cd-category-badge">{item.category}</span>
        <h1 className="cd-title">{item.title}</h1>
        {/* metadata intentionally removed (date, views, location) */}
      </div>
    </div>
  );
};

export default CompareDetailHero;
