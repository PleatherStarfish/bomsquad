import axios from "axios";
import removeAfterUnderscore from "../utils/removeAfterUnderscore";
import { useQuery } from "@tanstack/react-query";

const useGetUserAnonymousShoppingListQuantity = (componentPk) => {

  const componentPkCleaned = removeAfterUnderscore(componentPk)

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

  return useQuery(
    ["userAnonymousInventoryQuantity", componentPkCleaned],
    fetchUserInventoryQuantity
  );
};

export default useGetUserAnonymousShoppingListQuantity;
