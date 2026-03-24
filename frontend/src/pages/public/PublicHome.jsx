import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

const card = {
  background: "#0f172a",
  border: "1px solid #1e293b",
  borderRadius: 12,
  padding: 20,
  cursor: "pointer",
  transition: "border-color 0.2s, transform 0.15s",
};

const badge = (color, text) => (
  <span style={{
    padding: "3px 10px", borderRadius: 20,
    background: color + "22", color: color,
    fontSize: 11, fontWeight: 600,
  }}>{text}</span>
);

const PublicHome = () => {
  const [villages, setVillages] = useState([]);
  const [diseases, setDiseases] = useState([]);
  const [search, setSearch]     = useState("");
  const [loading, setLoading]   = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      api.get("/villages"),
      api.get("/diseases"),
    ]).then(([vRes, dRes]) => {
      setVillages(vRes.data.data?.villages || []);
      setDiseases(dRes.data.data?.diseases || []);
    }).finally(() => setLoading(false));
  }, []);

  const filtered = villages.filter((v) =>
    `${v.villageName} ${v.district} ${v.state}`.toLowerCase().includes(search.toLowerCase())
  );

  const severityColor = { Low: "#10b981", Medium: "#f59e0b", High: "#f97316", Critical: "#ef4444" };

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh", color: "#64748b" }}>
      Loading...
    </div>
  );

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 20px", color: "#e2e8f0" }}>

      {/* Hero */}
      <div style={{
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
        border: "1px solid #334155",
        borderRadius: 16,
        padding: "40px 36px",
        marginBottom: 36,
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: -40, right: -40,
          width: 200, height: 200, borderRadius: "50%",
          background: "#3b82f620", filter: "blur(60px)",
        }} />
        <h1 style={{ fontSize: 28, fontWeight: 700, margin: "0 0 8px", color: "#f1f5f9" }}>
          🏥 Rural Healthcare Disease Map
        </h1>
        <p style={{ color: "#64748b", margin: "0 0 24px", fontSize: 15 }}>
          Browse villages, view disease reports, and track healthcare camps near you
        </p>

        {/* Stats row */}
        <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
          {[
            { label: "Villages Covered", value: villages.length, color: "#3b82f6" },
            { label: "Diseases Tracked", value: diseases.length, color: "#f59e0b" },
            { label: "Active Workers",   value: villages.filter((v) => v.assignedHealthWorker).length, color: "#10b981" },
          ].map(({ label, value, color }) => (
            <div key={label} style={{
              background: "#0f172a", border: "1px solid #1e293b",
              borderRadius: 10, padding: "14px 22px", minWidth: 130,
            }}>
              <div style={{ fontSize: 24, fontWeight: 700, color }}>{value}</div>
              <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Disease Quick Info */}
      {diseases.length > 0 && (
        <div style={{ marginBottom: 36 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: "#94a3b8", marginBottom: 14 }}>
            🦠 Diseases Being Tracked
          </h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {diseases.map((d) => (
              <div key={d._id} style={{
                background: "#0f172a", border: "1px solid #1e293b",
                borderRadius: 8, padding: "8px 14px",
                display: "flex", alignItems: "center", gap: 8,
              }}>
                <span style={{ fontSize: 13, color: "#e2e8f0" }}>{d.name}</span>
                {badge(severityColor[d.severity] || "#64748b", d.severity || "?")}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search */}
      <div style={{ marginBottom: 20 }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="🔍 Search village, district or state..."
          style={{
            width: "100%", maxWidth: 460,
            padding: "10px 16px",
            background: "#0f172a", border: "1px solid #334155",
            borderRadius: 8, color: "#e2e8f0", fontSize: 14, outline: "none",
            boxSizing: "border-box",
          }}
        />
      </div>

      {/* Village Grid */}
      <h2 style={{ fontSize: 16, fontWeight: 600, color: "#94a3b8", marginBottom: 16 }}>
        🏘️ Villages ({filtered.length})
      </h2>

      {filtered.length === 0 ? (
        <div style={{
          textAlign: "center", padding: "60px 20px",
          color: "#475569", border: "1px dashed #1e293b", borderRadius: 12
        }}>
          No villages found
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
          {filtered.map((v) => (
            <div
              key={v._id}
              style={card}
              onClick={() => navigate(`/village/${v._id}`)}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#3b82f6";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#1e293b";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: "#f1f5f9" }}>
                    {v.villageName}
                  </h3>
                  <p style={{ margin: "4px 0 0", fontSize: 13, color: "#64748b" }}>
                    {v.subdistrict}, {v.district}
                  </p>
                </div>
                {badge(v.assignedHealthWorker ? "#10b981" : "#64748b",
                       v.assignedHealthWorker ? "Worker Assigned" : "Unassigned")}
              </div>

              <div style={{ fontSize: 13, color: "#94a3b8" }}>
                📍 {v.state}
                {v.population ? <span style={{ marginLeft: 12 }}>👥 {v.population.toLocaleString()}</span> : null}
              </div>

              {v.activeDiseases?.length > 0 && (
                <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {v.activeDiseases.map((d, i) => (
                    <span key={i} style={{
                      padding: "3px 10px", borderRadius: 20,
                      background: "#f97316" + "22", color: "#f97316",
                      fontSize: 11,
                    }}>{typeof d === "string" ? d : d.name}</span>
                  ))}
                </div>
              )}

              <div style={{
                marginTop: 14, paddingTop: 12,
                borderTop: "1px solid #1e293b",
                fontSize: 12, color: "#3b82f6", fontWeight: 500,
              }}>
                View Details →
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PublicHome;