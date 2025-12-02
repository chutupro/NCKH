import React, { useState } from 'react';
import MapAdmin from '../map/MapAdmin';
import PhotoModeration from './PhotoModeration';
import '../../Styles/Admin/AdminDashboard.css';

const LocationManagement = () => {
  const [activeTab, setActiveTab] = useState('map'); // 'map' hoặc 'photos'

  return (
    <div>
      {/* Tab Navigation */}
      <div style={{
        display: 'flex',
        gap: '1rem',
        marginBottom: '1.5rem',
        borderBottom: '2px solid #e5e7eb',
        paddingBottom: '0.5rem',
      }}>
        <button
          onClick={() => setActiveTab('map')}
          style={{
            padding: '0.75rem 1.5rem',
            fontSize: '1rem',
            fontWeight: 600,
            background: activeTab === 'map' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'transparent',
            color: activeTab === 'map' ? 'white' : '#6b7280',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <span>🗺️</span>
          <span>Quản lý Địa điểm</span>
        </button>

        <button
          onClick={() => setActiveTab('photos')}
          style={{
            padding: '0.75rem 1.5rem',
            fontSize: '1rem',
            fontWeight: 600,
            background: activeTab === 'photos' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'transparent',
            color: activeTab === 'photos' ? 'white' : '#6b7280',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <span>🖼️</span>
          <span>Duyệt Ảnh</span>
        </button>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'map' && <MapAdmin />}
        {activeTab === 'photos' && <PhotoModeration />}
      </div>
    </div>
  );
};

export default LocationManagement;
