import React, { useEffect, useState } from 'react';
import '../../Styles/Admin/AdminDashboard.css';

const SystemMonitor = () => {
  const [systemStats, setSystemStats] = useState({
    cpu: 45,
    ram: 62,
    disk: 38,
    network: 125, // Mbps
  });

  const [logs, setLogs] = useState([
    { id: 1, level: 'info', message: 'Server started successfully', time: '2025-11-06 17:30:15' },
    { id: 2, level: 'warning', message: 'High memory usage detected (75%)', time: '2025-11-06 17:25:30' },
    { id: 3, level: 'error', message: 'Database connection timeout', time: '2025-11-06 17:20:45' },
    { id: 4, level: 'info', message: 'Backup completed successfully', time: '2025-11-06 17:15:00' },
    { id: 5, level: 'warning', message: 'Disk space low (20% remaining)', time: '2025-11-06 17:10:30' },
  ]);

  const [services, setServices] = useState([
    { name: 'Web Server', status: 'running', uptime: '15 days 3h', port: 3000 },
    { name: 'Database', status: 'running', uptime: '15 days 3h', port: 5432 },
    { name: 'Redis Cache', status: 'running', uptime: '10 days 5h', port: 6379 },
    { name: 'Media Service', status: 'running', uptime: '2 days 1h', port: 3001 },
    { name: 'AI Service', status: 'stopped', uptime: '0h', port: 5000 },
  ]);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setSystemStats({
        cpu: Math.floor(Math.random() * 100),
        ram: Math.floor(Math.random() * 100),
        disk: 38 + Math.floor(Math.random() * 5),
        network: 100 + Math.floor(Math.random() * 50),
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleRestartDocker = () => {
    if (!window.confirm('Bạn có chắc muốn restart Docker containers?')) return;
    alert('🔄 Docker đang restart... (Fake action)');
  };

  const getStatusColor = (level) => {
    switch (level) {
      case 'error': return '#ef4444';
      case 'warning': return '#f59e0b';
      case 'info': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  return (
    <div>
      {/* System Stats */}
      <div className="stats-grid" style={{ marginBottom: '2rem' }}>
        <div className="stats-card">
          <div className="stats-card-header">
            <div className="stats-card-icon primary">💻</div>
            <div className={`stats-card-trend ${systemStats.cpu < 70 ? 'up' : 'down'}`}>
              {systemStats.cpu}%
            </div>
          </div>
          <div className="stats-card-title">CPU Usage</div>
          <div style={{ marginTop: '1rem' }}>
            <div style={{ 
              height: '8px', 
              background: '#e5e7eb', 
              borderRadius: '4px',
              overflow: 'hidden',
            }}>
              <div style={{
                width: `${systemStats.cpu}%`,
                height: '100%',
                background: systemStats.cpu > 80 ? '#ef4444' : '#3b82f6',
                transition: 'width 0.5s',
              }} />
            </div>
          </div>
        </div>

        <div className="stats-card">
          <div className="stats-card-header">
            <div className="stats-card-icon success">🧠</div>
            <div className={`stats-card-trend ${systemStats.ram < 70 ? 'up' : 'down'}`}>
              {systemStats.ram}%
            </div>
          </div>
          <div className="stats-card-title">RAM Usage</div>
          <div style={{ marginTop: '1rem' }}>
            <div style={{ 
              height: '8px', 
              background: '#e5e7eb', 
              borderRadius: '4px',
              overflow: 'hidden',
            }}>
              <div style={{
                width: `${systemStats.ram}%`,
                height: '100%',
                background: systemStats.ram > 80 ? '#ef4444' : '#10b981',
                transition: 'width 0.5s',
              }} />
            </div>
          </div>
        </div>

        <div className="stats-card">
          <div className="stats-card-header">
            <div className="stats-card-icon warning">💾</div>
            <div className="stats-card-trend up">{systemStats.disk}%</div>
          </div>
          <div className="stats-card-title">Disk Usage</div>
          <div style={{ marginTop: '1rem' }}>
            <div style={{ 
              height: '8px', 
              background: '#e5e7eb', 
              borderRadius: '4px',
              overflow: 'hidden',
            }}>
              <div style={{
                width: `${systemStats.disk}%`,
                height: '100%',
                background: '#f59e0b',
              }} />
            </div>
          </div>
        </div>

        <div className="stats-card">
          <div className="stats-card-header">
            <div className="stats-card-icon danger">📡</div>
          </div>
          <div className="stats-card-title">Network Traffic</div>
          <div className="stats-card-value">{systemStats.network} Mbps</div>
        </div>
      </div>

      {/* Services Status */}
      <div className="data-table-container" style={{ marginBottom: '2rem' }}>
        <div className="table-header">
          <h2 className="table-title">Services Status</h2>
          <button className="btn btn-danger" onClick={handleRestartDocker}>
            🔄 Restart Docker
          </button>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>Service</th>
              <th>Status</th>
              <th>Uptime</th>
              <th>Port</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {services.map((service, idx) => (
              <tr key={idx}>
                <td><strong>{service.name}</strong></td>
                <td>
                  <span className={`status-badge ${service.status === 'running' ? 'active' : 'inactive'}`}>
                    {service.status === 'running' ? '✅ Running' : '🔴 Stopped'}
                  </span>
                </td>
                <td>{service.uptime}</td>
                <td>:{service.port}</td>
                <td>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {service.status === 'running' ? (
                      <>
                        <button className="btn btn-sm btn-warning">⏸️ Stop</button>
                        <button className="btn btn-sm btn-secondary">🔄 Restart</button>
                      </>
                    ) : (
                      <button className="btn btn-sm btn-success">▶️ Start</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* System Logs */}
      <div className="data-table-container">
        <div className="table-header">
          <h2 className="table-title">System Logs</h2>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <select style={{
              padding: '0.5rem 1rem',
              border: '1px solid var(--admin-border)',
              borderRadius: '8px',
              fontSize: '0.875rem',
            }}>
              <option>All Levels</option>
              <option>Errors Only</option>
              <option>Warnings Only</option>
              <option>Info Only</option>
            </select>
            <button className="btn btn-secondary btn-sm">🔄 Refresh</button>
            <button className="btn btn-primary btn-sm">📥 Download</button>
          </div>
        </div>

        <div style={{ 
          background: '#1f2937', 
          color: '#e5e7eb',
          padding: '1rem',
          borderRadius: '8px',
          fontFamily: 'monospace',
          fontSize: '0.875rem',
          maxHeight: '400px',
          overflowY: 'auto',
        }}>
          {logs.map((log) => (
            <div key={log.id} style={{ 
              padding: '0.5rem 0',
              borderBottom: '1px solid rgba(255,255,255,0.1)',
            }}>
              <span style={{ color: '#9ca3af' }}>[{log.time}]</span>
              {' '}
              <span style={{ 
                color: getStatusColor(log.level),
                fontWeight: 600,
                textTransform: 'uppercase',
              }}>
                {log.level}
              </span>
              {' - '}
              <span>{log.message}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SystemMonitor;
