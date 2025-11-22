import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import '../../Styles/login-register/login.css';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Nhập email, 2: Nhập OTP, 3: Đặt mật khẩu mới
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOTP = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      setError('Vui lòng nhập email.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Email không hợp lệ.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:3000/auth/forgot-password/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Gửi OTP thất bại');
      }

      toast.success('Mã OTP đã được gửi đến email của bạn!', {
        position: 'top-right',
        autoClose: 3000,
      });

      setStep(2);
    } catch (err) {
      console.error('Send OTP error:', err);
      setError(err.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!otp.trim()) {
      setError('Vui lòng nhập mã OTP.');
      return;
    }

    if (otp.length !== 6) {
      setError('Mã OTP phải có 6 chữ số.');
      return;
    }

    if (!newPassword.trim()) {
      setError('Vui lòng nhập mật khẩu mới.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:3000/auth/forgot-password/reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          otpCode: otp,
          newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Đặt lại mật khẩu thất bại');
      }

      toast.success('Đặt lại mật khẩu thành công! Vui lòng đăng nhập.', {
        position: 'top-right',
        autoClose: 3000,
      });

      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err) {
      console.error('Reset password error:', err);
      setError(err.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-split">
      <div className="auth-container">
        {}
        <div className="auth-left">
          <div className="auth-logo-large">
            <div className="dragon-icon">🔒🔑</div>
            <h1 className="auth-brand-large">Quên Mật Khẩu</h1>
            <p className="auth-tagline">
              {step === 1 && 'Nhập email để nhận mã OTP'}
              {step === 2 && 'Xác thực OTP và đặt mật khẩu mới'}
            </p>
          </div>
        </div>

        {}
        <div className="auth-right">
          <div className="auth-form-wrapper">
            <h2 className="auth-title">
              {step === 1 && 'Nhập Email'}
              {step === 2 && 'Đặt Lại Mật Khẩu'}
            </h2>

            {}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '30px', gap: '10px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: step >= 1 ? '#4ecdc4' : '#e0e0e0',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
              }}>1</div>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: step >= 2 ? '#4ecdc4' : '#e0e0e0',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
              }}>2</div>
            </div>

            {}
            {error && (
              <div style={{
                padding: '12px 16px',
                marginBottom: '20px',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '8px',
                color: '#ef4444',
                fontSize: '0.9rem',
              }}>
                {error}
              </div>
            )}

            {}
            {step === 1 && (
              <form className="auth-form" onSubmit={handleSendOTP}>
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);

                      if (error) setError('');
                    }}
                    required
                  />
                </div>

                <button className="auth-btn-submit" type="submit" disabled={loading}>
                  {loading ? 'Đang gửi...' : 'Gửi Mã OTP'}
                </button>

                <p className="auth-footer">
                  Nhớ mật khẩu rồi? <a href="/login" style={{ color: '#4ecdc4', textDecoration: 'none' }}>Đăng nhập</a>
                </p>
              </form>
            )}

            {}
            {step === 2 && (
              <form className="auth-form" onSubmit={handleResetPassword}>
                <div className="form-group">
                  <label htmlFor="otp">Mã OTP</label>
                  <input
                    id="otp"
                    type="text"
                    placeholder="Nhập 6 chữ số"
                    value={otp}
                    onChange={(e) => {
                      setOtp(e.target.value.replace(/\D/g, '').slice(0, 6));

                      if (error) setError('');
                    }}
                    maxLength={6}
                    required
                  />
                  <small style={{ color: '#666', fontSize: '0.85rem' }}>
                    Mã OTP đã được gửi đến: <strong>{email}</strong>
                  </small>
                </div>

                <div className="form-group">
                  <label htmlFor="newPassword">Mật khẩu mới</label>
                  <input
                    id="newPassword"
                    type="password"
                    placeholder="••••••"
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);

                      if (error) setError('');
                    }}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword">Xác nhận mật khẩu</label>
                  <input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);

                      if (error) setError('');
                    }}
                    required
                  />
                </div>

                <button className="auth-btn-submit" type="submit" disabled={loading}>
                  {loading ? 'Đang xử lý...' : 'Đặt Lại Mật Khẩu'}
                </button>

                <p className="auth-footer">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#4ecdc4',
                      cursor: 'pointer',
                      textDecoration: 'underline',
                    }}
                  >
                    ← Quay lại
                  </button>
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
