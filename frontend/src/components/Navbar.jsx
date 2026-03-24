import { Link, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth.js";

const Navbar = () => {
  const { user, logout, isAdmin, isHealthWorker, isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const getDashboardLink = () => {
    if (isAdmin)        return "/admin/dashboard";
    if (isHealthWorker) return "/worker/dashboard";
    return "/";
  };

  const getRoleBadgeColor = () => {
    if (isAdmin)        return "bg-red-100 text-red-700";
    if (isHealthWorker) return "bg-green-100 text-green-700";
    return "bg-blue-100 text-blue-700";
  };

  const getRoleLabel = () => {
    if (isAdmin)        return "Admin";
    if (isHealthWorker) return "Health Worker";
    return "Public";
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* ── Logo ─────────────────────────────────────────────────────── */}
          <Link to={getDashboardLink()} className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">DM</span>
            </div>
            <span className="font-bold text-gray-800 text-lg hidden sm:block">
              Disease Mapping
            </span>
          </Link>

          {/* ── Right Side ───────────────────────────────────────────────── */}
          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <>
                {/* Role Badge */}
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getRoleBadgeColor()}`}>
                  {getRoleLabel()}
                </span>

                {/* User Name */}
                <span className="text-sm text-gray-700 font-medium hidden sm:block">
                  {user?.name}
                </span>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="text-sm bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg transition-colors"
                >
                  Register
                </Link>
              </>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
};

export default Navbar;