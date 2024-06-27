import axios from "axios";
import { useQuery } from "@tanstack/react-query";

const useGetUserShoppingListTotalPrice = () => {
  const fetchUserShoppingListTotalPrice = async () => {
    try {
      const response = await axios.get(`/api/shopping-list/total-price/`);
      return response.data.total_price;
    } catch (error) {
      throw new Error(error.response.data.error);
    }
  };

  const { data: totalPrice, isLoading: totalPriceIsLoading, isError: totalPriceIsError } = useQuery({
    queryKey: ["userShoppingListTotalPrice"],
    queryFn: fetchUserShoppingListTotalPrice,
    onError: (error) => {
      console.error("Error while fetching total price:", error);
    },
  });

  return { totalPrice, totalPriceIsLoading, totalPriceIsError };
};

export default useGetUserShoppingListTotalPrice;
