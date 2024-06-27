import axios from "axios";
import { useQuery } from "@tanstack/react-query"; // Note the updated import path for v5

const useGetUserShoppingListTotalQuantity = () => {
  const fetchUserShoppingListTotalQuantity = async () => {
    try {
      const response = await axios.get("/api/shopping-list/total-quantity/");
      return response.data.total_quantity;
    } catch (error) {
      throw new Error(error.response.data.error);
    }
  };

  const { data: totalQuantity, isLoading: totalQuantityIsLoading, isError: totalQuantityIsError } = useQuery({
    queryKey: ["userShoppingListTotalQuantity"],
    queryFn: fetchUserShoppingListTotalQuantity,
    onError: (error) => {
      console.error("Error while fetching total quantity:", error);
    },
  });

  return { totalQuantity, totalQuantityIsLoading, totalQuantityIsError };
};

export default useGetUserShoppingListTotalQuantity;
