import { useMutation } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";

import axios from "axios";
import Cookies from "js-cookie";
import removeAfterUnderscore from "../utils/removeAfterUnderscore";

// Define the structure of supplier items
type SupplierItem = {
  currency: string;
  link?: string;
  price: number;
  supplier: string; // UUID
  supplier_item_no: string;
};

// Define the structure for component data
type ComponentData = {
  component: {
    farads: number | null;
    manufacturer: string; // UUID
    manufacturer_part_no: string;
    mounting_style: "smt" | "th";
    tolerance: string | null;
    type: string; // UUID
    voltage_rating: string | null;
    wattage: string | null;
  };
  supplier_items: SupplierItem[];
};

// Union type to enforce mutually exclusive properties
type SuggestComponentPayload =
  | {
      moduleBomListItemId: string;
      componentData: ComponentData;
    }
  | {
      moduleBomListItemId: string;
      componentId: string;
    };

const useSuggestComponentForBomListItem = () => {
  const csrftoken = Cookies.get("csrftoken");
  const queryClient = useQueryClient();

  const { mutateAsync: suggestComponent, isPending } = useMutation({
    mutationFn: async (payload: SuggestComponentPayload) => {
      const { moduleBomListItemId, componentId, componentData } =
        payload as any;

      const requestPayload: Record<string, any> = {};

      if (componentId) {
        requestPayload.component_id = componentId;
      } else if (componentData) {
        requestPayload.component_data = componentData;
      } else {
        throw new Error(
          "Either componentId or componentData must be provided."
        );
      }

      const bomItemId = removeAfterUnderscore(moduleBomListItemId)
      console.log(bomItemId)

      const response = await axios.post(
        `/api/suggested-component/${bomItemId}/add/`,
        requestPayload,
        {
          headers: {
            "X-CSRFToken": csrftoken,
          },
          withCredentials: true,
        }
      );

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["moduleBomListItem"] });
      queryClient.invalidateQueries({ queryKey: ["suggestedComponents"] });
    },
  });

  return { isPending, suggestComponent };
};

export default useSuggestComponentForBomListItem;
