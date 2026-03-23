import { useState } from "react";
import { queryDataset } from "../api/client";
import type { QueryResult } from "../types";

interface Props {
  dataset_id: string;
}

const EXAMPLE_QUESTIONS = [
  "Show top 10 rows by salary",
  "Filter where department is Engineering",
  "What is the average age?",
];

export function QueryBox({ dataset_id }: Props) {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<QueryResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submit = async (q: string) => {
    if (!q.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await queryDataset(dataset_id, q);
      setResult(res);
    } catch (e: any) {
      setError(e?.response?.data?.detail ?? "Query failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        background: "var(--surface)",
        border: "0.5px solid var(--border)",
        borderRadius: 12,
        padding: "1rem 1.25rem",
      }}
    >
      <p style={{ fontSize: 13, fontWeight: 500, margin: "0 0 10px", color: "var(--text)" }}>
        Ask your data
      </p>

      <div style={{ display: "flex", gap: 8 }}>
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit(question)}
          placeholder="e.g. Show rows where revenue > 5000"
          style={{ flex: 1, fontSize: 13 }}
          disabled={loading}
        />
        <button
          onClick={() => submit(question)}
          disabled={loading || !question.trim()}
          style={{ fontSize: 13, padding: "0 16px" }}
        >
          {loading ? "…" : "Ask"}
        </button>
      </div>

      <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
        {EXAMPLE_QUESTIONS.map((q) => (
          <button
            key={q}
            onClick={() => { setQuestion(q); submit(q); }}
            style={{
              fontSize: 11,
              padding: "3px 10px",
              borderRadius: 99,
              border: "0.5px solid var(--border)",
              background: "transparent",
              color: "var(--text-muted)",
              cursor: "pointer",
            }}
          >
            {q}
          </button>
        ))}
      </div>

      {error && (
        <p style={{ fontSize: 13, color: "var(--danger)", marginTop: 10 }}>{error}</p>
      )}

      {result && (
        <div style={{ marginTop: 14 }}>
          <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "0 0 8px" }}>
            {result.row_count} rows · generated code:{" "}
            <code
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                background: "var(--surface-hover)",
                padding: "1px 5px",
                borderRadius: 4,
              }}
            >
              {result.pandas_code}
            </code>
          </p>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {Object.keys(result.result[0] ?? {}).map((col) => (
                    <th
                      key={col}
                      style={{
                        textAlign: "left",
                        padding: "6px 10px",
                        borderBottom: "0.5px solid var(--border)",
                        color: "var(--text-muted)",
                        fontWeight: 500,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.result.slice(0, 10).map((row, i) => (
                  <tr key={i} style={{ background: i % 2 ? "var(--surface-hover)" : "transparent" }}>
                    {Object.values(row).map((val, j) => (
                      <td
                        key={j}
                        style={{
                          padding: "6px 10px",
                          borderBottom: "0.5px solid var(--border)",
                          color: "var(--text)",
                        }}
                      >
                        {String(val)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}