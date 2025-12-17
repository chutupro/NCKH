import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import authService from '../../services/authService'
import OTPVerification from '../../Component/common/OTPVerification'
import { toast } from 'react-toastify'
import '../../Styles/login-register/login.css'

const Register = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState('register') // 'register' or 'otp'
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Show/hide password requirements
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false)

  // Password strength validation
  const [passwordStrength, setPasswordStrength] = useState({
    hasMinLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false,
    hasNoSpaces: true
  })

  // Password match status
  const [passwordMatch, setPasswordMatch] = useState(null) // null, true, false

  // Check password strength
  const checkPasswordStrength = (pwd) => {
    setPasswordStrength({
      hasMinLength: pwd.length >= 6,
      hasUpperCase: /[A-Z]/.test(pwd),
      hasLowerCase: /[a-z]/.test(pwd),
      hasNumber: /[0-9]/.test(pwd),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(pwd),
      hasNoSpaces: !/\s/.test(pwd)
    })
  }

  // Check password match
  const checkPasswordMatch = (pwd, confirmPwd) => {
    if (confirmPwd === '') {
      setPasswordMatch(null)
    } else if (pwd === confirmPwd) {
      setPasswordMatch(true)
    } else {
      setPasswordMatch(false)
    }
  }

  // Handle password change
  const handlePasswordChange = (e) => {
    const newPassword = e.target.value
    setPassword(newPassword)
    checkPasswordStrength(newPassword)
    checkPasswordMatch(newPassword, confirmPassword)
  }

  // Handle confirm password change
  const handleConfirmPasswordChange = (e) => {
    const newConfirmPassword = e.target.value
    setConfirmPassword(newConfirmPassword)
    checkPasswordMatch(password, newConfirmPassword)
  }

  // Check if form is valid
  const isFormValid = () => {
    return (
      fullName.trim() !== '' &&
      email.trim() !== '' &&
      Object.values(passwordStrength).every(value => value === true) &&
      passwordMatch === true
    )
  }

  // Gửi OTP
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Validation: Không được để trống
    if (!fullName.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      setError('Vui lòng điền đầy đủ thông tin.')
      return
    }

    // Validation: Email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('Email không hợp lệ.')
      return
    }

    // Validation: Password strength
    if (!Object.values(passwordStrength).every(value => value === true)) {
      setError('Mật khẩu chưa đủ mạnh. Vui lòng kiểm tra các yêu cầu.')
      return
    }

    // Validation: Password match
    if (password !== confirmPassword) {
      setError('Mật khẩu không khớp.')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('http://localhost:3000/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Không thể gửi OTP')
      }

      setStep('otp')
    } catch (err) {
      setError(err.message || 'Đăng ký thất bại')
    } finally {
      setLoading(false)
    }
  }

  // Verify OTP
  const handleVerifyOTP = async (otpCode) => {
    setError('')
    setLoading(true)

    try {
      const response = await fetch('http://localhost:3000/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otpCode, password, fullName }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Xác thực OTP thất bại')
      }

      toast.success('Đăng ký thành công! Đang chuyển đến trang đăng nhập...', {
        position: "top-right",
        autoClose: 2000,
      })
      
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      setError(err.message)
      return false
    } finally {
      setLoading(false)
    }
  }

  const handleBackToRegister = () => {
    setStep('register')
    setError('')
  }

  const onGoogle = () => {
    // ✅ REDIRECT TO GOOGLE OAUTH
    window.location.href = 'http://localhost:3000/auth/google';
  }

  const onFacebook = () => {
    // ✅ REDIRECT TO FACEBOOK OAUTH
    window.location.href = 'http://localhost:3000/auth/facebook';
  }

  return (
    <div className="auth-page-split">
      <div className="auth-container">
        <div className="auth-left">
          <div className="auth-logo-large">
            <div className="dragon-icon">🐉</div>
            <h1 className="auth-brand-large">Đà Nẵng History</h1>
            <p className="auth-tagline">Khám phá lịch sử qua hình ảnh</p>
          </div>
        </div>

        <div className="auth-right">
          <div className="auth-form-wrapper">
            {step === 'register' ? (
              <>
                <h2 className="auth-title">Đăng ký</h2>

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

                <form className="auth-form" onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label>Họ tên</label>
                    <input
                      type="text"
                      placeholder="Nhập họ tên"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      placeholder="example@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Mật khẩu</label>
                    <input
                      type="password"
                      placeholder="Nhập mật khẩu"
                      value={password}
                      onChange={handlePasswordChange}
                      onFocus={() => setShowPasswordRequirements(true)}
                      onBlur={() => setShowPasswordRequirements(false)}
                      required
                    />
                    
                    {/* Password Strength Indicator - Only show when focused or typing */}
                    {password && showPasswordRequirements && (
                      <div style={{ 
                        marginTop: '12px', 
                        padding: '16px', 
                        backgroundColor: 'rgba(30, 30, 30, 0.95)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '12px',
                        fontSize: '0.85rem',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
                        transition: 'all 0.3s ease'
                      }}>
                        <div style={{ 
                          fontWeight: '600', 
                          marginBottom: '12px', 
                          color: '#e5e7eb',
                          fontSize: '0.9rem'
                        }}>
                          Yêu cầu mật khẩu:
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '10px',
                            color: passwordStrength.hasMinLength ? '#10b981' : '#6b7280',
                            transition: 'color 0.2s ease'
                          }}>
                            <span style={{ 
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: '18px',
                              height: '18px',
                              borderRadius: '50%',
                              backgroundColor: passwordStrength.hasMinLength ? '#10b981' : 'rgba(107, 114, 128, 0.3)',
                              color: passwordStrength.hasMinLength ? '#fff' : '#6b7280',
                              fontSize: '11px',
                              fontWeight: 'bold',
                              transition: 'all 0.2s ease'
                            }}>
                              {passwordStrength.hasMinLength ? '✓' : ''}
                            </span>
                            <span>Ít nhất 6 ký tự</span>
                          </div>
                          
                          <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '10px',
                            color: passwordStrength.hasUpperCase ? '#10b981' : '#6b7280',
                            transition: 'color 0.2s ease'
                          }}>
                            <span style={{ 
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: '18px',
                              height: '18px',
                              borderRadius: '50%',
                              backgroundColor: passwordStrength.hasUpperCase ? '#10b981' : 'rgba(107, 114, 128, 0.3)',
                              color: passwordStrength.hasUpperCase ? '#fff' : '#6b7280',
                              fontSize: '11px',
                              fontWeight: 'bold',
                              transition: 'all 0.2s ease'
                            }}>
                              {passwordStrength.hasUpperCase ? '✓' : ''}
                            </span>
                            <span>Có chữ hoa (A-Z)</span>
                          </div>
                          
                          <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '10px',
                            color: passwordStrength.hasLowerCase ? '#10b981' : '#6b7280',
                            transition: 'color 0.2s ease'
                          }}>
                            <span style={{ 
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: '18px',
                              height: '18px',
                              borderRadius: '50%',
                              backgroundColor: passwordStrength.hasLowerCase ? '#10b981' : 'rgba(107, 114, 128, 0.3)',
                              color: passwordStrength.hasLowerCase ? '#fff' : '#6b7280',
                              fontSize: '11px',
                              fontWeight: 'bold',
                              transition: 'all 0.2s ease'
                            }}>
                              {passwordStrength.hasLowerCase ? '✓' : ''}
                            </span>
                            <span>Có chữ thường (a-z)</span>
                          </div>
                          
                          <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '10px',
                            color: passwordStrength.hasNumber ? '#10b981' : '#6b7280',
                            transition: 'color 0.2s ease'
                          }}>
                            <span style={{ 
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: '18px',
                              height: '18px',
                              borderRadius: '50%',
                              backgroundColor: passwordStrength.hasNumber ? '#10b981' : 'rgba(107, 114, 128, 0.3)',
                              color: passwordStrength.hasNumber ? '#fff' : '#6b7280',
                              fontSize: '11px',
                              fontWeight: 'bold',
                              transition: 'all 0.2s ease'
                            }}>
                              {passwordStrength.hasNumber ? '✓' : ''}
                            </span>
                            <span>Có số (0-9)</span>
                          </div>
                          
                          <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '10px',
                            color: passwordStrength.hasSpecialChar ? '#10b981' : '#6b7280',
                            transition: 'color 0.2s ease'
                          }}>
                            <span style={{ 
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: '18px',
                              height: '18px',
                              borderRadius: '50%',
                              backgroundColor: passwordStrength.hasSpecialChar ? '#10b981' : 'rgba(107, 114, 128, 0.3)',
                              color: passwordStrength.hasSpecialChar ? '#fff' : '#6b7280',
                              fontSize: '11px',
                              fontWeight: 'bold',
                              transition: 'all 0.2s ease'
                            }}>
                              {passwordStrength.hasSpecialChar ? '✓' : ''}
                            </span>
                            <span>Có ký tự đặc biệt (!@#$%...)</span>
                          </div>
                          
                          <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '10px',
                            color: passwordStrength.hasNoSpaces ? '#10b981' : '#6b7280',
                            transition: 'color 0.2s ease'
                          }}>
                            <span style={{ 
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: '18px',
                              height: '18px',
                              borderRadius: '50%',
                              backgroundColor: passwordStrength.hasNoSpaces ? '#10b981' : 'rgba(107, 114, 128, 0.3)',
                              color: passwordStrength.hasNoSpaces ? '#fff' : '#6b7280',
                              fontSize: '11px',
                              fontWeight: 'bold',
                              transition: 'all 0.2s ease'
                            }}>
                              {passwordStrength.hasNoSpaces ? '✓' : ''}
                            </span>
                            <span>Không có khoảng trắng</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="form-group">
                    <label>Xác nhận mật khẩu</label>
                    <input
                      type="password"
                      placeholder="Nhập lại mật khẩu"
                      value={confirmPassword}
                      onChange={handleConfirmPasswordChange}
                      required
                    />
                    
                    {/* Password Match Indicator */}
                    {confirmPassword && (
                      <div style={{ 
                        marginTop: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '10px 12px',
                        backgroundColor: passwordMatch 
                          ? 'rgba(16, 185, 129, 0.15)' 
                          : 'rgba(239, 68, 68, 0.15)',
                        borderRadius: '8px',
                        border: `1px solid ${passwordMatch ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                        fontSize: '0.88rem',
                        fontWeight: '500',
                        color: passwordMatch ? '#10b981' : '#ef4444',
                        transition: 'all 0.3s ease'
                      }}>
                        <span style={{ 
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          backgroundColor: passwordMatch ? '#10b981' : '#ef4444',
                          color: '#fff',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}>
                          {passwordMatch ? '✓' : '✗'}
                        </span>
                        <span>
                          {passwordMatch ? 'Mật khẩu khớp' : 'Mật khẩu không khớp'}
                        </span>
                      </div>
                    )}
                  </div>

                  <button 
                    className="auth-btn-submit" 
                    type="submit" 
                    disabled={loading || !isFormValid()}
                    style={{
                      opacity: (loading || !isFormValid()) ? 0.6 : 1,
                      cursor: (loading || !isFormValid()) ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {loading ? 'Đang xử lý...' : 'ĐĂNG KÝ'}
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

                {/* Login link */}
                <p className="auth-footer">
                  Bạn đã có tài khoản? <Link to="/login" className="link-primary">Đăng nhập</Link>
                </p>
              </>
            ) : (
              <>
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
                
                <OTPVerification
                  email={email}
                  onVerifySuccess={handleVerifyOTP}
                  onBack={handleBackToRegister}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register

