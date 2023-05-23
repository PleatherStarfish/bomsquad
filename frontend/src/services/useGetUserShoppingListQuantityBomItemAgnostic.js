import axios from "axios";
import { useQuery } from "@tanstack/react-query";

const useGetUserShoppingListQuantityBomItemAgnostic = (componentPk, modulePk) => {
  const fetchUserInventoryQuantity = async () => {
    try {
      const response = await axios.get(
        `/api/shopping-list/${componentPk}/${modulePk}/component-quantity/`
      );
      return response.data.quantity;
    } catch (error) {
      throw new Error(error.response.data.error);
    }
  };

  return useQuery(
    ["userInventoryQuantity", componentPk, modulePk],
    fetchUserInventoryQuantity
  );
};

export default useGetUserShoppingListQuantityBomItemAgnostic;
