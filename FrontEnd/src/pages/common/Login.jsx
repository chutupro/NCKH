import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import authService from "../../services/authService";
import AppContext from "../../context/context";
import "../../Styles/login-register/login.css";

const Login = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setUser, setIsAuthenticated } = useContext(AppContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!email.trim() || !password.trim()) {
      setError("Không được để trống.");
      toast.error("Không được để trống.", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
      });
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Email không hợp lệ.");
      toast.error("Email không hợp lệ.", {
        position: "top-right",
        autoClose: 5000,
      });
      return;
    }

    // Password length validation
    if (password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự.");
      toast.error("Mật khẩu phải có ít nhất 6 ký tự.", {
        position: "top-right",
        autoClose: 5000,
      });
      return;
    }

    // Clear error và bắt đầu request
    setError("");
    setLoading(true);

    try {
      const response = await authService.login(email, password, rememberMe);

      // Normalize user data
      const roleId = response?.user?.roleId ?? response?.user?.RoleID ?? null;
      const roleName =
        response?.user?.role ??
        response?.user?.Role ??
        (roleId === 1 ? "Admin" : roleId === 3 ? "Moderator" : "User");

      const normalizedUser = {
        userId: response?.user?.userId ?? response?.user?.UserID ?? null,
        email: response?.user?.email ?? response?.user?.Email ?? email,
        fullName: response?.user?.fullName ?? response?.user?.FullName ?? "",
        roleId: roleId,
        Role: roleName,
        profile: {
          avatar:
            response?.user?.profile?.avatar ??
            response?.user?.avatar ??
            "/img/image.png",
        },
      };

      console.log("🔐 [Login] Normalized user:", normalizedUser);

      // 🔥 KHÔNG set accessToken nữa - dùng HttpOnly cookie
      setUser(normalizedUser);
      setIsAuthenticated(true);

      // Dispatch event để notify Header component
      window.dispatchEvent(new Event("userLoggedIn"));

      // Kiểm tra xem có địa điểm cần quay lại không (từ map review)
      const returnToPlaceData = localStorage.getItem("returnToPlace");
      const redirectPath = sessionStorage.getItem("redirectAfterLogin");

      // Redirect sau 500ms để user thấy toast
      setTimeout(() => {
        if (returnToPlaceData) {
          // Nếu có returnToPlace, redirect về map (không xóa localStorage, để MapPage xử lý)
          navigate("/map");
        } else if (redirectPath) {
          // Nếu có redirectAfterLogin từ sessionStorage
          sessionStorage.removeItem("redirectAfterLogin");
          navigate(redirectPath);
        } else {
          // Tất cả user (kể cả Admin) đều vào trang chủ
          navigate("/");
        }
      }, 500);
    } catch (err) {
      // Xử lý error message từ backend
      const errorMessage =
        err?.message || "Email hoặc mật khẩu không đúng. Vui lòng thử lại.";

      setError(errorMessage);
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const onGoogle = () => {
    // Generate random state for CSRF protection
    const state = crypto.randomUUID
      ? crypto.randomUUID()
      : Math.random().toString(36).substring(2) + Date.now().toString(36);
    sessionStorage.setItem("oauth_state", state);

    // REDIRECT TO GOOGLE OAUTH
    window.location.href = `http://localhost:3000/auth/google?state=${state}`;
  };

  const onFacebook = () => {
    // Generate random state for CSRF protection
    const state = crypto.randomUUID
      ? crypto.randomUUID()
      : Math.random().toString(36).substring(2) + Date.now().toString(36);
    sessionStorage.setItem("oauth_state", state);

    // REDIRECT TO FACEBOOK OAUTH
    window.location.href = `http://localhost:3000/auth/facebook?state=${state}`;
  };

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
            <h2 className="auth-title">Đăng nhập</h2>

            {/* Error Message */}
            {error && (
              <div
                style={{
                  padding: "12px 16px",
                  marginBottom: "20px",
                  backgroundColor: "rgba(239, 68, 68, 0.1)",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                  borderRadius: "8px",
                  color: "#ef4444",
                  fontSize: "0.9rem",
                }}
              >
                {error}
              </div>
            )}

            {/* Form */}
            <form className="auth-form" onSubmit={onSubmit}>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    // ✅ Clear error khi người dùng bắt đầu sửa
                    if (error) setError("");
                  }}
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
                  onChange={(e) => {
                    setPassword(e.target.value);
                    // ✅ Clear error khi người dùng bắt đầu sửa
                    if (error) setError("");
                  }}
                  required
                />
              </div>

              <div className="form-options">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span>Ghi nhớ đăng nhập</span>
                </label>
                <Link to="/forgot-password" className="link-primary">
                  Quên mật khẩu?
                </Link>
              </div>

              <button
                className="auth-btn-submit"
                type="submit"
                disabled={loading}
              >
                {loading ? "Đang đăng nhập..." : "ĐĂNG NHẬP"}
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
                  <path
                    fill="#EA4335"
                    d="M12 11v2h5.2C16.9 15.9 14.7 17 12 17c-3.9 0-7-3.1-7-7s3.1-7 7-7c1.9 0 3.5.7 4.7 1.9l1.5-1.5C17.6 2.6 14.9 1.5 12 1.5 6 1.5 1.5 6 1.5 12S6 22.5 12 22.5c5.8 0 10-4 10-10 0-.7-.1-1.3-.2-1.9H12z"
                  />
                </svg>
                Google
              </button>

              <button className="btn-social" onClick={onFacebook}>
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path
                    fill="#1877F2"
                    d="M22 12a10 10 0 10-11.5 9.9v-7H8.5v-2.9h2V9.1c0-2 1.2-3.1 3-3.1.9 0 1.8.1 1.8.1v2h-1c-1 0-1.3.6-1.3 1.2v1.6h2.2l-.4 2.9h-1.8V22A10 10 0 0022 12z"
                  />
                </svg>
                Facebook
              </button>
            </div>

            {/* Sign up link */}
            <p className="auth-footer">
              Bạn mới biết đến Đà Nẵng History?{" "}
              <Link to="/register" className="link-primary">
                Đăng ký
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
