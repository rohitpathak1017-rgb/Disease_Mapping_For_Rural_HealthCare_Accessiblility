import { useState } from "react";

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
  transition: "border-color 0.2s",
};

const labelStyle = {
  display: "block",
  marginBottom: 6,
  fontSize: 13,
  fontWeight: 500,
  color: "#94a3b8",
};

const fieldWrap = { marginBottom: 16 };

// onSubmit(formData) => called by parent
// initialData => for edit mode
const VillageForm = ({ onSubmit, initialData = {}, loading = false }) => {
  const [form, setForm] = useState({
    state:       initialData.state       || "",
    district:    initialData.district    || "",
    subdistrict: initialData.subdistrict || "",
    villageName: initialData.villageName || "",
    population:  initialData.population  || "",
  });

  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.state.trim())       e.state       = "State is required";
    if (!form.district.trim())    e.district    = "District is required";
    if (!form.subdistrict.trim()) e.subdistrict = "Subdistrict is required";
    if (!form.villageName.trim()) e.villageName = "Village name is required";
    if (form.population && isNaN(Number(form.population)))
      e.population = "Must be a number";
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length) { setErrors(e2); return; }
    onSubmit({ ...form, population: form.population ? Number(form.population) : undefined });
  };

  const fields = [
    { name: "state",       label: "State",              placeholder: "e.g. Uttar Pradesh" },
    { name: "district",    label: "District",           placeholder: "e.g. Prayagraj" },
    { name: "subdistrict", label: "Sub-district / Block", placeholder: "e.g. Soraon" },
    { name: "villageName", label: "Village Name",       placeholder: "e.g. Lalapur" },
    { name: "population",  label: "Population (optional)", placeholder: "e.g. 2500", type: "number" },
  ];

  return (
    <form onSubmit={handleSubmit}>
      {fields.map(({ name, label, placeholder, type = "text" }) => (
        <div key={name} style={fieldWrap}>
          <label style={labelStyle}>{label}</label>
          <input
            type={type}
            name={name}
            value={form[name]}
            onChange={handleChange}
            placeholder={placeholder}
            style={{
              ...inputStyle,
              borderColor: errors[name] ? "#ef4444" : "#334155",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
            onBlur={(e) => (e.target.style.borderColor = errors[name] ? "#ef4444" : "#334155")}
          />
          {errors[name] && (
            <p style={{ color: "#ef4444", fontSize: 12, marginTop: 4 }}>{errors[name]}</p>
          )}
        </div>
      ))}

      <button
        type="submit"
        disabled={loading}
        style={{
          width: "100%",
          padding: "11px",
          background: loading ? "#1e293b" : "#3b82f6",
          color: loading ? "#64748b" : "#fff",
          border: "none",
          borderRadius: 8,
          fontSize: 14,
          fontWeight: 600,
          cursor: loading ? "not-allowed" : "pointer",
          marginTop: 4,
          transition: "background 0.2s",
        }}
      >
        {loading ? "Saving..." : initialData._id ? "Update Village" : "Add Village"}
      </button>
    </form>
  );
};

export default VillageForm;