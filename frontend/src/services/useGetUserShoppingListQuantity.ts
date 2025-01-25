import { useQuery } from "@tanstack/react-query";

import axios from "axios";
import removeAfterUnderscore from "../utils/removeAfterUnderscore";

type FetchUserInventoryQuantityResponse = {
  quantity: number;
};

// Define a discriminated union for function arguments
type Anonymous = {
  type: "anonymous";
  componentPk: string;
};

type NotAnonymous = {
  type: "notAnonymous";
  componentPk: string;
  modulebomlistitemPk: string;
  modulePk: string;
};

type UseGetUserShoppingListQuantityArgs = Anonymous | NotAnonymous;

/**
 * Custom React Query hook to fetch the quantity of a component in the user's shopping list.
 *
 * This hook communicates with the `/api/shopping-list/:componentPk/component-quantity/` endpoint
 * for anonymous cases, or its extended form `/api/shopping-list/:componentPk/:modulebomlistitemPk/:modulePk/component-quantity/`
 * for cases associated with specific modules.
 *
 * The endpoint supports:
 * 1. Fetching the quantity of a specific component in an anonymous user's shopping list.
 * 2. Fetching the quantity of a component linked to a module and BOM list item for authenticated users.
 *
 * Query keys ensure caching and invalidation behave correctly based on the combination of arguments provided.
 */
const useGetUserShoppingListQuantity = (
  args: UseGetUserShoppingListQuantityArgs
) => {
  // Clean component ID and optional module identifiers based on input type
  const componentPkCleaned = removeAfterUnderscore(args.componentPk);

  const moduleBomListItemPkCleaned =
    args.type === "notAnonymous"
      ? removeAfterUnderscore(args.modulebomlistitemPk)
      : null;

  const modulePkCleaned =
    args.type === "notAnonymous"
      ? removeAfterUnderscore(args.modulePk)
      : null;

  // API call function
  const fetchUserInventoryQuantity = async (): Promise<number> => {
    if (!componentPkCleaned) {
      throw new Error("Missing component identifier.");
    }

    // Build API URL dynamically based on input type
    const url =
      args.type === "notAnonymous"
        ? `/api/shopping-list/${componentPkCleaned}/${moduleBomListItemPkCleaned}/${modulePkCleaned}/component-quantity/`
        : `/api/shopping-list/${componentPkCleaned}/component-quantity/`;

    const response = await axios.get<FetchUserInventoryQuantityResponse>(url);
    return response.data.quantity;
  };

  // React Query integration for data fetching
  return useQuery<number, Error>({
    enabled: !!componentPkCleaned, // Ensure query only runs when a valid component ID is provided
    queryFn: fetchUserInventoryQuantity, // Function to fetch the data
    queryKey: [
      "userInventoryQuantity", // Query key for caching and invalidation with partial match
      componentPkCleaned
    ],
  });
};

export default useGetUserShoppingListQuantity;
