import axios from "axios";
import removeAfterUnderscore from "../utils/removeAfterUnderscore";
import { useQuery } from "@tanstack/react-query";

const useGetUserAnonymousShoppingListQuantity = (componentPk) => {
  const componentPkCleaned = removeAfterUnderscore(componentPk);

  const fetchUserInventoryQuantity = async () => {
    try {
      const response = await axios.get(
        `/api/shopping-list/${componentPkCleaned}/component-quantity/`
      );
      return response.data.quantity;
    } catch (error) {
      throw new Error(error.response.data.error);
    }
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ["userAnonymousInventoryQuantity", componentPkCleaned],
    queryFn: fetchUserInventoryQuantity,
    // Only run the query if componentPkCleaned is not null/undefined
    enabled: !!componentPkCleaned
  });

  // Return data along with isLoading and isError states
  return { data, isLoading, isError };
};

export default useGetUserAnonymousShoppingListQuantity;
