import React, { useEffect, useState, useCallback } from 'react';

const BASE_URL = 'http://localhost:3000';

const PhotoModeration = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actioning, setActioning] = useState(null);

  const loadPending = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${BASE_URL}/location-images/pending`);
      if (!res.ok) throw new Error(`GET /location-images/pending ${res.status}`);
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Không thể tải danh sách ảnh chờ duyệt.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPending();
  }, [loadPending]);

  const handleAction = async (id, status) => {
    setActioning(id);
    try {
      const res = await fetch(`${BASE_URL}/location-images/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error(`PATCH status ${res.status}`);
      setItems((prev) => prev.filter((item) => item.SubmissionID !== id));
    } catch (err) {
      alert(err.message || 'Không thể cập nhật trạng thái ảnh.');
    } finally {
      setActioning(null);
    }
  };

  const renderCard = (item) => {
    const imageSrc = item.ImagePath?.startsWith('http')
      ? item.ImagePath
      : `${BASE_URL}${item.ImagePath || ''}`;
    const locationName = item.location?.Name || item.location?.Name?.Value || 'Không rõ địa điểm';
    const locationAddress = item.location?.Address || '';
    const userName = item.user?.FullName || 'Ẩn danh';
    const submittedAt = item.CreatedAt
      ? new Date(item.CreatedAt).toLocaleString('vi-VN')
      : '';

    return (
      <div key={item.SubmissionID} className="admin-card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
          <div style={{ width: '260px', height: '180px', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 8px 20px rgba(15,23,42,0.15)' }}>
            <img
              src={imageSrc}
              alt="Ảnh cộng đồng"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              loading="lazy"
            />
          </div>
          <div style={{ flex: 1, minWidth: '240px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '1rem', flexWrap: 'wrap' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem' }}>{locationName}</h3>
                {locationAddress && <p style={{ margin: '4px 0', color: '#6b7280' }}>{locationAddress}</p>}
              </div>
              <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{submittedAt}</span>
            </div>
            <div style={{ marginTop: '0.75rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '0.5rem' }}>
              <div style={{ fontSize: '0.9rem' }}>
                <strong>Người gửi:</strong> {userName}
              </div>
              <div style={{ fontSize: '0.9rem' }}>
                <strong>Năm chụp:</strong> {item.Year || 'Chưa rõ'}
              </div>
              <div style={{ fontSize: '0.9rem' }}>
                <strong>Trạng thái:</strong>{' '}
                <span style={{ color: '#d97706', fontWeight: 600, textTransform: 'uppercase' }}>
                  {item.Status}
                </span>
              </div>
            </div>
            {item.Description && (
              <p style={{ marginTop: '0.75rem', color: '#475569' }}>{item.Description}</p>
            )}
            <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button
                className="btn btn-primary"
                style={{ minWidth: '140px', background: '#16a34a', borderColor: '#16a34a' }}
                onClick={() => handleAction(item.SubmissionID, 'approved')}
                disabled={actioning === item.SubmissionID}
              >
                ✅ Duyệt
              </button>
              <button
                className="btn btn-secondary"
                style={{ minWidth: '140px', background: '#f97316', borderColor: '#f97316', color: '#fff' }}
                onClick={() => handleAction(item.SubmissionID, 'rejected')}
                disabled={actioning === item.SubmissionID}
              >
                ✖ Từ chối
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="admin-content">
      <div className="admin-header">
        <div>
          <h1>Ảnh cộng đồng chờ duyệt</h1>
          <p>Kiểm tra và xác nhận các ảnh do người dùng gửi cho bản đồ.</p>
        </div>
        <button className="btn btn-secondary" onClick={loadPending} disabled={loading}>
          🔄 Làm mới
        </button>
      </div>

      {loading && <div className="admin-card">Đang tải...</div>}
      {error && <div className="admin-card" style={{ color: '#dc2626' }}>{error}</div>}

      {!loading && !error && items.length === 0 && (
        <div className="admin-card" style={{ textAlign: 'center', color: '#6b7280' }}>
          Hiện chưa có ảnh nào chờ duyệt.
        </div>
      )}

      {!loading && !error && items.map(renderCard)}
    </div>
  );
};

export default PhotoModeration;

