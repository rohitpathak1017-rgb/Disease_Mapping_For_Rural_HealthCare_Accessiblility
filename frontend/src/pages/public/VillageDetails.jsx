import { useParams, Link } from "react-router-dom";
import Navbar from "../../components/Navbar.jsx";
import LoadingSpinner from "../../components/LoadingSpinner.jsx";
import ErrorMessage from "../../components/ErrorMessage.jsx";
import useFetch from "../../hooks/useFetch.js";
import useAuth from "../../hooks/useAuth.js";
import { getVillageById } from "../../services/admin.service.js";
import { getCampsByVillage } from "../../services/camp.service.js";
import { getVillageChartData } from "../../services/report.service.js";
import { formatDate } from "../../utils/helpers.js";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from "recharts";

const COLORS = ["#3b82f6","#10b981","#f59e0b","#ef4444","#8b5cf6"];

const VillageDetails = () => {
  const { id } = useParams();
  const { isLoggedIn } = useAuth();

  const { data: village, loading: vLoad, error: vErr } = useFetch(() => getVillageById(id), [id]);
  const { data: camps,   loading: cLoad }              = useFetch(() => getCampsByVillage(id), [id]);
  const { data: chartData }                            = useFetch(
    () => getVillageChartData(id, new Date().getFullYear()), [id]
  );

  // Bar chart data
  const barData = () => {
    if (!chartData?.length) return [];
    const map = {};
    chartData.forEach((d) => {
      const key = `${d.month}/${d.year}`;
      if (!map[key]) map[key] = { month: key };
      map[key][d.diseaseName] = (map[key][d.diseaseName] || 0) + d.totalAffected;
    });
    return Object.values(map);
  };
  const diseaseNames = [...new Set(chartData?.map((d) => d.diseaseName) || [])];

  if (vLoad) return <><Navbar /><LoadingSpinner fullScreen={false} /></>;
  if (vErr)  return <><Navbar /><ErrorMessage message={vErr} /></>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* Back */}
        <Link to="/" className="text-sm text-blue-600 hover:underline mb-4 block">
          ← Back to Villages
        </Link>

        {/* Village Header */}
        {village && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">{village.villageName}</h1>
                <p className="text-gray-500 text-sm mt-1">
                  {village.subdistrict}, {village.district}, {village.state}
                </p>
              </div>
              {village.assignedHealthWorker ? (
                <span className="bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">
                  Worker Assigned
                </span>
              ) : (
                <span className="bg-gray-100 text-gray-500 text-xs font-semibold px-3 py-1 rounded-full">
                  No Worker
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-5">
              {village.population > 0 && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Population</p>
                  <p className="text-lg font-bold text-gray-800">
                    {village.population.toLocaleString("en-IN")}
                  </p>
                </div>
              )}
              {village.assignedHealthWorker && (
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Health Worker</p>
                  <p className="text-sm font-bold text-blue-700">
                    {village.assignedHealthWorker.name}
                  </p>
                  <p className="text-xs text-gray-400">
                    {village.assignedHealthWorker.qualification}
                  </p>
                </div>
              )}
              {village.activeDiseases?.length > 0 && (
                <div className="bg-red-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Active Diseases</p>
                  <p className="text-lg font-bold text-red-600">
                    {village.activeDiseases.length}
                  </p>
                </div>
              )}
            </div>

            {/* Active Diseases tags */}
            {village.activeDiseases?.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {village.activeDiseases.map((d) => (
                  <span key={d._id} className="text-xs bg-red-50 text-red-600 border border-red-100 px-3 py-1 rounded-full">
                    🦠 {d.name} — {d.category}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Disease Chart */}
        {chartData?.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              📈 Disease Trend — {new Date().getFullYear()}
            </h2>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={barData()} margin={{ top:5, right:20, left:0, bottom:5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize:12 }} />
                <YAxis tick={{ fontSize:12 }} />
                <Tooltip />
                <Legend />
                {diseaseNames.map((name, i) => (
                  <Bar key={name} dataKey={name} fill={COLORS[i % COLORS.length]} radius={[4,4,0,0]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Camps */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">🏕️ Health Camps</h2>
          {cLoad && <LoadingSpinner fullScreen={false} size="sm" />}
          {!cLoad && camps?.length === 0 && (
            <p className="text-gray-500 text-sm text-center py-4">No camps organized yet</p>
          )}
          {camps?.length > 0 && (
            <div className="space-y-3">
              {camps.map((c) => (
                <div key={c._id} className="border border-gray-100 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-800">{c.campName}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        📅 {formatDate(c.campDate)}
                        {c.startTime && ` · ${c.startTime} - ${c.endTime}`}
                      </p>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full
                      ${c.status === "Completed" ? "bg-gray-100 text-gray-600" :
                        c.status === "Ongoing"   ? "bg-green-100 text-green-700" :
                                                   "bg-blue-100 text-blue-700"}`}>
                      {c.status}
                    </span>
                  </div>
                  {c.servicesOffered?.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {c.servicesOffered.map((s, i) => (
                        <span key={i} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                  {c.healthWorker && (
                    <p className="text-xs text-gray-400 mt-2">
                      👨‍⚕️ {c.healthWorker.name} · {c.healthWorker.phone}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Feedback Button */}
        {village?.assignedHealthWorker && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
            <p className="text-gray-600 text-sm mb-3">
              Have feedback for the health worker?
            </p>
            {isLoggedIn ? (
              <Link
                to={`/feedback/${village.assignedHealthWorker._id}`}
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-6 py-2.5 rounded-lg transition-colors"
              >
                Give Feedback
              </Link>
            ) : (
              <Link
                to="/login"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-6 py-2.5 rounded-lg transition-colors"
              >
                Login to Give Feedback
              </Link>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default VillageDetails;