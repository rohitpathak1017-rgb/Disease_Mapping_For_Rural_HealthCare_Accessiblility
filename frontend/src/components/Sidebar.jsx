import { NavLink } from "react-router-dom";
import useAuth from "../hooks/useAuth.js";

// ── Sidebar Links per Role ────────────────────────────────────────────────────
const adminLinks = [
  { to: "/admin/dashboard",     label: "Dashboard",       icon: "📊" },
  { to: "/admin/workers",       label: "Health Workers",  icon: "👨‍⚕️" },
  { to: "/admin/assign-worker", label: "Assign Worker",   icon: "📌" },
  { to: "/admin/villages",      label: "Villages",        icon: "🏘️"  },
  { to: "/admin/diseases",      label: "Diseases",        icon: "🦠"  },
];

const workerLinks = [
  { to: "/worker/dashboard", label: "Dashboard",      icon: "📊" },
  { to: "/worker/camp",      label: "Camp Management",icon: "🏕️"  },
  { to: "/worker/report",    label: "Submit Report",  icon: "📋" },
  { to: "/worker/charts",    label: "Disease Charts", icon: "📈" },
  { to: "/worker/feedback",  label: "Feedback",       icon: "💬" },
];

// ─────────────────────────────────────────────────────────────────────────────
const Sidebar = () => {
  const { isAdmin, isHealthWorker, user } = useAuth();

  const links = isAdmin ? adminLinks : isHealthWorker ? workerLinks : [];

  if (!links.length) return null;

  return (
    <aside className="w-64 min-h-screen bg-white border-r border-gray-200 flex flex-col">

      {/* ── User Info ──────────────────────────────────────────────────────── */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">
              {user?.name?.charAt(0)?.toUpperCase()}
            </span>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800 truncate w-36">
              {user?.name}
            </p>
            <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
          </div>
        </div>
      </div>

      {/* ── Nav Links ──────────────────────────────────────────────────────── */}
      <nav className="flex-1 p-3 space-y-1">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`
            }
          >
            <span className="text-base">{link.icon}</span>
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <div className="p-4 border-t border-gray-100">
        <p className="text-xs text-gray-400 text-center">
          Disease Mapping System v1.0
        </p>
      </div>

    </aside>
  );
};

export default Sidebar;