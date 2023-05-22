import axios from "axios";
import { useQuery } from "@tanstack/react-query";

const useGetUserShoppingListQuantity = (componentPk, moduleBomListItemPk, modulePk) => {
  const fetchUserInventoryQuantity = async () => {
    try {
      const response = await axios.get(
        `/api/shopping-list/${componentPk}/${moduleBomListItemPk}/${modulePk}/component-quantity/`
      );
      return response.data.quantity;
    } catch (error) {
      throw new Error(error.response.data.error);
    }
  };

  return useQuery(
    ["userInventoryQuantity", componentPk, moduleBomListItemPk, modulePk],
    fetchUserInventoryQuantity
  );
};

export default useGetUserShoppingListQuantity;
