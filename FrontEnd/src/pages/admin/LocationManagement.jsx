import React, { useState, useEffect } from 'react';
import MapAdminNew from '../map/MapAdminNew';
import PhotoModeration from './PhotoModeration';
import MapMarkerManagement from './MapMarkerManagement';
import '../../Styles/Admin/AdminDashboard.css';

const LocationManagement = () => {
  // Lưu activeTab vào localStorage để không bị reset khi component re-render
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('locationManagementActiveTab') || 'map';
  });

  // Lưu activeTab vào localStorage mỗi khi thay đổi
  useEffect(() => {
    localStorage.setItem('locationManagementActiveTab', activeTab);
  }, [activeTab]);

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

          <span>Duyệt Ảnh</span>
        </button>

        <button
          onClick={() => setActiveTab('markers')}
          style={{
            padding: '0.75rem 1.5rem',
            fontSize: '1rem',
            fontWeight: 600,
            background: activeTab === 'markers' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'transparent',
            color: activeTab === 'markers' ? 'white' : '#6b7280',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >

          <span>Danh sách Marker</span>
        </button>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'map' && <MapAdminNew />}
        {activeTab === 'photos' && <PhotoModeration />}
        {activeTab === 'markers' && <MapMarkerManagement />}
      </div>
    </div>
  );
};

export default LocationManagement;
