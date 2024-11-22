import { ShoppingListTotalPriceResponse } from "../types/shoppingList"
import axios from "axios";
import { useQuery } from "@tanstack/react-query";

// Define the custom hook
const useGetUserShoppingListTotalPrice = () => {
  // Fetch function with response type
  const fetchUserShoppingListTotalPrice = async (): Promise<ShoppingListTotalPriceResponse> => {
    try {
      const response = await axios.get<ShoppingListTotalPriceResponse>(`/api/shopping-list/total-price/`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "An unknown error occurred");
    }
  };

  // React Query setup
  const {
    data: totalPriceData,
    isLoading: totalPriceIsLoading,
    isError: totalPriceIsError,
  } = useQuery<ShoppingListTotalPriceResponse, Error>({
    queryFn: fetchUserShoppingListTotalPrice,
    queryKey: ["userShoppingListTotalPrice"],
  });

  return { totalPriceData, totalPriceIsError, totalPriceIsLoading };
};

export default useGetUserShoppingListTotalPrice;
