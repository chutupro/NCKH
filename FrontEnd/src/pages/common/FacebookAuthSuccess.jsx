import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAppContext } from "../../context/useAppContext";
import { toast } from "react-toastify";

const FacebookAuthSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setUser, setAccessToken, setIsAuthenticated } = useAppContext();

  useEffect(() => {
    const handleFacebookAuth = async () => {
      const userParam = searchParams.get("user");
      const tokenParam = searchParams.get("token");

      if (userParam && tokenParam) {
        try {
          const userData = JSON.parse(decodeURIComponent(userParam));
          const token = decodeURIComponent(tokenParam);

          // Lưu token vào context (giống như đăng nhập thường)
          setAccessToken(token);

          // ✅ DELAY 100ms để cookie kịp được browser set
          await new Promise((resolve) => setTimeout(resolve, 100));

          // Fetch profile với token trong header (vì cookie có thể chưa được set kịp)
          const response = await fetch("/users/profile/me", {
            method: "GET",
            credentials: "include", // Gửi cookie kèm theo (nếu có)
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`, // ✅ GỬI TOKEN QUA HEADER
            },
          });

          if (!response.ok) {
            throw new Error("Failed to verify authentication");
          }

          const profileData = await response.json();

          // Lưu user vào Context
          setUser(profileData);
          setIsAuthenticated(true);

          // Kiểm tra redirect path theo thứ tự ưu tiên
          let redirectPath = "/";

          // 1. Kiểm tra returnToPlace (localStorage - từ map review cũ)
          const returnToPlaceData = localStorage.getItem("returnToPlace");

          // 2. Kiểm tra redirectAfterLogin (sessionStorage - từ login modal mới)
          const redirectAfterLogin =
            sessionStorage.getItem("redirectAfterLogin");

          if (returnToPlaceData) {
            // Nếu có returnToPlace, redirect về map (không xóa localStorage, để MapPage xử lý)
            redirectPath = "/map";
          } else if (redirectAfterLogin) {
            // Nếu có redirectAfterLogin, sử dụng path này
            redirectPath = redirectAfterLogin;
            sessionStorage.removeItem("redirectAfterLogin");
          } else if (profileData.Role === "Admin") {
            // Nếu là Admin, redirect về trang admin
            redirectPath = "/admin";
          }

          // Redirect
          setTimeout(() => {
            navigate(redirectPath);
          }, 1000);
        } catch (error) {
          console.error("Error in Facebook auth:", error);
          toast.error(
            "Có lỗi xảy ra khi xử lý thông tin đăng nhập. Vui lòng thử lại.",
            {
              position: "top-right",
            }
          );
          navigate("/login");
        }
      } else {
        toast.error("Không tìm thấy thông tin người dùng hoặc token", {
          position: "top-right",
        });
        navigate("/login");
      }
    };

    handleFacebookAuth();
  }, [searchParams, navigate, setUser, setIsAuthenticated]);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        flexDirection: "column",
        gap: "20px",
      }}
    >
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
      <p>Đang xử lý đăng nhập Facebook...</p>
    </div>
  );
};

export default FacebookAuthSuccess;
