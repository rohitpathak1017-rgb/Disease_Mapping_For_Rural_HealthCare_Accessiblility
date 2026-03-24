import { useState } from "react";

const CATEGORIES = [
  "Camp Service",
  "Doctor Behavior",
  "Medicine Quality",
  "Village Coverage",
  "Response Time",
  "General",
];

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

// Props: onSubmit(payload), healthWorkerId, villageId, relatedCamp (optional), loading
const FeedbackForm = ({
  onSubmit,
  healthWorkerId,
  villageId,
  relatedCamp = null,
  loading = false,
}) => {
  const [form, setForm] = useState({
    rating: 0,
    hoverRating: 0,
    category: "",
    message: "",
    isAnonymous: false,
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
    setErrors((p) => ({ ...p, [name]: undefined }));
  };

  const validate = () => {
    const e = {};
    if (!form.rating)          e.rating   = "Please select a rating";
    if (!form.category)        e.category = "Please select a category";
    if (!form.message.trim())  e.message  = "Message is required";
    if (form.message.trim().length < 10) e.message = "Message must be at least 10 characters";
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length) { setErrors(e2); return; }

    onSubmit({
      healthWorkerId,
      villageId,
      relatedCamp,
      rating:      form.rating,
      category:    form.category,
      message:     form.message.trim(),
      isAnonymous: form.isAnonymous,
    });
  };

  const starColor = (i) => {
    const active = form.hoverRating || form.rating;
    return i <= active ? "#f59e0b" : "#334155";
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Star Rating */}
      <div style={{ marginBottom: 20 }}>
        <label style={labelStyle}>Rating *</label>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <button
              key={i}
              type="button"
              onClick={() => { setForm((p) => ({ ...p, rating: i })); setErrors((p) => ({ ...p, rating: undefined })); }}
              onMouseEnter={() => setForm((p) => ({ ...p, hoverRating: i }))}
              onMouseLeave={() => setForm((p) => ({ ...p, hoverRating: 0 }))}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 2,
                fontSize: 32,
                lineHeight: 1,
                color: starColor(i),
                transition: "color 0.15s, transform 0.1s",
                transform: (form.hoverRating || form.rating) >= i ? "scale(1.15)" : "scale(1)",
              }}
            >
              ★
            </button>
          ))}
          {form.rating > 0 && (
            <span style={{ fontSize: 13, color: "#f59e0b", marginLeft: 4 }}>
              {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][form.rating]}
            </span>
          )}
        </div>
        {errors.rating && <p style={{ color: "#ef4444", fontSize: 12, marginTop: 4 }}>{errors.rating}</p>}
      </div>

      {/* Category */}
      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>Feedback Category *</label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {CATEGORIES.map((cat) => {
            const selected = form.category === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => { setForm((p) => ({ ...p, category: cat })); setErrors((p) => ({ ...p, category: undefined })); }}
                style={{
                  padding: "6px 14px",
                  borderRadius: 20,
                  border: `1px solid ${selected ? "#3b82f6" : "#334155"}`,
                  background: selected ? "#1d4ed8" : "transparent",
                  color: selected ? "#fff" : "#94a3b8",
                  fontSize: 13,
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>
        {errors.category && <p style={{ color: "#ef4444", fontSize: 12, marginTop: 6 }}>{errors.category}</p>}
      </div>

      {/* Message */}
      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>Your Feedback *</label>
        <textarea
          name="message"
          value={form.message}
          onChange={handleChange}
          placeholder="Share your experience with the healthcare services..."
          rows={4}
          style={{
            ...inputStyle,
            resize: "vertical",
            lineHeight: 1.6,
            borderColor: errors.message ? "#ef4444" : "#334155",
          }}
        />
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
          {errors.message
            ? <p style={{ color: "#ef4444", fontSize: 12, margin: 0 }}>{errors.message}</p>
            : <span />}
          <span style={{ fontSize: 12, color: "#475569" }}>{form.message.length} chars</span>
        </div>
      </div>

      {/* Anonymous toggle */}
      <div style={{ marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
        <input
          type="checkbox"
          id="isAnonymous"
          name="isAnonymous"
          checked={form.isAnonymous}
          onChange={handleChange}
          style={{ width: 16, height: 16, cursor: "pointer", accentColor: "#3b82f6" }}
        />
        <label htmlFor="isAnonymous" style={{ ...labelStyle, margin: 0, cursor: "pointer" }}>
          Submit anonymously
        </label>
      </div>

      <button
        type="submit"
        disabled={loading}
        style={{
          width: "100%", padding: "12px",
          background: loading ? "#1e293b" : "#3b82f6",
          color: loading ? "#64748b" : "#fff",
          border: "none", borderRadius: 8,
          fontSize: 14, fontWeight: 600,
          cursor: loading ? "not-allowed" : "pointer",
          transition: "background 0.2s",
        }}
      >
        {loading ? "Submitting..." : "Submit Feedback"}
      </button>
    </form>
  );
};

export default FeedbackForm;