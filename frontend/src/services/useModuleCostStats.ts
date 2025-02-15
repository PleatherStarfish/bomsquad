import { useQuery } from "@tanstack/react-query";

import axios from "axios";

export type CostStats = {
  low: string;
  high: string;
  average: string;
  median: string;
};

export type ModuleCostStatsResponse = {
  module_id: string;
  module_name: string;
  overall: CostStats;
  cost_built: string | null;
  cost_built_link: string | null;
  cost_built_third_party: boolean | null;

  cost_pcb_only: string | null;
  cost_pcb_only_link: string | null;
  cost_pcb_only_third_party: boolean | null;

  cost_pcb_plus_front: string | null;
  cost_pcb_plus_front_link: string | null;
  cost_pcb_plus_front_third_party: boolean | null;

  cost_kit: string | null;
  cost_kit_link: string | null;
  cost_kit_third_party: boolean;

  cost_partial_kit: string | null;
  cost_partial_kit_link: string | null;
  cost_partial_kit_third_party: boolean | null;
};

// Fetch function for module cost stats.
const fetchModuleCostStats = async (
  moduleId: string
): Promise<ModuleCostStatsResponse> => {
  try {
    const response = await axios.get<ModuleCostStatsResponse>(
      `/api/module/cost-stats/${moduleId}/`,
      {
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.error ||
        "An error occurred while fetching module cost stats."
    );
  }
};

// Custom hook to fetch module cost stats for a given moduleId.
const useModuleCostStats = (moduleId: string) => {
  return useQuery<ModuleCostStatsResponse, Error>({
    enabled: Boolean(moduleId),
    queryFn: () => fetchModuleCostStats(moduleId),
    queryKey: ["moduleCostStats", moduleId], // Only fetch if moduleId is provided.
  });
};

export default useModuleCostStats;
