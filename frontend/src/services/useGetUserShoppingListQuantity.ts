import axios from "axios";
import removeAfterUnderscore from "../utils/removeAfterUnderscore";
import { useQuery } from "@tanstack/react-query";

type FetchUserInventoryQuantityResponse = {
  quantity: number;
};

const useGetUserShoppingListQuantity = (
  componentPk: string,
  moduleBomListItemPk: string,
  modulePk: string
) => {
  const componentPkCleaned = removeAfterUnderscore(componentPk);
  const moduleBomListItemPkCleaned = removeAfterUnderscore(moduleBomListItemPk);
  const modulePkCleaned = removeAfterUnderscore(modulePk);

  const fetchUserInventoryQuantity = async (): Promise<number> => {
    try {
      const response = await axios.get<FetchUserInventoryQuantityResponse>(
        `/api/shopping-list/${componentPkCleaned}/${moduleBomListItemPkCleaned}/${modulePkCleaned}/component-quantity/`
      );
      return response.data.quantity;
    } catch (error: any) {
      // Use proper type for error (e.g., AxiosError) if needed
      throw new Error(error.response?.data?.error || "Error fetching data");
    }
  };

  return useQuery<number, Error>({
    queryFn: fetchUserInventoryQuantity,
    queryKey: ["userInventoryQuantity", componentPkCleaned, moduleBomListItemPkCleaned, modulePkCleaned],
  });
};

export default useGetUserShoppingListQuantity;
