import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store";
import { authService } from "../services/authService";

type Props = {
  children: React.ReactNode;
};

const ProtectedRoute = ({ children }: Props) => {
  const { isAuthenticated, isLoading, setUser, setLoading, logout } =
    useAuthStore();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) {
        logout();
        return;
      }

      try {
        const profile = await authService.getMe();
        setUser(profile);
      } catch {
        // Token invalid/expired and refresh failed. Clear state and redirect.
        logout();
      }
    };

    if (isAuthenticated && isLoading) {
      checkAuth();
    } else if (!isAuthenticated && isLoading) {
      setLoading(false);
    }
  }, [isAuthenticated, isLoading, setUser, setLoading, logout]);

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <div
          style={{
            width: "48px",
            height: "48px",
            border: "3px solid var(--color-card-border)",
            borderTopColor: "var(--color-primary)",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
