import axios from "axios";
import { useQuery } from "react-query";

const useGetUserShoppingListTotalQuantity = () => {
  const fetchUserShoppingListTotalQuantity = async () => {
    try {
      const response = await axios.get("/api/shopping-list/total-quantity/");
      return response.data.total_quantity;
    } catch (error) {
      throw new Error(error.response.data.error);
    }
  };

  const queryKey = ["userShoppingListTotalQuantity"];
  const queryOptions = {
    onError: (error) => {
      console.error("Error while fetching total quantity:", error);
    },
  };

  const query = useQuery(queryKey, fetchUserShoppingListTotalQuantity, queryOptions);

  const { data: totalQuantity, isLoading: totalQuantityIsLoading, isError: totalQuantityIsError } = query;

  return { totalQuantity, totalQuantityIsLoading, totalQuantityIsError };
};

export default useGetUserShoppingListTotalQuantity;
