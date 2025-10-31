import React, { useState, useEffect } from 'react'

const OTPVerification = ({ email, onVerifySuccess, onBack }) => {
  const [otpCode, setOtpCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [resendTimer, setResendTimer] = useState(60)
  const [canResend, setCanResend] = useState(false)

  // Countdown timer cho resend
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      setCanResend(true)
    }
  }, [resendTimer])

  const handleVerify = async () => {
    setError('')

    if (!otpCode || otpCode.length !== 6) {
      setError('Vui lòng nhập đầy đủ 6 số mã OTP.')
      return
    }

    setLoading(true)
    // Callback trả về OTP code để parent component xử lý
    onVerifySuccess(otpCode)
    setLoading(false)
  }

  const handleResend = async () => {
    setError('')
    setLoading(true)

    try {
      const response = await fetch('http://localhost:3000/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        // Xử lý error message từ backend
        let errorMessage = 'Không thể gửi lại mã OTP'
        
        if (data.message) {
          errorMessage = Array.isArray(data.message) 
            ? data.message.join(', ') 
            : data.message
        }
        
        throw new Error(errorMessage)
      }

      setResendTimer(60)
      setCanResend(false)
      alert('Mã OTP mới đã được gửi đến email của bạn!')
    } catch (err) {
      console.error('Resend OTP error:', err)
      setError(err.message || 'Không thể gửi lại mã OTP. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  const handleOTPChange = (value) => {
    // Chỉ cho phép nhập số
    const numericValue = value.replace(/\D/g, '').slice(0, 6)
    setOtpCode(numericValue)
  }

  return (
    <div className="otp-verification">
      <div className="otp-header">
        <button className="back-button" onClick={onBack}>
          ← Quay lại
        </button>
        <h2>Xác thực Email</h2>
      </div>

      <p className="otp-instruction">
        Chúng tôi đã gửi mã xác thực gồm 6 số đến email:<br />
        <strong>{email}</strong>
      </p>

      <div className="otp-warning" style={{
        backgroundColor: '#fff3cd',
        border: '1px solid #ffc107',
        borderRadius: '8px',
        padding: '12px',
        marginBottom: '20px',
        fontSize: '13px',
        color: '#856404'
      }}>
        ⚠️ <strong>Lưu ý:</strong> Nếu email không tồn tại, bạn sẽ nhận được thông báo lỗi từ hệ thống email trong vài phút. 
        Vui lòng kiểm tra hộp thư và thư mục spam.
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="otp-input-container">
        <input
          type="text"
          className="otp-input"
          placeholder="000000"
          value={otpCode}
          onChange={(e) => handleOTPChange(e.target.value)}
          maxLength={6}
          autoFocus
        />
        <p className="otp-hint">Mã OTP có hiệu lực trong 10 phút</p>
      </div>

      <button
        className="auth-btn-submit"
        onClick={handleVerify}
        disabled={loading || otpCode.length !== 6}
      >
        {loading ? 'Đang xác thực...' : 'Xác nhận'}
      </button>

      <div className="otp-resend">
        {canResend ? (
          <button className="resend-button" onClick={handleResend} disabled={loading}>
            Gửi lại mã OTP
          </button>
        ) : (
          <p>Gửi lại mã sau {resendTimer} giây</p>
        )}
      </div>
    </div>
  )
}

export default OTPVerification
