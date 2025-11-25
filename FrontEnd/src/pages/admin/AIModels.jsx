import React from 'react';
import '../../Styles/Admin/AdminDashboard.css';

const AIModels = () => {
  const models = [
    {
      id: 1,
      name: 'Image Recognition Model',
      version: 'v2.1.0',
      status: 'running',
      accuracy: '94.5%',
      lastTrained: '2025-11-01',
      description: 'Nhận diện địa danh trong ảnh lịch sử',
    },
    {
      id: 2,
      name: 'Content Classification',
      version: 'v1.8.3',
      status: 'stopped',
      accuracy: '89.2%',
      lastTrained: '2025-10-15',
      description: 'Phân loại nội dung tự động',
    },
    {
      id: 3,
      name: 'Sentiment Analysis',
      version: 'v1.5.0',
      status: 'training',
      accuracy: '87.1%',
      lastTrained: '2025-11-05',
      description: 'Phân tích cảm xúc bình luận',
    },
  ];

  return (
    <div>
      {}
      <div style={{
        background: 'linear-gradient(135deg, #f59e0b, #d97706)',
        color: 'white',
        padding: '1.5rem',
        borderRadius: '12px',
        marginBottom: '2rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
      }}>
        <span style={{ fontSize: '2rem' }}>🚧</span>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>
            Tính năng đang phát triển
          </h3>
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem' }}>
            Quản lý AI Models hiện đang trong giai đoạn phát triển. UI bên dưới chỉ là placeholder.
          </p>
        </div>
      </div>

      {}
      <div className="stats-grid" style={{ marginBottom: '2rem' }}>
        <div className="stats-card">
          <div className="stats-card-header">
            <div className="stats-card-icon primary">🤖</div>
          </div>
          <div className="stats-card-title">Tổng models</div>
          <div className="stats-card-value">{models.length}</div>
        </div>

        <div className="stats-card">
          <div className="stats-card-header">
            <div className="stats-card-icon success">▶️</div>
          </div>
          <div className="stats-card-title">Đang chạy</div>
          <div className="stats-card-value">
            {models.filter(m => m.status === 'running').length}
          </div>
        </div>

        <div className="stats-card">
          <div className="stats-card-header">
            <div className="stats-card-icon warning">⏸️</div>
          </div>
          <div className="stats-card-title">Đã dừng</div>
          <div className="stats-card-value">
            {models.filter(m => m.status === 'stopped').length}
          </div>
        </div>

        <div className="stats-card">
          <div className="stats-card-header">
            <div className="stats-card-icon danger">📊</div>
          </div>
          <div className="stats-card-title">Độ chính xác TB</div>
          <div className="stats-card-value">90.3%</div>
        </div>
      </div>

      {}
      <div className="data-table-container">
        <div className="table-header">
          <h2 className="table-title">Danh sách AI Models</h2>
          <button className="btn btn-primary">
            ➕ Thêm model mới
          </button>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>Model</th>
              <th>Version</th>
              <th>Trạng thái</th>
              <th>Độ chính xác</th>
              <th>Train lần cuối</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {models.map((model) => (
              <tr key={model.id}>
                <td>
                  <strong style={{ color: '#1f2937' }}>{model.name}</strong>
                  <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.25rem' }}>
                    {model.description}
                  </div>
                </td>
                <td>
                  <code style={{ 
                    background: '#f3f4f6', 
                    padding: '0.25rem 0.5rem', 
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                  }}>
                    {model.version}
                  </code>
                </td>
                <td>
                  <span className={`status-badge ${model.status === 'running' ? 'active' : model.status === 'training' ? 'pending' : 'inactive'}`}>
                    {model.status === 'running' && '▶️ Running'}
                    {model.status === 'stopped' && '⏸️ Stopped'}
                    {model.status === 'training' && '🔄 Training'}
                  </span>
                </td>
                <td>
                  <strong style={{ color: '#10b981' }}>{model.accuracy}</strong>
                </td>
                <td>{model.lastTrained}</td>
                <td>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {model.status === 'stopped' ? (
                      <button className="btn btn-sm btn-success">
                        ▶️ Start
                      </button>
                    ) : (
                      <button className="btn btn-sm btn-danger">
                        ⏸️ Stop
                      </button>
                    )}
                    <button className="btn btn-sm btn-secondary">
                      📊 Metrics
                    </button>
                    <button className="btn btn-sm btn-secondary">
                      ⚙️ Config
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {}
      <div className="data-table-container" style={{ marginTop: '2rem' }}>
        <div className="table-header">
          <h2 className="table-title">Thao tác nhanh</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <button className="btn btn-primary" style={{ padding: '1rem', justifyContent: 'center' }} disabled>
            🎓 Train model mới
          </button>
          <button className="btn btn-secondary" style={{ padding: '1rem', justifyContent: 'center' }} disabled>
            📦 Deploy model
          </button>
          <button className="btn btn-secondary" style={{ padding: '1rem', justifyContent: 'center' }} disabled>
            📊 Xem logs
          </button>
          <button className="btn btn-secondary" style={{ padding: '1rem', justifyContent: 'center' }} disabled>
            📥 Import model
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIModels;
