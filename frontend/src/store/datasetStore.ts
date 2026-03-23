import { create } from "zustand";
import type { AnalysisResult } from "../types";

interface DatasetStore {
  result: AnalysisResult | null;
  activeChart: number;
  setResult: (r: AnalysisResult) => void;
  setActiveChart: (i: number) => void;
  reset: () => void;
}

export const useDatasetStore = create<DatasetStore>((set) => ({
  result: null,
  activeChart: 0,
  setResult: (result) => set({ result, activeChart: 0 }),
  setActiveChart: (activeChart) => set({ activeChart }),
  reset: () => set({ result: null, activeChart: 0 }),
}));