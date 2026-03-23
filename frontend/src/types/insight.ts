export type InsightType =
  | "trend"
  | "anomaly"
  | "distribution"
  | "correlation"
  | "quality";

export interface InsightCard {
  title: string;
  body: string;
  insight_type: InsightType;
}

export interface InsightResponse {
  dataset_id: string;
  insights: InsightCard[];
}

export interface QueryResult {
  question: string;
  pandas_code: string;
  result: Record<string, string>[];
  row_count: number;
}