import axios from "axios";
import { useQuery } from "@tanstack/react-query";

const useGetUserShoppingListTotalPrice = () => {
  const fetchUserShoppingListTotalPrice = async () => {
    try {
      const response = await axios.get(
        `/api/shopping-list/total-price/`
      );
      return response.data.total_price;
    } catch (error) {
      throw new Error(error.response.data.error);
    }
  };

  const queryKey = ["userShoppingListTotalPrice"];
  const queryOptions = {
    onError: (error) => {
      console.error("Error while fetching total price:", error);
    },
  };

  const query = useQuery(queryKey, fetchUserShoppingListTotalPrice, queryOptions);

  const { data: totalPrice, isLoading: totalPriceIsLoading, isError: totalPriceIsError } = query;

  return { totalPrice, totalPriceIsLoading, totalPriceIsError };
};

export default useGetUserShoppingListTotalPrice;
