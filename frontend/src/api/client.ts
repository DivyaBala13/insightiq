import axios from "axios";
import type { AnalysisResult,InsightResponse, QueryResult } from "../types";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:8000",
});

export const uploadCSV = async (file: File): Promise<AnalysisResult> => {
  const form = new FormData();
  form.append("file", file);
  const { data } = await api.post<AnalysisResult>("/upload/csv", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

export const fetchInsights = async (
  dataset_id: string
): Promise<InsightResponse> => {
  const { data } = await api.post<InsightResponse>("/insights/", {
    dataset_id,
  });
  return data;
};

export const queryDataset = async (
  dataset_id: string,
  question: string
): Promise<QueryResult> => {
  const { data } = await api.post<QueryResult>("/query/", {
    dataset_id,
    question,
  });
  return data;
};