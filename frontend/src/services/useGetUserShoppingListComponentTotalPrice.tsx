import { ShoppingListTotalPriceResponse } from "../types/shoppingList"
import axios from "axios";
import removeAfterUnderscore from "../utils/removeAfterUnderscore";
import { useQuery } from "@tanstack/react-query";

const useUserShoppingListComponentTotalPrice = (componentId: string) => {
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
  } = useQuery<ShoppingListTotalPriceResponse, Error>({
    queryFn: fetchUserShoppingListTotalPrice,
    queryKey: ["userShoppingListTotalPrice", componentIdCleaned],
  });

  return { totalPriceData, totalPriceIsError, totalPriceIsLoading };
};

export default useUserShoppingListComponentTotalPrice;
