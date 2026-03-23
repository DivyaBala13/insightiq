import type { DatasetSummary } from "../types";

interface Props {
  summary: DatasetSummary;
  onReset: () => void;
}

export function SummaryBar({ summary, onReset }: Props) {
  const stats = [
    { label: "File", value: summary.filename },
    { label: "Rows", value: summary.row_count.toLocaleString() },
    { label: "Columns", value: summary.col_count },
    {
      label: "Missing",
      value:
        summary.columns.reduce((a, c) => a + c.null_count, 0) + " cells",
    },
  ];

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 24,
        flexWrap: "wrap",
        padding: "12px 0",
        borderBottom: "0.5px solid var(--border)",
        marginBottom: 24,
      }}
    >
      {stats.map((s) => (
        <div key={s.label}>
          <p
            style={{
              fontSize: 11,
              color: "var(--text-muted)",
              margin: "0 0 2px",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            {s.label}
          </p>
          <p
            style={{
              fontSize: 15,
              fontWeight: 500,
              margin: 0,
              color: "var(--text)",
            }}
          >
            {String(s.value)}
          </p>
        </div>
      ))}
      <button
        onClick={onReset}
        style={{ marginLeft: "auto", fontSize: 13 }}
      >
        Upload new file
      </button>
    </div>
  );
}