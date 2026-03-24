import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

// Color scale based on severity
const getSeverityColor = (value, max) => {
  if (!max || max === 0) return "#1e293b";
  const ratio = value / max;
  if (ratio >= 0.75) return "#ef4444"; // high — red
  if (ratio >= 0.5)  return "#f97316"; // medium-high — orange
  if (ratio >= 0.25) return "#f59e0b"; // medium — amber
  return "#10b981";                    // low — green
};

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
        <p style={{ margin: 0 }}>
          Total Affected: <strong style={{ color: "#f59e0b" }}>{payload[0]?.value}</strong>
        </p>
      </div>
    );
  }
  return null;
};

// data format: [{ village: "Lalapur", affected: 45 }, ...]
const VillageMapChart = ({ data = [], title = "Village-wise Disease Burden" }) => {
  const max = data.length ? Math.max(...data.map((d) => d.affected)) : 0;

  if (!data.length) {
    return (
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        height: 300, color: "#64748b", fontSize: 14,
        background: "#0f172a", borderRadius: 12, border: "1px dashed #334155"
      }}>
        No village data available
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
          margin: "0 0 4px 4px",
          fontSize: 15,
          fontWeight: 600,
          color: "#e2e8f0",
          letterSpacing: "0.3px",
        }}>
          {title}
        </h3>
      )}

      {/* Legend */}
      <div style={{
        display: "flex", gap: 16, margin: "8px 4px 16px",
        fontSize: 11, color: "#64748b", alignItems: "center",
      }}>
        {[
          { color: "#10b981", label: "Low" },
          { color: "#f59e0b", label: "Medium" },
          { color: "#f97316", label: "High" },
          { color: "#ef4444", label: "Critical" },
        ].map(({ color, label }) => (
          <span key={label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{
              width: 10, height: 10, borderRadius: 2,
              background: color, display: "inline-block"
            }} />
            {label}
          </span>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 4, right: 24, left: 8, bottom: 4 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
          <XAxis
            type="number"
            tick={{ fill: "#64748b", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="village"
            width={90}
            tick={{ fill: "#94a3b8", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="affected" radius={[0, 4, 4, 0]} barSize={18}>
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={getSeverityColor(entry.affected, max)}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default VillageMapChart;