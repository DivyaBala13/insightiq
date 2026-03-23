import { useQuery } from "@tanstack/react-query";
import { fetchInsights } from "../api/client";

export const useInsights = (dataset_id: string | null) =>
  useQuery({
    queryKey: ["insights", dataset_id],
    queryFn: () => fetchInsights(dataset_id!),
    enabled: !!dataset_id,
    staleTime: Infinity,
  });