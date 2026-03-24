import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = [
  "#f59e0b", "#10b981", "#3b82f6", "#ef4444",
  "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16",
];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const { name, value } = payload[0];
    return (
      <div style={{
        background: "#1e293b",
        border: "1px solid #334155",
        borderRadius: "8px",
        padding: "10px 14px",
        fontSize: "13px",
        color: "#e2e8f0",
      }}>
        <p style={{ fontWeight: 700, margin: 0, color: payload[0].fill }}>
          {name}
        </p>
        <p style={{ margin: "4px 0 0" }}>
          Cases: <strong>{value}</strong>
        </p>
      </div>
    );
  }
  return null;
};

const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  if (percent < 0.05) return null;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central"
      fontSize={11} fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

// data format: [{ name: "Malaria", value: 45 }, ...]
const DiseasePieChart = ({ data = [], title = "Disease Distribution" }) => {
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
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomLabel}
            outerRadius={110}
            innerRadius={40}
            dataKey="value"
            strokeWidth={2}
            stroke="#0f172a"
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: 12, color: "#94a3b8", paddingTop: 12 }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DiseasePieChart;