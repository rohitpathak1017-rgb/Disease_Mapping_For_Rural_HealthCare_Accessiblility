import { useState, useEffect } from "react";
import api from "../../services/api";

const inputStyle = {
  width: "100%",
  padding: "10px 14px",
  background: "#0f172a",
  border: "1px solid #334155",
  borderRadius: 8,
  color: "#e2e8f0",
  fontSize: 14,
  outline: "none",
  boxSizing: "border-box",
};

const labelStyle = {
  display: "block",
  marginBottom: 6,
  fontSize: 13,
  fontWeight: 500,
  color: "#94a3b8",
};

const CampForm = ({ onSubmit, initialData = {}, villageId = null, loading = false }) => {
  const [diseases, setDiseases] = useState([]);
  const [form, setForm] = useState({
    campName:          initialData.campName          || "",
    campDate:          initialData.campDate          ? initialData.campDate.slice(0, 10) : "",
    startTime:         initialData.startTime         || "",
    endTime:           initialData.endTime           || "",
    status:            initialData.status            || "Scheduled",
    patientsAttended:  initialData.patientsAttended  || "",
    servicesInput:     (initialData.servicesOffered  || []).join(", "),
    targetedDiseases:  (initialData.targetedDiseases || []).map((d) => d._id || d) || [],
    notes:             initialData.notes             || "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    api.get("/diseases").then((res) => setDiseases(res.data.data?.diseases || [])).catch(() => {});
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    setErrors((p) => ({ ...p, [name]: undefined }));
  };

  const toggleDisease = (id) => {
    setForm((p) => ({
      ...p,
      targetedDiseases: p.targetedDiseases.includes(id)
        ? p.targetedDiseases.filter((d) => d !== id)
        : [...p.targetedDiseases, id],
    }));
  };

  const validate = () => {
    const e = {};
    if (!form.campName.trim()) e.campName = "Camp name is required";
    if (!form.campDate)        e.campDate = "Date is required";
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length) { setErrors(e2); return; }

    const payload = {
      campName:         form.campName.trim(),
      campDate:         form.campDate,
      startTime:        form.startTime,
      endTime:          form.endTime,
      status:           form.status,
      patientsAttended: form.patientsAttended ? Number(form.patientsAttended) : 0,
      servicesOffered:  form.servicesInput.split(",").map((s) => s.trim()).filter(Boolean),
      targetedDiseases: form.targetedDiseases,
      notes:            form.notes.trim(),
      villageId:        villageId || initialData.village?._id,
    };
    onSubmit(payload);
  };

  const chip = (id, name) => {
    const selected = form.targetedDiseases.includes(id);
    return (
      <button
        key={id}
        type="button"
        onClick={() => toggleDisease(id)}
        style={{
          padding: "5px 12px",
          borderRadius: 20,
          border: `1px solid ${selected ? "#3b82f6" : "#334155"}`,
          background: selected ? "#1d4ed8" : "transparent",
          color: selected ? "#fff" : "#94a3b8",
          fontSize: 12,
          cursor: "pointer",
          transition: "all 0.15s",
        }}
      >
        {name}
      </button>
    );
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Camp Name */}
      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>Camp Name *</label>
        <input
          name="campName" value={form.campName} onChange={handleChange}
          placeholder="e.g. Malaria Camp - Lalapur"
          style={{ ...inputStyle, borderColor: errors.campName ? "#ef4444" : "#334155" }}
        />
        {errors.campName && <p style={{ color: "#ef4444", fontSize: 12, marginTop: 4 }}>{errors.campName}</p>}
      </div>

      {/* Date + Status */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
        <div>
          <label style={labelStyle}>Camp Date *</label>
          <input
            type="date" name="campDate" value={form.campDate} onChange={handleChange}
            style={{ ...inputStyle, borderColor: errors.campDate ? "#ef4444" : "#334155", colorScheme: "dark" }}
          />
          {errors.campDate && <p style={{ color: "#ef4444", fontSize: 12, marginTop: 4 }}>{errors.campDate}</p>}
        </div>
        <div>
          <label style={labelStyle}>Status</label>
          <select name="status" value={form.status} onChange={handleChange} style={inputStyle}>
            <option value="Scheduled">Scheduled</option>
            <option value="Ongoing">Ongoing</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Time + Patients */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 16 }}>
        <div>
          <label style={labelStyle}>Start Time</label>
          <input name="startTime" value={form.startTime} onChange={handleChange}
            placeholder="09:00 AM" style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>End Time</label>
          <input name="endTime" value={form.endTime} onChange={handleChange}
            placeholder="05:00 PM" style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Patients Attended</label>
          <input type="number" name="patientsAttended" value={form.patientsAttended}
            onChange={handleChange} placeholder="0" style={inputStyle} />
        </div>
      </div>

      {/* Services */}
      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>Services Offered <span style={{ color: "#475569" }}>(comma separated)</span></label>
        <input
          name="servicesInput" value={form.servicesInput} onChange={handleChange}
          placeholder="e.g. Blood Test, Medicine Distribution, Consultation"
          style={inputStyle}
        />
      </div>

      {/* Targeted Diseases */}
      {diseases.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Targeted Diseases</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 4 }}>
            {diseases.map((d) => chip(d._id, d.name))}
          </div>
        </div>
      )}

      {/* Notes */}
      <div style={{ marginBottom: 20 }}>
        <label style={labelStyle}>Notes</label>
        <textarea
          name="notes" value={form.notes} onChange={handleChange}
          placeholder="Any additional observations or notes..."
          rows={3}
          style={{ ...inputStyle, resize: "vertical", lineHeight: 1.5 }}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        style={{
          width: "100%", padding: "11px",
          background: loading ? "#1e293b" : "#3b82f6",
          color: loading ? "#64748b" : "#fff",
          border: "none", borderRadius: 8,
          fontSize: 14, fontWeight: 600,
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "Saving..." : initialData._id ? "Update Camp" : "Create Camp"}
      </button>
    </form>
  );
};

export default CampForm;