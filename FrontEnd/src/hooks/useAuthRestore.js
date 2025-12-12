import { useEffect, useContext, useRef } from "react";
import AppContext from "../context/context";
import axios from "axios";

/**
 * Hook để restore authentication sau khi refresh (F5)
 *
 * Flow:
 * 1. App mount → Gọi /users/me (backend tự đọc access_token từ HttpOnly cookie)
 * 2. Nếu 200 → restore user session
 * 3. Nếu 401 → user chưa đăng nhập, giữ logout state
 */
export const useAuthRestore = () => {
  const { setUser, setIsAuthenticated, setIsAuthLoading } =
    useContext(AppContext);
  const hasAttemptedRestore = useRef(false);

  useEffect(() => {
    if (hasAttemptedRestore.current) return;
    hasAttemptedRestore.current = true;

    const restoreSession = async () => {
      try {
        console.log("🔄 [useAuthRestore] Starting session restore...");

        // 🔥 BƯỚC 1: Thử refresh token trước (để đảm bảo access token còn hiệu lực)
        try {
          await axios.post("http://localhost:3000/auth/refresh", {}, {
            withCredentials: true,
            timeout: 2000,
          });
          console.log("✅ [useAuthRestore] Token refreshed successfully");
        } catch (refreshError) {
          // Nếu refresh thất bại (401) → user chưa đăng nhập hoặc refresh token hết hạn
          // Không throw error, tiếp tục thử gọi /users/me (có thể access token vẫn còn)
          if (refreshError.response?.status === 401) {
            console.log("ℹ️ [useAuthRestore] Refresh token expired or not found");
          }
        }

        // 🔥 BƯỚC 2: GỌI /users/me - Backend tự đọc token từ HttpOnly cookie
        const response = await axios.get("http://localhost:3000/users/me", {
          withCredentials: true,
          timeout: 3000, // ⏱️ Tăng timeout lên 3000ms để đảm bảo request hoàn thành
        });

        const user = response.data;
        console.log("✅ [useAuthRestore] User fetched:", user?.email);

        // ✅ Normalize user data
        const roleId = user?.RoleID || user?.roleId || null;
        const roleName =
          user?.Role ||
          user?.role ||
          (roleId === 1 ? "Admin" : roleId === 3 ? "Moderator" : "User");

        const normalizedUser = {
          userId: user?.UserID || user?.userId || null,
          email: user?.Email || user?.email || "",
          fullName: user?.FullName || user?.fullName || "",
          roleId: roleId,
          Role: roleName,
          avatar:
            user?.profile?.Avatar ||
            user?.profile?.avatar ||
            user?.Avatar ||
            user?.avatar ||
            "/img/default-avatar.png",
        };

        setUser(normalizedUser);
        setIsAuthenticated(true);
        console.log("✅ [useAuthRestore] Session restored successfully");
      } catch (error) {
        // 401 = Not authenticated (normal case, không log error)
        if (error.response?.status === 401) {
          console.log("ℹ️ [useAuthRestore] Not authenticated (401)");
        } else if (error.code === "ECONNABORTED") {
          console.log("⏱️ [useAuthRestore] Request timeout");
        } else {
          console.error("❌ [useAuthRestore] Error:", error.message);
        }

        // Clear state khi không authenticated
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsAuthLoading(false);
      }
    };

    restoreSession();
  }, [setUser, setIsAuthenticated, setIsAuthLoading]);
};
