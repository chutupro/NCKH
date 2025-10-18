import React, { useState } from 'react'
import '../../Styles/login-register/login.css'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const onSubmit = (e) => {
    e.preventDefault()
    // Placeholder: handle login submission
    console.log('login', { email, password })
  }

  const onGoogle = () => {
    // Placeholder: trigger Google OAuth flow
    console.log('google sign in')
  }

  const onFacebook = () => {
    // Placeholder: trigger Facebook OAuth flow
    console.log('facebook sign in')
  }

  return (
    <div className="login-page">
      <div className="bg-image" aria-hidden="true" />

      <div className="login-card" role="main">
        <p className="lead">Đăng nhập để tiếp tục</p>

        <form className="login-form" onSubmit={onSubmit}>
          <label className="sr-only" htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label className="sr-only" htmlFor="password">Mật khẩu</label>
          <input
            id="password"
            type="password"
            placeholder="Mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button className="btn primary" type="submit">Đăng nhập</button>
        </form>

        <div className="divider"><span>hoặc</span></div>

        <div className="socials">
          <button className="btn google" onClick={onGoogle} aria-label="Sign in with Google">
            <svg className="icon" viewBox="0 0 24 24" width="18" height="18" aria-hidden>
              <path fill="#EA4335" d="M12 11v2h5.2C16.9 15.9 14.7 17 12 17c-3.9 0-7-3.1-7-7s3.1-7 7-7c1.9 0 3.5.7 4.7 1.9l1.5-1.5C17.6 2.6 14.9 1.5 12 1.5 6 1.5 1.5 6 1.5 12S6 22.5 12 22.5c5.8 0 10-4 10-10 0-.7-.1-1.3-.2-1.9H12z"/>
            </svg>
            Đăng nhập với Google
          </button>

          <button className="btn facebook" onClick={onFacebook} aria-label="Sign in with Facebook">
            <svg className="icon" viewBox="0 0 24 24" width="18" height="18" aria-hidden>
              <path fill="#1877F2" d="M22 12a10 10 0 10-11.5 9.9v-7H8.5v-2.9h2V9.1c0-2 1.2-3.1 3-3.1.9 0 1.8.1 1.8.1v2h-1c-1 0-1.3.6-1.3 1.2v1.6h2.2l-.4 2.9h-1.8V22A10 10 0 0022 12z"/>
            </svg>
            Đăng nhập với Facebook
          </button>
        </div>

        <p className="signup">Chưa có tài khoản? <a href="#/register">Đăng ký</a></p>
      </div>
    </div>
  )
}

export default Login
