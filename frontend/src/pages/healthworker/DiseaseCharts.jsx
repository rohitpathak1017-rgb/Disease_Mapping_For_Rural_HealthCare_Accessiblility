import { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer,
} from "recharts";
import Navbar from "../../components/Navbar.jsx";
import Sidebar from "../../components/Sidebar.jsx";
import LoadingSpinner from "../../components/LoadingSpinner.jsx";
import ErrorMessage from "../../components/ErrorMessage.jsx";
import useFetch from "../../hooks/useFetch.js";
import useAuth from "../../hooks/useAuth.js";
import { getVillageChartData } from "../../services/report.service.js";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

const currentYear = new Date().getFullYear();

const DiseaseCharts = () => {
  const { user } = useAuth();
  const villageId = user?.assignedVillage?._id || user?.assignedVillage;

  const [year, setYear] = useState(currentYear);

  const { data, loading, error, refetch } = useFetch(
    () => getVillageChartData(villageId, year),
    [villageId, year]
  );

  // ── Process data for Bar Chart (monthly affected count per disease) ──────────
  const barData = () => {
    if (!data?.length) return [];
    const monthMap = {};
    data.forEach((d) => {
      const key = `${d.month}/${d.year}`;
      if (!monthMap[key]) monthMap[key] = { month: key };
      monthMap[key][d.diseaseName] = (monthMap[key][d.diseaseName] || 0) + d.totalAffected;
    });
    return Object.values(monthMap).sort((a, b) => {
      const [am, ay] = a.month.split("/").map(Number);
      const [bm, by] = b.month.split("/").map(Number);
      return ay !== by ? ay - by : am - bm;
    });
  };

  // ── Process data for Pie Chart (total affected per disease) ─────────────────
  const pieData = () => {
    if (!data?.length) return [];
    const diseaseMap = {};
    data.forEach((d) => {
      diseaseMap[d.diseaseName] = (diseaseMap[d.diseaseName] || 0) + d.totalAffected;
    });
    return Object.entries(diseaseMap).map(([name, value]) => ({ name, value }));
  };

  // ── Unique disease names for bar chart keys ──────────────────────────────────
  const diseaseNames = [...new Set(data?.map((d) => d.diseaseName) || [])];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">

          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Disease Charts</h1>
              <p className="text-gray-500 text-sm mt-1">Visual disease trends for your village</p>
            </div>
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {[currentYear, currentYear - 1, currentYear - 2].map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          {loading && <LoadingSpinner fullScreen={false} />}
          {error   && <ErrorMessage message={error} onRetry={refetch} />}

          {!loading && data?.length === 0 && (
            <div className="bg-white rounded-xl p-10 text-center text-gray-500 text-sm">
              No report data found for {year}. Submit disease reports to see charts.
            </div>
          )}

          {data?.length > 0 && (
            <div className="space-y-6">

              {/* Bar Chart — Monthly Trend */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  Monthly Disease Trend — {year}
                </h2>
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={barData()} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend />
                    {diseaseNames.map((name, i) => (
                      <Bar key={name} dataKey={name} fill={COLORS[i % COLORS.length]} radius={[4, 4, 0, 0]} />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Pie Chart — Disease Distribution */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  Disease Distribution — {year}
                </h2>
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={pieData()}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {pieData().map((_, index) => (
                          <Cell key={index} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Summary Table */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h2 className="text-lg font-semibold text-gray-800">Summary</h2>
                </div>
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      {["Month", "Disease", "Affected", "Recovered", "Deaths"].map((h) => (
                        <th key={h} className="text-left px-4 py-3 text-gray-600 font-medium">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {data.map((d, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-600">{d.month}/{d.year}</td>
                        <td className="px-4 py-3 font-medium text-gray-800">{d.diseaseName}</td>
                        <td className="px-4 py-3 text-red-600 font-semibold">{d.totalAffected}</td>
                        <td className="px-4 py-3 text-green-600 font-semibold">{d.totalRecovered}</td>
                        <td className="px-4 py-3 text-gray-700">{d.totalDeaths}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
          )}

        </main>
      </div>
    </div>
  );
};

export default DiseaseCharts;