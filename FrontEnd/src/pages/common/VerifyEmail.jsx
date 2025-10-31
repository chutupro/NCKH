import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import '../../Styles/login-register/login.css'

const VerifyEmail = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  
  const [status, setStatus] = useState('loading') // 'loading', 'success', 'error'
  const [message, setMessage] = useState('')
  const [user, setUser] = useState(null)

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('Link xác thực không hợp lệ.')
      return
    }

    verifyEmail(token)
  }, [token])

  const verifyEmail = async (token) => {
    try {
      console.log('🔵 [VerifyEmail] Verifying token:', token)

      const response = await fetch(`http://localhost:3000/auth/verify-email?token=${token}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })

      const data = await response.json()
      console.log('📦 [VerifyEmail] Response:', data)

      if (!response.ok) {
        setStatus('error')
        setMessage(data.message || 'Xác thực thất bại.')
        return
      }

      // Success
      setStatus('success')
      setMessage(data.message)
      setUser(data.user)

      // Auto redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login')
      }, 3000)

    } catch (err) {
      console.error('❌ [VerifyEmail] Error:', err)
      setStatus('error')
      setMessage('Có lỗi xảy ra. Vui lòng thử lại.')
    }
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-left">
          <div className="verify-content">
            {status === 'loading' && (
              <>
                <div className="spinner"></div>
                <h2 style={{ color: '#4ecdc4', marginTop: '20px' }}>
                  🔄 Đang xác thực email...
                </h2>
                <p style={{ color: '#666', marginTop: '10px' }}>
                  Vui lòng đợi trong giây lát.
                </p>
              </>
            )}

            {status === 'success' && (
              <>
                <div className="success-icon">✅</div>
                <h2 style={{ color: '#4ecdc4', marginTop: '20px' }}>
                  Xác thực thành công!
                </h2>
                <p style={{ color: '#333', marginTop: '10px', fontSize: '16px' }}>
                  {message}
                </p>
                {user && (
                  <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f0f9ff', borderRadius: '8px' }}>
                    <p style={{ color: '#333', margin: '5px 0' }}>
                      <strong>Email:</strong> {user.email}
                    </p>
                    <p style={{ color: '#333', margin: '5px 0' }}>
                      <strong>Họ tên:</strong> {user.fullName}
                    </p>
                  </div>
                )}
                <p style={{ color: '#999', marginTop: '20px', fontSize: '14px' }}>
                  Đang chuyển hướng đến trang đăng nhập...
                </p>
              </>
            )}

            {status === 'error' && (
              <>
                <div className="error-icon">❌</div>
                <h2 style={{ color: '#e74c3c', marginTop: '20px' }}>
                  Xác thực thất bại
                </h2>
                <p style={{ color: '#666', marginTop: '10px', fontSize: '16px' }}>
                  {message}
                </p>
                <div style={{ marginTop: '30px' }}>
                  <button 
                    onClick={() => navigate('/register')}
                    style={{
                      padding: '12px 30px',
                      backgroundColor: '#4ecdc4',
                      color: 'white',
                      border: 'none',
                      borderRadius: '5px',
                      fontSize: '16px',
                      cursor: 'pointer',
                      marginRight: '10px'
                    }}
                  >
                    Đăng ký lại
                  </button>
                  <button 
                    onClick={() => navigate('/login')}
                    style={{
                      padding: '12px 30px',
                      backgroundColor: '#95a5a6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '5px',
                      fontSize: '16px',
                      cursor: 'pointer'
                    }}
                  >
                    Đăng nhập
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="login-right">
          <div className="branding">
            <h1 className="brand-title">
              <span className="brand-dyna">Dyna</span>
              <span className="brand-vault">Vault</span>
            </h1>
            <p className="brand-subtitle">
              Gìn giữ lịch sử - Lan tỏa văn hóa Đà Nẵng
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .verify-content {
          text-align: center;
          padding: 40px;
          max-width: 500px;
          margin: 0 auto;
        }

        .spinner {
          width: 50px;
          height: 50px;
          border: 5px solid #f3f3f3;
          border-top: 5px solid #4ecdc4;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .success-icon {
          font-size: 60px;
          animation: scaleIn 0.5s ease-out;
        }

        .error-icon {
          font-size: 60px;
          animation: shake 0.5s ease-out;
        }

        @keyframes scaleIn {
          0% { transform: scale(0); }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
      `}</style>
    </div>
  )
}

export default VerifyEmail
