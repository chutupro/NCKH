import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAppContext } from '../../context/useAppContext';

const API_URL = 'http://localhost:3000';

const PendingPosts = () => {
  const { user } = useAppContext();
  const [pendingPosts, setPendingPosts] = useState([]);
  const [approvedPosts, setApprovedPosts] = useState([]);
  const [rejectedPosts, setRejectedPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchAllPosts = async () => {
    try {
      const currentUserId = user?.userId || user?.UserID || user?.sub;
      
      // Fetch pending posts
      const pendingResponse = await axios.get(`${API_URL}/articles_post/pending/list`);
      const userPendingPosts = pendingResponse.data.filter(
        article => parseInt(article.author?.id) === parseInt(currentUserId)
      );
      setPendingPosts(userPendingPosts);

      // Fetch approved posts
      const approvedResponse = await axios.get(`${API_URL}/articles_post`);
      const userApprovedPosts = approvedResponse.data.filter(
        article => parseInt(article.author?.id) === parseInt(currentUserId)
      );
      setApprovedPosts(userApprovedPosts);

      // Fetch rejected posts
      const rejectedResponse = await axios.get(`${API_URL}/articles_post/rejected/list`);
      const userRejectedPosts = rejectedResponse.data.filter(
        article => parseInt(article.author?.id) === parseInt(currentUserId)
      );
      setRejectedPosts(userRejectedPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (pendingPosts.length === 0 && approvedPosts.length === 0 && rejectedPosts.length === 0) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '60px 20px',
        background: 'rgba(255, 255, 255, 0.02)',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.04)'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📝</div>
        <h3 style={{ color: '#f5e6d3', marginBottom: '8px' }}>Chưa có bài đóng góp nào</h3>
        <p style={{ color: 'rgba(245, 230, 211, 0.6)' }}>
          Bạn chưa có bài viết đóng góp nào
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Pending Posts */}
      {pendingPosts.length > 0 && (
        <div>
          <h3 style={{ 
            color: '#f59e0b', 
            marginBottom: '16px',
            fontSize: '18px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            ⏳ Chờ duyệt ({pendingPosts.length})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {pendingPosts.map(post => (
              <div 
                key={post.id}
                style={{
                  background: 'rgba(245, 158, 11, 0.1)',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  borderRadius: '8px',
                  padding: '16px',
                  transition: 'all 0.3s ease'
                }}
              >
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '12px'
                }}>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ 
                      color: '#f5e6d3',
                      margin: '0 0 8px 0',
                      fontSize: '16px',
                      fontWeight: '600'
                    }}>
                      {post.title}
                    </h4>
                    <div style={{ 
                      display: 'flex', 
                      gap: '12px',
                      fontSize: '13px',
                      color: 'rgba(245, 230, 211, 0.6)'
                    }}>
                      <span>📂 {post.category}</span>
                      <span>📅 {formatDate(post.createdAt)}</span>
                    </div>
                  </div>
                  <span style={{
                    background: '#f59e0b',
                    color: '#1a1a1a',
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>
                    Chờ duyệt
                  </span>
                </div>
                <p style={{ 
                  color: 'rgba(245, 230, 211, 0.8)',
                  margin: 0,
                  fontSize: '14px',
                  lineHeight: '1.6'
                }}>
                  {post.content?.substring(0, 150)}
                  {post.content?.length > 150 ? '...' : ''}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Approved Posts */}
      {approvedPosts.length > 0 && (
        <div>
          <h3 style={{ 
            color: '#10b981', 
            marginBottom: '16px',
            fontSize: '18px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            ✅ Đã duyệt ({approvedPosts.length})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {approvedPosts.map(post => (
              <div 
                key={post.id}
                style={{
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  borderRadius: '8px',
                  padding: '16px',
                  transition: 'all 0.3s ease'
                }}
              >
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '12px'
                }}>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ 
                      color: '#f5e6d3',
                      margin: '0 0 8px 0',
                      fontSize: '16px',
                      fontWeight: '600'
                    }}>
                      {post.title}
                    </h4>
                    <div style={{ 
                      display: 'flex', 
                      gap: '12px',
                      fontSize: '13px',
                      color: 'rgba(245, 230, 211, 0.6)'
                    }}>
                      <span>📂 {post.category}</span>
                      <span>📅 {formatDate(post.createdAt)}</span>
                    </div>
                  </div>
                  <span style={{
                    background: '#10b981',
                    color: '#ffffff',
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>
                    Đã duyệt
                  </span>
                </div>
                <p style={{ 
                  color: 'rgba(245, 230, 211, 0.8)',
                  margin: 0,
                  fontSize: '14px',
                  lineHeight: '1.6'
                }}>
                  {post.content?.substring(0, 150)}
                  {post.content?.length > 150 ? '...' : ''}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rejected Posts */}
      {rejectedPosts.length > 0 && (
        <div>
          <h3 style={{ 
            color: '#ef4444', 
            marginBottom: '16px',
            fontSize: '18px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            ❌ Đã từ chối ({rejectedPosts.length})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {rejectedPosts.map(post => (
              <div 
                key={post.id}
                style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '8px',
                  padding: '16px',
                  transition: 'all 0.3s ease'
                }}
              >
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '12px'
                }}>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ 
                      color: '#f5e6d3',
                      margin: '0 0 8px 0',
                      fontSize: '16px',
                      fontWeight: '600'
                    }}>
                      {post.title}
                    </h4>
                    <div style={{ 
                      display: 'flex', 
                      gap: '12px',
                      fontSize: '13px',
                      color: 'rgba(245, 230, 211, 0.6)'
                    }}>
                      <span>📂 {post.category}</span>
                      <span>📅 {formatDate(post.createdAt)}</span>
                    </div>
                  </div>
                  <span style={{
                    background: '#ef4444',
                    color: '#ffffff',
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>
                    Đã từ chối
                  </span>
                </div>
                <p style={{ 
                  color: 'rgba(245, 230, 211, 0.8)',
                  margin: 0,
                  fontSize: '14px',
                  lineHeight: '1.6'
                }}>
                  {post.content?.substring(0, 150)}
                  {post.content?.length > 150 ? '...' : ''}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingPosts;
