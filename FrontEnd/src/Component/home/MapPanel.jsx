import React from 'react';

const MapPanel = ({ location, mapEmbedUrl, onClose }) => {
  console.log('✅ MapPanel rendered:', { location: location?.name, mapEmbedUrl });
  
  if (!mapEmbedUrl) {
    console.log('❌ MapPanel: No mapEmbedUrl provided');
    return null;
  }

  return (
    <div 
      className="map-panel" 
      role="dialog" 
      aria-label={`Map for ${location?.name || 'location'}`}
      style={{
        position: 'absolute',
        inset: 0,
        background: 'rgba(255,255,255,0.98)',
        zIndex: 20,
        display: 'flex',
        flexDirection: 'column',
        padding: '12px',
        borderRadius: '18px'
      }}
    >
      <button
        className="map-close"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log('🔴 Close button clicked');
          onClose && onClose();
        }}
        aria-label="Close map"
        style={{
          position: 'absolute',
          top: '10px',
          right: '12px',
          background: 'rgba(0,0,0,0.6)',
          color: '#fff',
          border: 'none',
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          fontSize: '20px',
          cursor: 'pointer',
          zIndex: 25
        }}
      >
        ×
      </button>
      <iframe
        title={`${location?.name || 'Location'} Map`}
        src={mapEmbedUrl}
        style={{ 
          border: 0, 
          width: '100%',
          height: '100%',
          minHeight: '500px',
          borderRadius: '10px',
          flex: 1
        }}
        loading="eager"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
        allow="geolocation"
      />
    </div>
  );
};

export default MapPanel;
