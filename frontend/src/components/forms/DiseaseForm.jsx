import { useState } from "react";

const CATEGORIES = [
  "Communicable", "Vector-Borne", "Water-Borne",
  "Air-Borne", "Non-Communicable", "Nutritional", "Other",
];
const SEVERITIES = ["Low", "Medium", "High", "Critical"];

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

const DiseaseForm = ({ onSubmit, initialData = {}, loading = false }) => {
  const [form, setForm] = useState({
    name:            initialData.name        || "",
    category:        initialData.category    || "",
    severity:        initialData.severity    || "",
    description:     initialData.description || "",
    symptomsInput:   (initialData.symptoms   || []).join(", "),
    preventionInput: (initialData.preventionTips || []).join(", "),
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    setErrors((p) => ({ ...p, [name]: undefined }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim())     e.name     = "Disease name is required";
    if (!form.category)        e.category = "Category is required";
    if (!form.severity)        e.severity = "Severity is required";
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length) { setErrors(e2); return; }

    const payload = {
      name:            form.name.trim(),
      category:        form.category,
      severity:        form.severity,
      description:     form.description.trim(),
      symptoms:        form.symptomsInput.split(",").map((s) => s.trim()).filter(Boolean),
      preventionTips:  form.preventionInput.split(",").map((s) => s.trim()).filter(Boolean),
    };
    onSubmit(payload);
  };

  const selectStyle = {
    ...inputStyle,
    appearance: "none",
    cursor: "pointer",
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Name */}
      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>Disease Name *</label>
        <input
          name="name" value={form.name} onChange={handleChange}
          placeholder="e.g. Malaria"
          style={{ ...inputStyle, borderColor: errors.name ? "#ef4444" : "#334155" }}
        />
        {errors.name && <p style={{ color: "#ef4444", fontSize: 12, marginTop: 4 }}>{errors.name}</p>}
      </div>

      {/* Category + Severity row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
        <div>
          <label style={labelStyle}>Category *</label>
          <select
            name="category" value={form.category} onChange={handleChange}
            style={{ ...selectStyle, borderColor: errors.category ? "#ef4444" : "#334155" }}
          >
            <option value="">Select category</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          {errors.category && <p style={{ color: "#ef4444", fontSize: 12, marginTop: 4 }}>{errors.category}</p>}
        </div>
        <div>
          <label style={labelStyle}>Severity *</label>
          <select
            name="severity" value={form.severity} onChange={handleChange}
            style={{ ...selectStyle, borderColor: errors.severity ? "#ef4444" : "#334155" }}
          >
            <option value="">Select severity</option>
            {SEVERITIES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          {errors.severity && <p style={{ color: "#ef4444", fontSize: 12, marginTop: 4 }}>{errors.severity}</p>}
        </div>
      </div>

      {/* Description */}
      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>Description</label>
        <textarea
          name="description" value={form.description} onChange={handleChange}
          placeholder="Brief description of the disease..."
          rows={3}
          style={{ ...inputStyle, resize: "vertical", lineHeight: 1.5 }}
        />
      </div>

      {/* Symptoms */}
      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>Symptoms <span style={{ color: "#475569" }}>(comma separated)</span></label>
        <input
          name="symptomsInput" value={form.symptomsInput} onChange={handleChange}
          placeholder="e.g. Fever, Chills, Headache"
          style={inputStyle}
        />
      </div>

      {/* Prevention */}
      <div style={{ marginBottom: 20 }}>
        <label style={labelStyle}>Prevention Tips <span style={{ color: "#475569" }}>(comma separated)</span></label>
        <input
          name="preventionInput" value={form.preventionInput} onChange={handleChange}
          placeholder="e.g. Use mosquito nets, Drink clean water"
          style={inputStyle}
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
        {loading ? "Saving..." : initialData._id ? "Update Disease" : "Add Disease"}
      </button>
    </form>
  );
};

export default DiseaseForm;