import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const ProtectedRoute = ({ children, requiredPermissions = [] }) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // 检查用户是否有所需权限
  if (requiredPermissions.length > 0) {
    const hasPermission = requiredPermissions.every((permission) =>
      user.permissions.includes(permission)
    );
    if (!hasPermission) {
      return <Navigate to="/unauthorized" />;
    }
  }

  return children;
};

export default ProtectedRoute; 