import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import authService from '../../services/authService'
import '../../Styles/login-register/login.css'

const Register = () => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    // Validate password match
    if (password !== confirmPassword) {
      setError('Mật khẩu không khớp!')
      return
    }

    // Validate password length
    if (password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự!')
      return
    }

    setLoading(true)

    try {
      const response = await authService.register(email, password, fullName)
      console.log('Register successful:', response)
      
      // Redirect về trang login ngay lập tức
      navigate('/login')
    } catch (err) {
      console.error('Register error:', err)
      setError(err.message || 'Đăng ký thất bại. Email có thể đã được sử dụng.')
    } finally {
      setLoading(false)
    }
  }

  const onGoogle = () => {
    console.log('google sign up')
    // TODO: trigger Google OAuth flow
  }

  const onFacebook = () => {
    console.log('facebook sign up')
    // TODO: trigger Facebook OAuth flow
  }

  return (
    <div className="auth-page-split">
      {/* Container chứa 2 cột nổi lên trên background */}
      <div className="auth-container">
        {/* Left Side: Logo & Branding */}
        <div className="auth-left">
          <div className="auth-logo-large">
            <div className="dragon-icon">🐉</div>
            <h1 className="auth-brand-large">Đà Nẵng History</h1>
            <p className="auth-tagline">Khám phá lịch sử qua hình ảnh</p>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="auth-right">
          <div className="auth-form-wrapper">
            <h2 className="auth-title">Đăng ký</h2>

        {/* Error Message */}
        {error && (
          <div style={{
            padding: '12px 16px',
            marginBottom: '20px',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '8px',
            color: '#ef4444',
            fontSize: '0.9rem'
          }}>
            {error}
          </div>
        )}

        {/* Form */}
        <form className="auth-form" onSubmit={onSubmit}>
          <div className="form-group">
            <label htmlFor="fullName">Họ và tên</label>
            <input
              id="fullName"
              type="text"
              placeholder="Nguyễn Văn A"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Mật khẩu</label>
            <input
              id="password"
              type="password"
              placeholder="••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Nhập lại mật khẩu</label>
            <input
              id="confirmPassword"
              type="password"
              placeholder="••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? 'Đang đăng ký...' : 'ĐĂNG KÝ'}
          </button>
        </form>

        {/* Divider */}
        <div className="divider">
          <span>hoặc</span>
        </div>

        {/* Social Buttons */}
        <div className="social-buttons">
          <button className="btn-social" onClick={onGoogle}>
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M12 11v2h5.2C16.9 15.9 14.7 17 12 17c-3.9 0-7-3.1-7-7s3.1-7 7-7c1.9 0 3.5.7 4.7 1.9l1.5-1.5C17.6 2.6 14.9 1.5 12 1.5 6 1.5 1.5 6 1.5 12S6 22.5 12 22.5c5.8 0 10-4 10-10 0-.7-.1-1.3-.2-1.9H12z"/>
            </svg>
            Google
          </button>

          <button className="btn-social" onClick={onFacebook}>
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#1877F2" d="M22 12a10 10 0 10-11.5 9.9v-7H8.5v-2.9h2V9.1c0-2 1.2-3.1 3-3.1.9 0 1.8.1 1.8.1v2h-1c-1 0-1.3.6-1.3 1.2v1.6h2.2l-.4 2.9h-1.8V22A10 10 0 0022 12z"/>
            </svg>
            Facebook
          </button>
        </div>

        {/* Sign in link */}
        <p className="auth-footer">
          Bạn đã có tài khoản? <Link to="/login" className="link-primary">Đăng nhập</Link>
        </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register
