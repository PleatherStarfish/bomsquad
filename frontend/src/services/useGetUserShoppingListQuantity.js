import axios from "axios";
import removeAfterUnderscore from "../utils/removeAfterUnderscore";
import { useQuery } from "@tanstack/react-query";

const useGetUserShoppingListQuantity = (componentPk, moduleBomListItemPk, modulePk) => {
  const componentPkCleaned = removeAfterUnderscore(componentPk);
  const moduleBomListItemPkCleaned = removeAfterUnderscore(moduleBomListItemPk);
  const modulePkCleaned = removeAfterUnderscore(modulePk);

  const fetchUserInventoryQuantity = async () => {
    try {
      const response = await axios.get(
        `/api/shopping-list/${componentPkCleaned}/${moduleBomListItemPkCleaned}/${modulePkCleaned}/component-quantity/`
      );
      return response.data.quantity;
    } catch (error) {
      throw new Error(error.response.data.error);
    }
  };

  return useQuery({
    queryKey: ["userInventoryQuantity", componentPkCleaned, moduleBomListItemPkCleaned, modulePkCleaned],
    queryFn: fetchUserInventoryQuantity
  });
};

export default useGetUserShoppingListQuantity;
