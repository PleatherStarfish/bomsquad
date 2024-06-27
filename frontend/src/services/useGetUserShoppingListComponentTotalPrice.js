import axios from "axios";
import removeAfterUnderscore from "../utils/removeAfterUnderscore";
import { useQuery } from "@tanstack/react-query";

const useUserShoppingListTotalPrice = (componentId) => {
    
  const componentIdCleaned = removeAfterUnderscore(componentId);

  const fetchUserShoppingListTotalPrice = async () => {
    try {
      const response = await axios.get(`/api/shopping-list/${componentIdCleaned}/total-price/`);
      return response.data.total_price;
    } catch (error) {
      throw new Error(error.response.data.error);
    }
  };

  const { data: totalPrice, isLoading: totalPriceIsLoading, isError: totalPriceIsError } = useQuery({
    queryKey: ["userShoppingListTotalPrice", componentIdCleaned],
    queryFn: fetchUserShoppingListTotalPrice,
    onError: (error) => {
      console.error("Error while fetching total price:", error);
    }
  });

  return { totalPrice, totalPriceIsLoading, totalPriceIsError };
};

export default useUserShoppingListTotalPrice;
