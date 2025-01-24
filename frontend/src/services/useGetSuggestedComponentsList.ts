import { ComponentManufacturer } from "../types/component";
import { ComponentSupplierItem } from "../types/component";
import { Types } from "../types/component";

import { useQuery } from "@tanstack/react-query";

import axios from "axios";

export interface SuggestedComponent {
  id: string;
  module_bom_list_item: string; // UUID of the BOM list item
  suggested_component: {
    id: string;
    description: string;
    link: string;
    manufacturer?: ComponentManufacturer | null;
    manufacturer_part_no?: string;
    mounting_style?: "smt" | "th";
    type: Types;
    ohms?: number | null;
    ohms_unit?: "kΩ" | "MΩ" | "Ω";
    farads?: number | null;
    farads_unit?: "mF" | "nF" | "pF" | "μF";
    voltage_rating?: string;
    tolerance?: string | null;
    forward_voltage?: string | null;
    max_forward_current?: string | null;
    discontinued: boolean;
    supplier_items?: ComponentSupplierItem[];
    user_submitted_status?: "approved" | "pending" | "rejected";
  };
  status: "approved" | "pending" | "rejected";
  quantity: number;
}

// Define the service for fetching suggested components
const useGetSuggestedComponentsForBomListItem = (moduleBomListItemId: string) => {
  const bomItemId = moduleBomListItemId.split("_")[0]; // Extract ID before underscore if present

  const { data, error, isLoading } = useQuery<SuggestedComponent[], Error>({
    enabled: !!bomItemId,
    queryFn: async () => {
      const response = await axios.get(
        `/api/suggested-component/${bomItemId}/`,
        {
          withCredentials: true,
        }
      );
      return response.data;
    },
    queryKey: ["suggestedComponents", bomItemId],
    retry: false,
  });

  return { data, error, isLoading };
};

export default useGetSuggestedComponentsForBomListItem;
