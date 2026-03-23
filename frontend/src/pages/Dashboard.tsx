import { useDatasetStore } from "../store/datasetStore";
import { useThemeStore } from "../store/themeStore";
import { UploadZone } from "../components/uploadZone";
import { SummaryBar } from "../components/SummaryBar";
import { ChartPanel } from "../components/ChartPanel";
import { InsightCards } from "../components/InsightsCards";
import { QueryBox } from "../components/QueryBox";

export function Dashboard() {
  const { result, reset } = useDatasetStore();
  const { isDark, toggle } = useThemeStore();

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text)" }}>
      <header
        style={{
          display: "flex",
          alignItems: "center",
          padding: "0 32px",
          height: 56,
          borderBottom: "0.5px solid var(--border)",
          background: "var(--surface)",
        }}
      >
        <span style={{ fontWeight: 500, fontSize: 16, letterSpacing: "-0.02em" }}>
          InsightIQ
        </span>
        <button
          onClick={toggle}
          style={{ marginLeft: "auto", fontSize: 13 }}
          aria-label="Toggle dark mode"
        >
          {isDark ? "Light mode" : "Dark mode"}
        </button>
      </header>

      <main style={{ maxWidth: 960, margin: "0 auto", padding: "32px 24px" }}>
        {!result ? (
          <div style={{ paddingTop: 64 }}>
            <h1
              style={{
                fontSize: 28,
                fontWeight: 500,
                textAlign: "center",
                margin: "0 0 8px",
              }}
            >
              Upload a dataset
            </h1>
            <p
              style={{
                fontSize: 15,
                color: "var(--text-muted)",
                textAlign: "center",
                margin: "0 0 40px",
              }}
            >
              Drop any CSV file — get charts, AI insights, and natural language queries instantly.
            </p>
            <UploadZone />
          </div>
        ) : (
          <>
            <SummaryBar summary={result.summary} onReset={reset} />

            <div style={{ display: "grid", gap: 16 }}>
              <section>
                <p
                  style={{
                    fontSize: 11,
                    fontWeight: 500,
                    color: "var(--text-muted)",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    margin: "0 0 10px",
                  }}
                >
                  Charts
                </p>
                <ChartPanel
                  suggestions={result.chart_suggestions}
                  summary={result.summary}
                />
              </section>

              <section>
                <p
                  style={{
                    fontSize: 11,
                    fontWeight: 500,
                    color: "var(--text-muted)",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    margin: "0 0 10px",
                  }}
                >
                  AI insights
                </p>
                <InsightCards dataset_id={result.dataset_id} />
              </section>

              <section>
                <p
                  style={{
                    fontSize: 11,
                    fontWeight: 500,
                    color: "var(--text-muted)",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    margin: "0 0 10px",
                  }}
                >
                  Query
                </p>
                <QueryBox dataset_id={result.dataset_id} />
              </section>
            </div>
          </>
        )}
      </main>
    </div>
  );
}