export interface ColumnInfo {
    name: string;
    dtype: string;
    sample_values: (string | number | boolean)[];
    null_count: number;
    unique_count: number;
  }
  
  export interface DatasetSummary {
    filename: string;
    row_count: number;
    col_count: number;
    columns: ColumnInfo[];
    preview: Record<string, string>[];
  }
  
  export interface ChartSuggestion {
    chart_type: "bar" | "line" | "scatter" | "pie" | "histogram";
    x_column: string;
    y_column: string | null;
    title: string;
    reason: string;
  }
  
  export interface AnalysisResult {
    dataset_id: string;
    summary: DatasetSummary;
    chart_suggestions: ChartSuggestion[];
  }