import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar.jsx";
import Sidebar from "../../components/Sidebar.jsx";
import LoadingSpinner from "../../components/LoadingSpinner.jsx";
import ErrorMessage from "../../components/ErrorMessage.jsx";
import useAuth from "../../hooks/useAuth.js";
import { getWorkerCampStats } from "../../services/camp.service.js";
import { getAllReports } from "../../services/report.service.js";
import { getWorkerRatingStats } from "../../services/feedback.service.js";
import { roundToOne } from "../../utils/helpers.js";

// ── Stat Card ─────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, icon, color, to }) => (
  <Link to={to} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500 font-medium">{label}</p>
        <p className={`text-3xl font-bold mt-1 ${color}`}>{value ?? "—"}</p>
      </div>
      <span className="text-4xl">{icon}</span>
    </div>
  </Link>
);

// ─────────────────────────────────────────────────────────────────────────────
const WorkerDashboard = () => {
  const { user } = useAuth();

  const [campStats,   setCampStats]   = useState(null);
  const [reports,     setReports]     = useState([]);
  const [ratingStats, setRatingStats] = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState("");

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [campRes, reportRes, ratingRes] = await Promise.all([
          getWorkerCampStats(),
          getAllReports(),
          getWorkerRatingStats(user._id),
        ]);
        setCampStats(campRes.data);
        setReports(reportRes.data?.slice(0, 5) || []);
        setRatingStats(ratingRes.data);
      } catch {
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [user._id]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">

          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800">
              Welcome, {user?.name} 👋
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Assigned Village:{" "}
              <span className="font-medium text-blue-600">
                {user?.assignedVillage?.villageName || "Not assigned yet"}
              </span>
            </p>
          </div>

          {loading && <LoadingSpinner fullScreen={false} />}
          {error   && <ErrorMessage message={error} />}

          {!loading && !error && (
            <>
              {/* Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatCard
                  label="Total Camps"
                  value={campStats?.totalCamps}
                  icon="🏕️"
                  color="text-blue-600"
                  to="/worker/camp"
                />
                <StatCard
                  label="Reports Submitted"
                  value={reports.length}
                  icon="📋"
                  color="text-green-600"
                  to="/worker/report"
                />
                <StatCard
                  label="Avg Rating"
                  value={ratingStats?.averageRating ? `${roundToOne(ratingStats.averageRating)} ⭐` : "N/A"}
                  icon="💬"
                  color="text-yellow-600"
                  to="/worker/feedback"
                />
                <StatCard
                  label="Total Feedback"
                  value={ratingStats?.totalFeedback ?? 0}
                  icon="📣"
                  color="text-purple-600"
                  to="/worker/feedback"
                />
              </div>

              {/* Camp Status Breakdown */}
              {campStats?.stats?.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">Camp Status</h2>
                  <div className="flex flex-wrap gap-3">
                    {campStats.stats.map((s) => (
                      <div key={s._id} className="flex items-center gap-2 bg-gray-50 rounded-lg px-4 py-2">
                        <span className="text-sm font-medium text-gray-700">{s._id}</span>
                        <span className="text-sm font-bold text-blue-600">{s.count}</span>
                        <span className="text-xs text-gray-400">({s.totalPatients} patients)</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Reports */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-gray-800">Recent Reports</h2>
                  <Link to="/worker/report" className="text-sm text-blue-600 hover:underline">
                    View All
                  </Link>
                </div>
                {reports.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-4">No reports submitted yet</p>
                ) : (
                  <div className="space-y-2">
                    {reports.map((r) => (
                      <div key={r._id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-gray-800">
                            {r.village?.villageName} — {r.reportMonth}/{r.reportYear}
                          </p>
                          <p className="text-xs text-gray-500">
                            {r.diseases?.length} disease(s) reported
                          </p>
                        </div>
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${r.isReviewed ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                          {r.isReviewed ? "Reviewed" : "Pending"}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: "Create Camp",    icon: "🏕️", to: "/worker/camp"     },
                    { label: "Submit Report",  icon: "📋", to: "/worker/report"   },
                    { label: "View Charts",    icon: "📈", to: "/worker/charts"   },
                    { label: "View Feedback",  icon: "💬", to: "/worker/feedback" },
                  ].map((a) => (
                    <Link
                      key={a.to}
                      to={a.to}
                      className="flex flex-col items-center gap-2 p-4 bg-gray-50 hover:bg-blue-50 rounded-xl transition-colors group"
                    >
                      <span className="text-2xl">{a.icon}</span>
                      <span className="text-xs font-medium text-gray-600 group-hover:text-blue-700 text-center">
                        {a.label}
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

export default WorkerDashboard;