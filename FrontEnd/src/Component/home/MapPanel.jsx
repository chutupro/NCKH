import React from 'react';

const MapPanel = ({ location, mapEmbedUrl, onClose }) => {
  if (!mapEmbedUrl) return null;

  return (
    <div className="map-panel" role="dialog" aria-label={`Map for ${location?.name || 'location'}`}>
      <button
        className="map-close"
        onClick={() => onClose && onClose()}
        aria-label="Close map"
      >
        ×
      </button>
      <iframe
        title={`${location?.name || 'Location'} Map`}
        src={mapEmbedUrl}
        width="100%"
        height="300"
        style={{ border: 0 }}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
};

export default MapPanel;
