import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, LabelList,
} from "recharts";

// ── Color scale based on severity ────────────────────────────────────────────
const getHeatColor = (value, max) => {
  if (!max || max === 0) return "#e0f2fe";
  const ratio = value / max;
  if (ratio >= 0.8) return "#dc2626"; // Critical — red
  if (ratio >= 0.6) return "#f97316"; // High     — orange
  if (ratio >= 0.4) return "#f59e0b"; // Medium   — yellow
  if (ratio >= 0.2) return "#22c55e"; // Low      — green
  return "#86efac";                   // Very Low — light green
};

// ── Custom Tooltip ────────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-3 text-sm min-w-[160px]">
      <p className="font-semibold text-gray-800 mb-2">🏘️ {d.village}</p>
      <div className="space-y-1">
        <p className="text-gray-500">
          Affected: <span className="font-bold text-red-600">{d.totalAffected}</span>
        </p>
        <p className="text-gray-500">
          Recovered: <span className="font-bold text-green-600">{d.totalRecovered}</span>
        </p>
        <p className="text-gray-500">
          Deaths: <span className="font-bold text-gray-800">{d.totalDeaths}</span>
        </p>
        {d.district && (
          <p className="text-gray-400 text-xs pt-1 border-t border-gray-100">
            {d.district}, {d.state}
          </p>
        )}
      </div>
    </div>
  );
};

// ── Legend ────────────────────────────────────────────────────────────────────
const HeatLegend = () => (
  <div className="flex items-center gap-2 flex-wrap mt-4">
    <span className="text-xs text-gray-500 font-medium">Severity:</span>
    {[
      { label: "Very Low",  color: "#86efac" },
      { label: "Low",       color: "#22c55e" },
      { label: "Medium",    color: "#f59e0b" },
      { label: "High",      color: "#f97316" },
      { label: "Critical",  color: "#dc2626" },
    ].map((l) => (
      <div key={l.label} className="flex items-center gap-1">
        <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: l.color }} />
        <span className="text-xs text-gray-500">{l.label}</span>
      </div>
    ))}
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Props:
//   data    → array e.g.:
//     [{
//       village:       "Lalapur",
//       district:      "Prayagraj",
//       state:         "Uttar Pradesh",
//       totalAffected: 120,
//       totalRecovered:80,
//       totalDeaths:   5,
//     }]
//   title   → chart title
//   height  → chart height (default 360)
// ─────────────────────────────────────────────────────────────────────────────
const VillageMapChart = ({
  data   = [],
  title  = "Village-wise Disease Heatmap",
  height = 360,
}) => {
  const max = Math.max(...data.map((d) => d.totalAffected), 1);

  if (!data.length) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        {title && <h3 className="text-base font-semibold text-gray-800 mb-4">{title}</h3>}
        <div className="flex items-center justify-center h-40 text-gray-400 text-sm">
          No village data available
        </div>
      </div>
    );
  }

  // Sort by most affected
  const sorted = [...data].sort((a, b) => b.totalAffected - a.totalAffected);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      {title && (
        <h3 className="text-base font-semibold text-gray-800 mb-1">{title}</h3>
      )}
      <p className="text-xs text-gray-400 mb-5">
        Sorted by affected count — darker color = higher severity
      </p>

      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={sorted}
          layout="vertical"
          margin={{ top: 0, right: 60, left: 10, bottom: 0 }}
          barCategoryGap="25%"
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
          <XAxis
            type="number"
            tick={{ fontSize: 11, fill: "#6b7280" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="village"
            tick={{ fontSize: 12, fill: "#374151", fontWeight: 500 }}
            axisLine={false}
            tickLine={false}
            width={80}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f9fafb" }} />
          <Bar dataKey="totalAffected" radius={[0, 6, 6, 0]} maxBarSize={28}>
            {sorted.map((entry, i) => (
              <Cell key={i} fill={getHeatColor(entry.totalAffected, max)} />
            ))}
            <LabelList
              dataKey="totalAffected"
              position="right"
              style={{ fontSize: 11, fontWeight: 600, fill: "#374151" }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Heat Legend */}
      <HeatLegend />

      {/* Summary Grid */}
      <div className="grid grid-cols-3 gap-3 mt-5 border-t border-gray-100 pt-4">
        <div className="text-center">
          <p className="text-xl font-bold text-red-500">
            {data.reduce((s, d) => s + d.totalAffected, 0)}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">Total Affected</p>
        </div>
        <div className="text-center">
          <p className="text-xl font-bold text-green-500">
            {data.reduce((s, d) => s + d.totalRecovered, 0)}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">Total Recovered</p>
        </div>
        <div className="text-center">
          <p className="text-xl font-bold text-gray-700">
            {data.reduce((s, d) => s + d.totalDeaths, 0)}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">Total Deaths</p>
        </div>
      </div>
    </div>
  );
};

export default VillageMapChart;