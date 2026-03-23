import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { uploadCSV } from "../api/client";
import { useDatasetStore } from "../store/datasetStore";

export function UploadZone() {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setResult = useDatasetStore((s) => s.setResult);

  const onDrop = useCallback(
    async (files: File[]) => {
      const file = files[0];
      if (!file) return;
      setError(null);
      setUploading(true);
      try {
        const result = await uploadCSV(file);
        setResult(result);
      } catch (e: any) {
        setError(e?.response?.data?.detail ?? "Upload failed.");
      } finally {
        setUploading(false);
      }
    },
    [setResult]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "text/csv": [".csv"] },
    maxFiles: 1,
    disabled: uploading,
  });

  return (
    <div style={{ width: "100%", maxWidth: 560, margin: "0 auto" }}>
      <div
        {...getRootProps()}
        style={{
          border: `1.5px dashed ${isDragActive ? "var(--accent)" : "var(--border)"}`,
          borderRadius: 12,
          padding: "48px 32px",
          textAlign: "center",
          cursor: uploading ? "not-allowed" : "pointer",
          background: isDragActive ? "var(--surface-hover)" : "var(--surface)",
          transition: "all 0.15s",
        }}
      >
        <input {...getInputProps()} />
        <div style={{ fontSize: 32, marginBottom: 12, lineHeight: 1 }}>
          {uploading ? "⏳" : "📂"}
        </div>
        <p style={{ fontWeight: 500, margin: "0 0 4px", color: "var(--text)" }}>
          {uploading
            ? "Uploading…"
            : isDragActive
            ? "Drop it here"
            : "Drag a CSV file here, or click to browse"}
        </p>
        <p style={{ fontSize: 13, color: "var(--text-muted)", margin: 0 }}>
          Max 10 MB · .csv only
        </p>
      </div>
      {error && (
        <p
          style={{
            marginTop: 10,
            fontSize: 13,
            color: "var(--danger)",
            textAlign: "center",
          }}
        >
          {error}
        </p>
      )}
    </div>
  );
}