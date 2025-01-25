import { ShoppingListTotalPriceResponse } from "../types/shoppingList";
import { UseQueryResult } from "@tanstack/react-query";

import { useQuery } from "@tanstack/react-query";

import axios from "axios";
import removeAfterUnderscore from "../utils/removeAfterUnderscore";

const useGetUserShoppingListComponentTotalPrice = (
  componentId: string
): {
  totalPriceData: ShoppingListTotalPriceResponse | undefined;
  totalPriceIsLoading: boolean;
  totalPriceIsError: boolean;
  refetch: UseQueryResult<ShoppingListTotalPriceResponse, Error>["refetch"];
} => {
  const componentIdCleaned = removeAfterUnderscore(componentId);

  // Fetch function to get the total price data for a component
  const fetchUserShoppingListTotalPrice = async (): Promise<ShoppingListTotalPriceResponse> => {
    try {
      const response = await axios.get<ShoppingListTotalPriceResponse>(
        `/api/shopping-list/${componentIdCleaned}/total-price/`
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "An unknown error occurred.");
    }
  };

  // Use React Query to fetch and manage the data
  const {
    data: totalPriceData,
    isLoading: totalPriceIsLoading,
    isError: totalPriceIsError,
    refetch,
  } = useQuery<ShoppingListTotalPriceResponse, Error>({
    queryFn: fetchUserShoppingListTotalPrice,
    queryKey: ["userShoppingListTotalPrice", componentIdCleaned],
  });

  return { refetch, totalPriceData, totalPriceIsError, totalPriceIsLoading };
};

export default useGetUserShoppingListComponentTotalPrice;
