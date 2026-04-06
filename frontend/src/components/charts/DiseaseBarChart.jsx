import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, Cell,
} from "recharts";

// ── Custom Tooltip ────────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-3 text-sm">
      <p className="font-semibold text-gray-700 mb-2">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.fill }} />
          <span className="text-gray-600">{p.name}:</span>
          <span className="font-bold text-gray-800">{p.value}</span>
        </div>
      ))}
    </div>
  );
};

// ── Color Palette ─────────────────────────────────────────────────────────────
const COLORS = [
  "#3b82f6","#10b981","#f59e0b","#ef4444",
  "#8b5cf6","#ec4899","#14b8a6","#f97316",
];

// ─────────────────────────────────────────────────────────────────────────────
// Props:
//   data        → array of objects e.g. [{ month:"Jan", Malaria:45, Dengue:20 }]
//   keys        → array of disease names e.g. ["Malaria", "Dengue"]
//   xKey        → key for x axis e.g. "month"
//   title       → chart title string
//   height      → chart height (default 320)
//   stacked     → boolean — stacked bars (default false)
// ─────────────────────────────────────────────────────────────────────────────
const DiseaseBarChart = ({
  data    = [],
  keys    = [],
  xKey    = "month",
  title   = "Disease Report",
  height  = 320,
  stacked = false,
}) => {
  if (!data.length) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        {title && <h3 className="text-base font-semibold text-gray-800 mb-4">{title}</h3>}
        <div className="flex items-center justify-center h-40 text-gray-400 text-sm">
          No data available
        </div>
      </div>
    );
  }

  return (
<div className="chart1">
      {title && (
        <h3 className="text-base font-semibold text-gray-800 mb-1">{title}</h3>
      )}
      <p className="text-xs text-gray-400 mb-5">Affected patient count per period</p>

      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
          barCategoryGap="30%">
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
          <XAxis
            dataKey={xKey}
            tick={{ fontSize: 12, fill: "#6b7280" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 12, fill: "#6b7280" }}
            axisLine={false}
            tickLine={false}
            width={35}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f9fafb" }} />
          <Legend
            wrapperStyle={{ fontSize: "12px", paddingTop: "16px" }}
            iconType="circle"
            iconSize={8}
          />
          {keys.map((key, i) => (
            <Bar
              key={key}
              dataKey={key}
              fill={COLORS[i % COLORS.length]}
              radius={stacked ? [0,0,0,0] : [6, 6, 0, 0]}
              stackId={stacked ? "stack" : undefined}
              maxBarSize={48}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DiseaseBarChart;