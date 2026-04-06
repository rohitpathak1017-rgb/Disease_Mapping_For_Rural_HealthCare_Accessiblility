import {
  PieChart, Pie, Cell, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts";

// ── Color Palette ─────────────────────────────────────────────────────────────
const COLORS = [
  "#3b82f6","#10b981","#f59e0b","#ef4444",
  "#8b5cf6","#ec4899","#14b8a6","#f97316",
];

// ── Custom Tooltip ────────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const { name, value, payload: p } = payload[0];
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-3 text-sm">
      <div className="flex items-center gap-2 mb-1">
        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.fill }} />
        <span className="font-semibold text-gray-800">{name}</span>
      </div>
      <p className="text-gray-500">
        Affected: <span className="font-bold text-gray-800">{value}</span>
      </p>
      <p className="text-gray-500">
        Share: <span className="font-bold text-gray-800">
          {((value / p.total) * 100).toFixed(1)}%
        </span>
      </p>
    </div>
  );
};

// ── Custom Label ──────────────────────────────────────────────────────────────
const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  if (percent < 0.05) return null; // hide tiny slices
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central"
      fontSize={11} fontWeight="600">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Props:
//   data    → array e.g. [{ name:"Malaria", value:45 }, { name:"Dengue", value:20 }]
//   title   → chart title string
//   height  → chart height (default 320)
//   donut   → boolean — donut style (default true)
// ─────────────────────────────────────────────────────────────────────────────
const DiseasePieChart = ({
  data   = [],
  title  = "Disease Distribution",
  height = 320,
  donut  = true,
}) => {
  const total = data.reduce((sum, d) => sum + d.value, 0);

  // Attach total to each entry for tooltip calculation
  const enriched = data.map((d) => ({ ...d, total, fill: COLORS[data.indexOf(d) % COLORS.length] }));

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
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      {title && (
        <h3 className="text-base font-semibold text-gray-800 mb-1">{title}</h3>
      )}
      <p className="text-xs text-gray-400 mb-2">
        Total affected: <span className="font-semibold text-gray-700">{total}</span>
      </p>

      <div className="flex flex-col lg:flex-row items-center gap-4">
        {/* Pie */}
        <ResponsiveContainer width="100%" height={height}>
          <PieChart>
            <Pie
              data={enriched}
              cx="50%"
              cy="50%"
              outerRadius={110}
              innerRadius={donut ? 55 : 0}
              dataKey="value"
              labelLine={false}
              label={renderCustomLabel}
              paddingAngle={2}
            >
              {enriched.map((entry, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="white" strokeWidth={2} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: "12px", paddingTop: "12px" }}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Legend Table */}
        <div className="w-full lg:w-48 space-y-2 shrink-0">
          {enriched.map((d, i) => (
            <div key={i} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <span className="text-xs text-gray-600 truncate max-w-[90px]">{d.name}</span>
              </div>
              <span className="text-xs font-bold text-gray-800">{d.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DiseasePieChart;