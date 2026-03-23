import { useInsights } from "../hooks/useInsights";
import type { InsightType } from "../types";

const TYPE_COLORS: Record<InsightType, { bg: string; text: string }> = {
  trend:        { bg: "#E6F1FB", text: "#0C447C" },
  anomaly:      { bg: "#FCEBEB", text: "#791F1F" },
  distribution: { bg: "#EEEDFE", text: "#3C3489" },
  correlation:  { bg: "#E1F5EE", text: "#085041" },
  quality:      { bg: "#FAEEDA", text: "#633806" },
};

interface Props {
  dataset_id: string;
}

export function InsightCards({ dataset_id }: Props) {
  const { data, isLoading, isError } = useInsights(dataset_id);

  if (isLoading) {
    return (
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              background: "var(--surface)",
              border: "0.5px solid var(--border)",
              borderRadius: 12,
              padding: "1rem 1.25rem",
              minHeight: 110,
              opacity: 0.5,
            }}
          >
            <div
              style={{
                height: 12,
                width: "60%",
                background: "var(--border)",
                borderRadius: 4,
                marginBottom: 10,
              }}
            />
            <div
              style={{
                height: 10,
                width: "90%",
                background: "var(--border)",
                borderRadius: 4,
                marginBottom: 6,
              }}
            />
            <div
              style={{
                height: 10,
                width: "75%",
                background: "var(--border)",
                borderRadius: 4,
              }}
            />
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <p style={{ fontSize: 13, color: "var(--danger)" }}>
        Could not load insights. Check your OpenAI API key.
      </p>
    );
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
      {data?.insights.map((card, i) => {
        const colors = TYPE_COLORS[card.insight_type] ?? TYPE_COLORS.trend;
        return (
          <div
            key={i}
            style={{
              background: "var(--surface)",
              border: "0.5px solid var(--border)",
              borderRadius: 12,
              padding: "1rem 1.25rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <span
                style={{
                  fontSize: 11,
                  padding: "2px 8px",
                  borderRadius: 99,
                  background: colors.bg,
                  color: colors.text,
                  fontWeight: 500,
                  textTransform: "capitalize",
                }}
              >
                {card.insight_type}
              </span>
            </div>
            <p style={{ fontSize: 13, fontWeight: 500, margin: "0 0 4px", color: "var(--text)" }}>
              {card.title}
            </p>
            <p style={{ fontSize: 13, color: "var(--text-muted)", margin: 0, lineHeight: 1.6 }}>
              {card.body}
            </p>
          </div>
        );
      })}
    </div>
  );
}