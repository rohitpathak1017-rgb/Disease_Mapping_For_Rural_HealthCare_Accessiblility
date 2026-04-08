import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { 
  Users, MapPin, Activity, AlertCircle, TrendingUp, 
  UserPlus, PlusCircle, BookmarkPlus, ArrowRight 
} from "lucide-react"; 
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

import Navbar from "../../components/Navbar.jsx";
import Sidebar from "../../components/Sidebar.jsx";
import LoadingSpinner from "../../components/LoadingSpinner.jsx";
import ErrorMessage from "../../components/ErrorMessage.jsx";
import { getDashboardStats } from "../../services/admin.service.js";

// ── Stat Card (Enhanced) ──────────────────────────────────────────────────────
const StatCard = ({ label, value, icon: Icon, colorClass, bgColor, to }) => (
  <Link to={to} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-all group">
    <div className="flex items-center space-x-4">
      <div className={`p-3 rounded-xl ${bgColor}`}>
        <Icon size={24} className={colorClass} />
      </div>
      <div>
        <p className="text-sm text-gray-500 font-medium">{label}</p>
        <h3 className="text-2xl font-bold text-gray-800">{value ?? "0"}</h3>
      </div>
    </div>
    <ArrowRight size={18} className="text-gray-300 group-hover:text-gray-500 transition-colors" />
  </Link>
);

// ─────────────────────────────────────────────────────────────────────────────
const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchStats = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getDashboardStats();
      setStats(res.data);
    } catch {
      setError("Failed to load dashboard stats. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStats(); }, []);

  // Mock data for Chart (Isse baad mein backend se replace kar sakte hain)
  const chartData = [
    { name: 'Villages', count: stats?.totalVillages || 0 },
    { name: 'Workers', count: stats?.totalWorkers || 0 },
    { name: 'Public', count: stats?.totalPublic || 0 },
    { name: 'Assigned', count: stats?.assignedVillages || 0 },
  ];

  if (loading) return <LoadingSpinner fullScreen={true} />;

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 lg:p-10">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Admin Overview</h1>
              <p className="text-gray-500 mt-1 font-medium">Monitoring rural health accessibility in real-time.</p>
            </div>
            <button 
              onClick={fetchStats}
              className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors shadow-sm"
            >
              Refresh Data
            </button>
          </div>

          {error && <ErrorMessage message={error} onRetry={fetchStats} />}

          {stats && (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <StatCard 
                  label="Health Workers" 
                  value={stats.totalWorkers} 
                  icon={Users} 
                  colorClass="text-blue-600" 
                  bgColor="bg-blue-50" 
                  to="/admin/workers" 
                />
                <StatCard 
                  label="Total Villages" 
                  value={stats.totalVillages} 
                  icon={MapPin} 
                  colorClass="text-green-600" 
                  bgColor="bg-green-50" 
                  to="/admin/villages" 
                />
                <StatCard 
                  label="Unassigned" 
                  value={stats.unassignedVillages} 
                  icon={AlertCircle} 
                  colorClass="text-red-600" 
                  bgColor="bg-red-50" 
                  to="/admin/assign-worker" 
                />
                <StatCard 
                  label="Public Users" 
                  value={stats.totalPublic} 
                  icon={Activity} 
                  colorClass="text-purple-600" 
                  bgColor="bg-purple-50" 
                  to="#" 
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
                {/* Visual Analytics */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                      <TrendingUp size={20} className="text-blue-500" />
                      Infrastructure Distribution
                    </h2>
                  </div>
                  <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                        <Tooltip cursor={{fill: '#f9fafb'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                        <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={50} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Quick Actions Panel */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <h2 className="text-lg font-bold text-gray-800 mb-6">Quick Management</h2>
                  <div className="space-y-3">
                    <QuickActionLink to="/admin/workers" icon={<UserPlus size={18}/>} label="Register New Worker" color="hover:bg-blue-50 hover:text-blue-700" />
                    <QuickActionLink to="/admin/villages" icon={<PlusCircle size={18}/>} label="Add Rural Village" color="hover:bg-green-50 hover:text-green-700" />
                    <QuickActionLink to="/admin/diseases" icon={<BookmarkPlus size={18}/>} label="Configure Diseases" color="hover:bg-purple-50 hover:text-purple-700" />
                    <QuickActionLink to="/admin/assign-worker" icon={<MapPin size={18}/>} label="Deploy Workers" color="hover:bg-orange-50 hover:text-orange-700" />
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

// Sub-component for Quick Actions
const QuickActionLink = ({ to, icon, label, color }) => (
  <Link to={to} className={`flex items-center gap-3 p-4 rounded-xl border border-gray-50 bg-gray-50/50 font-medium text-gray-600 transition-all ${color}`}>
    {icon}
    <span className="text-sm">{label}</span>
  </Link>
);

export default AdminDashboard;