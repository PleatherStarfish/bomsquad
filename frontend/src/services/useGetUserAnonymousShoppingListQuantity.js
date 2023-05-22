import axios from "axios";
import { useQuery } from "@tanstack/react-query";

const useGetUserAnonymousShoppingListQuantity = (componentPk) => {
  const fetchUserInventoryQuantity = async () => {
    try {
      const response = await axios.get(
        `/api/shopping-list/${componentPk}/component-quantity/`
      );
      return response.data.quantity;
    } catch (error) {
      throw new Error(error.response.data.error);
    }
  };

  return useQuery(
    ["userAnonymousInventoryQuantity", componentPk],
    fetchUserInventoryQuantity
  );
};

export default useGetUserAnonymousShoppingListQuantity;
