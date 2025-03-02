import { UseQueryResult } from "@tanstack/react-query";

import { useQuery } from "@tanstack/react-query";

import axios from "axios";
import removeAfterUnderscore from "../utils/removeAfterUnderscore";

/**
 * Custom React Query hook to fetch the shopping list quantity for an anonymous user.
 * 
 * @param componentPk - The primary key (ID) of the component.
 * @returns A React Query result containing the component quantity in the shopping list.
 */
const useGetUserAnonymousShoppingListQuantity = (componentPk: string): UseQueryResult<number, Error> => {
  // Ensure `componentPk` is cleaned up before use
  const componentPkCleaned = removeAfterUnderscore(String(componentPk));

  return useQuery<number, Error>({
    enabled: !!componentPkCleaned,  
    queryFn: async () => {
      try {
        const response = await axios.get<{ quantity: number }>(
          `/api/shopping-list/${componentPkCleaned}/component-quantity/`
        );
        return response.data.quantity; // Ensuring return type is `number`
      } catch (error: any) {
        throw new Error(error.response?.data?.error || "Unknown error");
      }
    },
    queryKey: ["userAnonymousInventoryQuantity", componentPkCleaned],
  });
};

export default useGetUserAnonymousShoppingListQuantity;
