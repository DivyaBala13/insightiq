import {
    BarChart, Bar, LineChart, Line, ScatterChart, Scatter,
    PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Legend,
  } from "recharts";
  import type { ChartSuggestion, DatasetSummary } from "../types";
  import { useDatasetStore } from "../store/datasetStore";
  
  const COLORS = ["#378ADD", "#1D9E75", "#D85A30", "#7F77DD", "#BA7517"];
  
  interface Props {
    suggestions: ChartSuggestion[];
    summary: DatasetSummary;
  }
  
  function buildChartData(
    suggestion: ChartSuggestion,
    summary: DatasetSummary
  ): Record<string, string | number>[] {
    return summary.preview.map((row) => {
      const entry: Record<string, string | number> = {};
      entry[suggestion.x_column] = row[suggestion.x_column] ?? "";
      if (suggestion.y_column) {
        const raw = row[suggestion.y_column];
        entry[suggestion.y_column] = isNaN(Number(raw)) ? raw : Number(raw);
      }
      return entry;
    });
  }
  
  function renderChart(
    suggestion: ChartSuggestion,
    data: Record<string, string | number>[]
  ) {
    const common = { data, margin: { top: 8, right: 16, left: 0, bottom: 8 } };
  
    switch (suggestion.chart_type) {
      case "bar":
        return (
          <BarChart {...common}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey={suggestion.x_column} tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey={suggestion.y_column!} fill={COLORS[0]} radius={[4, 4, 0, 0]} />
          </BarChart>
        );
  
      case "line":
        return (
          <LineChart {...common}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey={suggestion.x_column} tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey={suggestion.y_column!}
              stroke={COLORS[0]}
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        );
  
      case "scatter":
        return (
          <ScatterChart {...common}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey={suggestion.x_column} tick={{ fontSize: 12 }} />
            <YAxis dataKey={suggestion.y_column!} tick={{ fontSize: 12 }} />
            <Tooltip />
            <Scatter data={data} fill={COLORS[0]} />
          </ScatterChart>
        );
  
      case "pie": {
        const counts: Record<string, number> = {};
        data.forEach((d) => {
          const k = String(d[suggestion.x_column]);
          counts[k] = (counts[k] ?? 0) + 1;
        });
        const pieData = Object.entries(counts).map(([name, value]) => ({
          name,
          value,
        }));
        return (
          <PieChart>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label={({ name, percent=0 }) =>
                `${name} ${(percent * 100).toFixed(0)}%`
              }
            >
              {pieData.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        );
      }
  
      default:
        return (
          <BarChart {...common}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey={suggestion.x_column} tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey={suggestion.y_column ?? suggestion.x_column} fill={COLORS[0]} />
          </BarChart>
        );
    }
  }
  
  export function ChartPanel({ suggestions, summary }: Props) {
    const { activeChart, setActiveChart } = useDatasetStore();
    const suggestion = suggestions[activeChart];
    const data = buildChartData(suggestion, summary);
  
    return (
      <div
        style={{
          background: "var(--surface)",
          border: "0.5px solid var(--border)",
          borderRadius: 12,
          padding: "1rem 1.25rem",
        }}
      >
        <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
          {suggestions.map((s, i) => (
            <button
              key={i}
              onClick={() => setActiveChart(i)}
              style={{
                fontSize: 12,
                padding: "4px 12px",
                borderRadius: 99,
                border: i === activeChart
                  ? "1.5px solid var(--accent)"
                  : "0.5px solid var(--border)",
                background: i === activeChart ? "var(--accent-soft)" : "transparent",
                color: i === activeChart ? "var(--accent)" : "var(--text-muted)",
                cursor: "pointer",
              }}
            >
              {s.title}
            </button>
          ))}
        </div>
  
        <ResponsiveContainer width="100%" height={280}>
          {renderChart(suggestion, data)}
        </ResponsiveContainer>
  
        <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "10px 0 0" }}>
          {suggestion.reason}
        </p>
      </div>
    );
  }