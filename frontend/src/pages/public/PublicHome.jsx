/* eslint-disable no-unused-vars */
import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar.jsx";
import LoadingSpinner from "../../components/LoadingSpinner.jsx";
import ErrorMessage from "../../components/ErrorMessage.jsx";
import useFetch from "../../hooks/useFetch.js";
import { getAllVillages, getStates, getDistrictsByState } from "../../services/admin.service.js";
import { getAllDiseases } from "../../services/admin.service.js";
import { getDashboardStats } from "../../services/admin.service.js";

const PublicHome = () => {
  const [searchState,    setSearchState]    = useState("");
  const [searchDistrict, setSearchDistrict] = useState("");

  const { data: stats,    loading: sLoading } = useFetch(getDashboardStats);
  const { data: villages, loading: vLoading, error: vError, refetch } = useFetch(
    () => getAllVillages({ state: searchState, district: searchDistrict }),
    [searchState, searchDistrict]
  );
  const { data: diseases } = useFetch(getAllDiseases);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* ── Hero Section ──────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white py-14 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-3">Rural Healthcare Disease Map</h1>
          <p className="text-blue-100 text-lg mb-8">
            Browse villages, view disease reports, and track healthcare camps near you
          </p>

          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-3 gap-4 max-w-xl mx-auto">
              {[
                { label: "Villages Covered",  value: stats.totalVillages  },
                { label: "Diseases Tracked",  value: diseases?.length ?? 0 },
                { label: "Active Workers",    value: stats.totalWorkers   },
              ].map((s) => (
                <div key={s.label} className="bg-white/10 rounded-xl p-4">
                  <p className="text-3xl font-bold">{s.value}</p>
                  <p className="text-blue-100 text-xs mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10">

        {/* ── Search / Filter ────────────────────────────────────────────── */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">🔍 Find Villages</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Search by State (e.g. Uttar Pradesh)"
              value={searchState}
              onChange={(e) => setSearchState(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Search by District (e.g. Prayagraj)"
              value={searchDistrict}
              onChange={(e) => setSearchDistrict(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* ── Villages Grid ──────────────────────────────────────────────── */}
        <h2 className="text-xl font-bold text-gray-800 mb-4">🏘️ Villages</h2>

        {vLoading && <LoadingSpinner fullScreen={false} />}
        {vError   && <ErrorMessage message={vError} onRetry={refetch} />}

        {villages && villages.length === 0 && (
          <div className="bg-white rounded-xl p-10 text-center text-gray-500 text-sm">
            No villages found
          </div>
        )}

        {villages && villages.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
            {villages.map((v) => (
              <Link
                key={v._id}
                to={`/village/${v._id}`}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-gray-800">{v.villageName}</h3>
                  {v.assignedHealthWorker ? (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                      Active
                    </span>
                  ) : (
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">
                      No Worker
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500">
                  {v.subdistrict}, {v.district}
                </p>
                <p className="text-sm text-gray-500">{v.state}</p>

                {v.population > 0 && (
                  <p className="text-xs text-gray-400 mt-2">
                    👥 Population: {v.population.toLocaleString("en-IN")}
                  </p>
                )}

                {v.assignedHealthWorker && (
                  <p className="text-xs text-blue-600 mt-2 font-medium">
                    👨‍⚕️ {v.assignedHealthWorker.name}
                  </p>
                )}

                {v.activeDiseases?.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {v.activeDiseases.slice(0, 3).map((d) => (
                      <span key={d._id} className="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-full">
                        {d.name}
                      </span>
                    ))}
                  </div>
                )}

                <p className="text-xs text-blue-600 mt-3 font-medium hover:underline">
                  View Details →
                </p>
              </Link>
            ))}
          </div>
        )}

        {/* ── Disease Info Section ───────────────────────────────────────── */}
        {diseases && diseases.length > 0 && (
          <>
            <h2 className="text-xl font-bold text-gray-800 mb-4">🦠 Tracked Diseases</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {diseases.map((d) => (
                <div key={d._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-semibold text-gray-800 text-sm">{d.name}</h3>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full
                      ${d.severity === "Critical" ? "bg-red-100 text-red-700" :
                        d.severity === "High"     ? "bg-orange-100 text-orange-700" :
                        d.severity === "Medium"   ? "bg-yellow-100 text-yellow-700" :
                                                    "bg-green-100 text-green-700"}`}>
                      {d.severity}
                    </span>
                  </div>
                  <p className="text-xs text-blue-600 mb-2">{d.category}</p>
                  {d.symptoms?.length > 0 && (
                    <p className="text-xs text-gray-500">
                      {d.symptoms.slice(0, 2).join(", ")}
                      {d.symptoms.length > 2 && "..."}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

      </div>
    </div>
  );
};

export default PublicHome;