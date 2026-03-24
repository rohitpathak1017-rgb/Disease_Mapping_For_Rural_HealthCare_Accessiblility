import { Navigate, Outlet, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth.js";
import LoadingSpinner from "./LoadingSpinner.jsx";

// ── ProtectedRoute ────────────────────────────────────────────────────────────
// Usage:
//   <Route element={<ProtectedRoute />}>                        ← any logged in
//   <Route element={<ProtectedRoute allowedRoles={["admin"]} />}> ← role specific
// ─────────────────────────────────────────────────────────────────────────────
const ProtectedRoute = ({ allowedRoles }) => {
  const { user, loading, isLoggedIn } = useAuth();
  const location = useLocation();

  // Still fetching profile on app load
  if (loading) return <LoadingSpinner />;

  // Not logged in → redirect to login, save current path for redirect back
  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Logged in but wrong role → redirect to their own dashboard
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const redirectMap = {
      admin:        "/admin/dashboard",
      healthworker: "/worker/dashboard",
      public:       "/",
    };
    return <Navigate to={redirectMap[user.role] || "/"} replace />;
  }

  // All checks passed → render the child route
  return <Outlet />;
};

export default ProtectedRoute;