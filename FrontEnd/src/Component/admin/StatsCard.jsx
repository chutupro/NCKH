import React from 'react';
import '../../Styles/Admin/AdminDashboard.css';

const StatsCard = ({ icon, title, value, trend, trendValue, footer, color = 'primary' }) => {
  return (
    <div className="stats-card">
      <div className="stats-card-header">
        <div className={`stats-card-icon ${color}`}>
          {icon}
        </div>
        {trend && (
          <div className={`stats-card-trend ${trend}`}>
            {trend === 'up' ? '↑' : '↓'} {trendValue}
          </div>
        )}
      </div>

      <div className="stats-card-body">
        <div className="stats-card-title">{title}</div>
        <div className="stats-card-value">{value}</div>
      </div>

      {footer && (
        <div className="stats-card-footer">
          {footer}
        </div>
      )}
    </div>
  );
};

export default StatsCard;
