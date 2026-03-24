import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import FeedbackForm from "../../components/forms/FeedbackForm";

const GiveFeedback = () => {
  const [params]    = useSearchParams();
  const navigate    = useNavigate();
  const workerId    = params.get("workerId");
  const villageId   = params.get("villageId");
  const campId      = params.get("campId") || null;

  const [worker, setWorker]   = useState(null);
  const [village, setVillage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError]     = useState("");
  const [initLoading, setInitLoading] = useState(true);

  useEffect(() => {
    if (!workerId || !villageId) {
      setError("Invalid feedback link — missing worker or village info.");
      setInitLoading(false);
      return;
    }
    Promise.all([
      api.get(`/villages/${villageId}`),
    ]).then(([vRes]) => {
      setVillage(vRes.data.data);
      const w = vRes.data.data?.assignedHealthWorker;
      if (w) setWorker(w);
    }).catch(() => setError("Could not load village info."))
      .finally(() => setInitLoading(false));
  }, [workerId, villageId]);

  const handleSubmit = async (payload) => {
    setLoading(true);
    setError("");
    try {
      await api.post("/feedback", payload);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit feedback. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (initLoading) return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh", color: "#64748b" }}>
      Loading...
    </div>
  );

  if (error && !worker) return (
    <div style={{ maxWidth: 500, margin: "80px auto", textAlign: "center", color: "#e2e8f0", padding: "0 20px" }}>
      <div style={{ fontSize: 40, marginBottom: 16 }}>⚠️</div>
      <p style={{ color: "#ef4444" }}>{error}</p>
      <button onClick={() => navigate("/")} style={{
        marginTop: 12, padding: "10px 24px",
        background: "#3b82f6", color: "#fff",
        border: "none", borderRadius: 8, cursor: "pointer", fontSize: 14
      }}>
        Go to Home
      </button>
    </div>
  );

  if (success) return (
    <div style={{ maxWidth: 500, margin: "80px auto", textAlign: "center", color: "#e2e8f0", padding: "0 20px" }}>
      <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
      <h2 style={{ margin: "0 0 8px", fontWeight: 700 }}>Thank You!</h2>
      <p style={{ color: "#64748b", marginBottom: 24 }}>
        Your feedback has been submitted successfully. It helps us improve healthcare services.
      </p>
      <button onClick={() => navigate(`/village/${villageId}`)} style={{
        padding: "10px 24px",
        background: "#3b82f6", color: "#fff",
        border: "none", borderRadius: 8, cursor: "pointer", fontSize: 14, fontWeight: 600,
      }}>
        Back to Village
      </button>
    </div>
  );

  return (
    <div style={{ maxWidth: 580, margin: "0 auto", padding: "32px 20px", color: "#e2e8f0" }}>

      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: 14, marginBottom: 20 }}
      >
        ← Back
      </button>

      {/* Header */}
      <div style={{
        background: "#0f172a", border: "1px solid #1e293b",
        borderRadius: 12, padding: 24, marginBottom: 24
      }}>
        <h1 style={{ margin: "0 0 4px", fontSize: 20, fontWeight: 700 }}>Give Feedback</h1>
        {village && (
          <p style={{ margin: 0, color: "#64748b", fontSize: 13 }}>
            {village.villageName} · {village.district}
          </p>
        )}
        {worker && (
          <div style={{
            marginTop: 14, padding: "10px 14px",
            background: "#1e293b", borderRadius: 8,
            display: "flex", alignItems: "center", gap: 10
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: "50%",
              background: "#1d4ed8", display: "flex", alignItems: "center",
              justifyContent: "center", fontSize: 16, fontWeight: 700, color: "#fff", flexShrink: 0
            }}>
              {worker.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{worker.name}</div>
              {worker.qualification && (
                <div style={{ fontSize: 12, color: "#64748b" }}>{worker.qualification}</div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Form */}
      <div style={{
        background: "#0f172a", border: "1px solid #1e293b",
        borderRadius: 12, padding: 24,
      }}>
        {error && (
          <div style={{
            background: "#7f1d1d22", border: "1px solid #ef4444",
            borderRadius: 8, padding: "10px 14px",
            color: "#ef4444", fontSize: 13, marginBottom: 16
          }}>
            {error}
          </div>
        )}
        <FeedbackForm
          onSubmit={handleSubmit}
          healthWorkerId={workerId}
          villageId={villageId}
          relatedCamp={campId}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default GiveFeedback;