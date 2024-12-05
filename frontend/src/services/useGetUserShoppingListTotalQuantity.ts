import { useQuery } from "@tanstack/react-query";

import axios from "axios";

interface FetchError {
  response?: {
    data?: {
      error: string;
    };
  };
}

const useGetUserShoppingListTotalQuantity = () => {
  const fetchUserShoppingListTotalQuantity = async (): Promise<number> => {
    try {
      const response = await axios.get<{ total_quantity: number }>("/api/shopping-list/total-quantity/");
      return response.data.total_quantity;
    } catch (error) {
      const typedError = error as FetchError;
      throw new Error(typedError.response?.data?.error || "An unknown error occurred.");
    }
  };

  const {
    data: totalQuantity,
    isLoading: totalQuantityIsLoading,
    isError: totalQuantityIsError,
  } = useQuery<number, Error>({
    queryFn: fetchUserShoppingListTotalQuantity,
    queryKey: ["userShoppingListTotalQuantity"],
  });

  return { totalQuantity, totalQuantityIsError, totalQuantityIsLoading };
};

export default useGetUserShoppingListTotalQuantity;
