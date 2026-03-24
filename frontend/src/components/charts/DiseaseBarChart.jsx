import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: "#1e293b",
        border: "1px solid #334155",
        borderRadius: "8px",
        padding: "10px 14px",
        fontSize: "13px",
        color: "#e2e8f0",
      }}>
        <p style={{ fontWeight: 700, marginBottom: 6, color: "#94a3b8" }}>{label}</p>
        {payload.map((entry) => (
          <p key={entry.dataKey} style={{ color: entry.color, margin: "2px 0" }}>
            {entry.name}: <strong>{entry.value}</strong>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// data format expected:
// [{ disease: "Malaria", affected: 45, recovered: 30, deaths: 1 }, ...]
const DiseaseBarChart = ({ data = [], title = "Disease Statistics" }) => {
  if (!data.length) {
    return (
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        height: 300, color: "#64748b", fontSize: 14,
        background: "#0f172a", borderRadius: 12, border: "1px dashed #334155"
      }}>
        No data available
      </div>
    );
  }

  return (
    <div style={{
      background: "#0f172a",
      borderRadius: 12,
      border: "1px solid #1e293b",
      padding: "20px 16px 8px",
    }}>
      {title && (
        <h3 style={{
          margin: "0 0 20px 4px",
          fontSize: 15,
          fontWeight: 600,
          color: "#e2e8f0",
          letterSpacing: "0.3px",
        }}>
          {title}
        </h3>
      )}
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 4, right: 16, left: -10, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis
            dataKey="disease"
            tick={{ fill: "#64748b", fontSize: 12 }}
            axisLine={{ stroke: "#334155" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "#64748b", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: 12, color: "#94a3b8", paddingTop: 12 }}
          />
          <Bar dataKey="affected" name="Affected" fill="#f59e0b" radius={[4, 4, 0, 0]} />
          <Bar dataKey="recovered" name="Recovered" fill="#10b981" radius={[4, 4, 0, 0]} />
          <Bar dataKey="deaths" name="Deaths" fill="#ef4444" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DiseaseBarChart;