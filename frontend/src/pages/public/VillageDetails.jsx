import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import DiseaseBarChart from "../../components/charts/DiseaseBarChart";

const section = {
  background: "#0f172a",
  border: "1px solid #1e293b",
  borderRadius: 12,
  padding: 24,
  marginBottom: 20,
};

const statusColors = {
  Scheduled: "#3b82f6",
  Ongoing:   "#10b981",
  Completed: "#64748b",
  Cancelled: "#ef4444",
};

const VillageDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [village, setVillage]   = useState(null);
  const [camps, setCamps]       = useState([]);
  const [reports, setReports]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");

  useEffect(() => {
    Promise.all([
      api.get(`/villages/${id}`),
      api.get(`/camps/village/${id}`),
      api.get(`/reports?villageId=${id}`),
    ]).then(([vRes, cRes, rRes]) => {
      setVillage(vRes.data.data);
      setCamps(cRes.data.data?.camps || []);
      setReports(rRes.data.data?.reports || []);
    }).catch(() => setError("Village not found"))
      .finally(() => setLoading(false));
  }, [id]);

  // Build chart data from reports
  const chartData = (() => {
    const map = {};
    reports.forEach((r) => {
      r.diseases?.forEach(({ disease, affectedCount, recoveredCount, deathCount }) => {
        const name = disease?.name || "Unknown";
        if (!map[name]) map[name] = { disease: name, affected: 0, recovered: 0, deaths: 0 };
        map[name].affected  += affectedCount  || 0;
        map[name].recovered += recoveredCount || 0;
        map[name].deaths    += deathCount     || 0;
      });
    });
    return Object.values(map);
  })();

  if (loading) return <div style={{ textAlign: "center", padding: 80, color: "#64748b" }}>Loading...</div>;
  if (error)   return <div style={{ textAlign: "center", padding: 80, color: "#ef4444" }}>{error}</div>;

  const worker = village?.assignedHealthWorker;

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 20px", color: "#e2e8f0" }}>

      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: 14, marginBottom: 20 }}
      >
        ← Back
      </button>

      {/* Village Header */}
      <div style={{ ...section, borderColor: "#334155" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ margin: "0 0 6px", fontSize: 24, fontWeight: 700 }}>{village?.villageName}</h1>
            <p style={{ margin: 0, color: "#64748b", fontSize: 14 }}>
              {village?.subdistrict} · {village?.district} · {village?.state}
            </p>
            {village?.population && (
              <p style={{ margin: "6px 0 0", color: "#94a3b8", fontSize: 13 }}>
                👥 Population: {village.population.toLocaleString()}
              </p>
            )}
          </div>

          {/* Assigned Worker Card */}
          {worker && (
            <div style={{
              background: "#1e293b", borderRadius: 10, padding: "14px 18px", minWidth: 200,
            }}>
              <div style={{ fontSize: 11, color: "#64748b", marginBottom: 4 }}>ASSIGNED HEALTH WORKER</div>
              <div style={{ fontWeight: 600, fontSize: 15 }}>{worker.name}</div>
              {worker.qualification && (
                <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>{worker.qualification}</div>
              )}
              <button
                onClick={() => navigate(`/feedback?workerId=${worker._id}&villageId=${id}`)}
                style={{
                  marginTop: 10, padding: "6px 14px",
                  background: "#1d4ed8", border: "none", borderRadius: 6,
                  color: "#fff", fontSize: 12, cursor: "pointer",
                }}
              >
                Give Feedback
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Disease Chart */}
      {chartData.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <DiseaseBarChart data={chartData} title="Disease Statistics for this Village" />
        </div>
      )}

      {/* Camps */}
      <div style={section}>
        <h2 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 600, color: "#94a3b8" }}>
          🏕️ Healthcare Camps ({camps.length})
        </h2>
        {camps.length === 0 ? (
          <p style={{ color: "#475569", fontSize: 14 }}>No camps have been held yet.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {camps.map((camp) => (
              <div key={camp._id} style={{
                background: "#1e293b", borderRadius: 10, padding: "14px 18px",
                display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8,
              }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{camp.campName}</div>
                  <div style={{ fontSize: 12, color: "#64748b", marginTop: 3 }}>
                    📅 {new Date(camp.campDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    {camp.startTime && <span> · ⏰ {camp.startTime} – {camp.endTime}</span>}
                  </div>
                  {camp.servicesOffered?.length > 0 && (
                    <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {camp.servicesOffered.map((s) => (
                        <span key={s} style={{
                          padding: "2px 10px", borderRadius: 20,
                          background: "#0f172a", color: "#94a3b8", fontSize: 11, border: "1px solid #334155"
                        }}>{s}</span>
                      ))}
                    </div>
                  )}
                  {camp.patientsAttended > 0 && (
                    <div style={{ marginTop: 6, fontSize: 12, color: "#10b981" }}>
                      ✅ {camp.patientsAttended} patients attended
                    </div>
                  )}
                </div>
                <span style={{
                  padding: "4px 12px", borderRadius: 20, fontSize: 11, fontWeight: 600,
                  background: (statusColors[camp.status] || "#64748b") + "22",
                  color: statusColors[camp.status] || "#64748b",
                }}>
                  {camp.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Reports */}
      <div style={section}>
        <h2 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 600, color: "#94a3b8" }}>
          📋 Disease Reports ({reports.length})
        </h2>
        {reports.length === 0 ? (
          <p style={{ color: "#475569", fontSize: 14 }}>No disease reports submitted yet.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {reports.slice(0, 5).map((r) => (
              <div key={r._id} style={{ background: "#1e293b", borderRadius: 10, padding: "14px 18px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontWeight: 600, fontSize: 13 }}>
                    {new Date(0, r.reportMonth - 1).toLocaleString("default", { month: "long" })} {r.reportYear}
                  </span>
                  {r.isReviewed && (
                    <span style={{ fontSize: 11, color: "#10b981" }}>✔ Reviewed</span>
                  )}
                </div>
                {r.diseases?.map(({ disease, affectedCount, recoveredCount, deathCount }, i) => (
                  <div key={i} style={{ display: "flex", gap: 16, fontSize: 12, color: "#94a3b8", marginTop: 4 }}>
                    <span style={{ color: "#e2e8f0", fontWeight: 500 }}>{disease?.name}</span>
                    <span>😷 {affectedCount} affected</span>
                    <span style={{ color: "#10b981" }}>✅ {recoveredCount} recovered</span>
                    {deathCount > 0 && <span style={{ color: "#ef4444" }}>💀 {deathCount} deaths</span>}
                  </div>
                ))}
                {r.generalObservations && (
                  <p style={{ margin: "8px 0 0", fontSize: 12, color: "#64748b", fontStyle: "italic" }}>
                    "{r.generalObservations}"
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Feedback CTA */}
      {worker && (
        <div style={{
          textAlign: "center", padding: "24px",
          background: "#0f172a", border: "1px dashed #334155", borderRadius: 12,
        }}>
          <p style={{ color: "#64748b", margin: "0 0 14px", fontSize: 14 }}>
            Did you receive healthcare services in this village?
          </p>
          <button
            onClick={() => navigate(`/feedback?workerId=${worker._id}&villageId=${id}`)}
            style={{
              padding: "10px 28px",
              background: "#3b82f6", color: "#fff",
              border: "none", borderRadius: 8,
              fontSize: 14, fontWeight: 600, cursor: "pointer",
            }}
          >
            Leave Feedback for {worker.name}
          </button>
        </div>
      )}
    </div>
  );
};

export default VillageDetails;