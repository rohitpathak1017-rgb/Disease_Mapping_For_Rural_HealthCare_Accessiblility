import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar.jsx";
import Sidebar from "../../components/Sidebar.jsx";
import LoadingSpinner from "../../components/LoadingSpinner.jsx";
import ErrorMessage from "../../components/ErrorMessage.jsx";
import { getDashboardStats } from "../../services/admin.service.js";

// ── Stat Card ─────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, icon, color, to }) => (
  <Link to={to} className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500 font-medium">{label}</p>
        <p className={`text-3xl font-bold mt-1 ${color}`}>{value ?? "—"}</p>
      </div>
      <div className={`text-4xl`}>{icon}</div>
    </div>
  </Link>
);

// ─────────────────────────────────────────────────────────────────────────────
const AdminDashboard = () => {
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  const fetchStats = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getDashboardStats();
      setStats(res.data);
    } catch {
      setError("Failed to load dashboard stats");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStats(); }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">

          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
            <p className="text-gray-500 text-sm mt-1">Overview of the Disease Mapping System</p>
          </div>

          {loading && <LoadingSpinner fullScreen={false} />}
          {error   && <ErrorMessage message={error} onRetry={fetchStats} />}

          {stats && (
            <>
              {/* Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                <StatCard
                  label="Total Health Workers"
                  value={stats.totalWorkers}
                  icon="👨‍⚕️"
                  color="text-blue-600"
                  to="/admin/workers"
                />
                <StatCard
                  label="Total Villages"
                  value={stats.totalVillages}
                  icon="🏘️"
                  color="text-green-600"
                  to="/admin/villages"
                />
                <StatCard
                  label="Public Users"
                  value={stats.totalPublic}
                  icon="👥"
                  color="text-purple-600"
                  to="#"
                />
                <StatCard
                  label="Assigned Villages"
                  value={stats.assignedVillages}
                  icon="📌"
                  color="text-orange-600"
                  to="/admin/assign-worker"
                />
                <StatCard
                  label="Unassigned Villages"
                  value={stats.unassignedVillages}
                  icon="⚠️"
                  color="text-red-600"
                  to="/admin/assign-worker"
                />
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: "Add Worker",   icon: "👨‍⚕️", to: "/admin/workers"       },
                    { label: "Add Village",  icon: "🏘️",  to: "/admin/villages"      },
                    { label: "Add Disease",  icon: "🦠",  to: "/admin/diseases"      },
                    { label: "Assign Worker",icon: "📌",  to: "/admin/assign-worker" },
                  ].map((action) => (
                    <Link
                      key={action.to}
                      to={action.to}
                      className="flex flex-col items-center gap-2 p-4 bg-gray-50 hover:bg-blue-50 rounded-xl transition-colors group"
                    >
                      <span className="text-2xl">{action.icon}</span>
                      <span className="text-xs font-medium text-gray-600 group-hover:text-blue-700 text-center">
                        {action.label}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </>
          )}

        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;