import { UseQueryResult } from "@tanstack/react-query";

import { useQuery } from "@tanstack/react-query";

import axios from "axios";
import removeAfterUnderscore from "../utils/removeAfterUnderscore";

type UserInventoryQuantityResponse = {
  quantity: number;
};

const useGetUserInventoryQuantity = (
  componentPk: string
): UseQueryResult<number, Error> => {
  const componentPkCleaned = removeAfterUnderscore(componentPk);

  const fetchUserInventoryQuantity = async (): Promise<number> => {
    try {
      const response = await axios.get<UserInventoryQuantityResponse>(
        `/api/inventory/${componentPkCleaned}/component-quantity/`
      );
      return response.data.quantity;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.error || "Error fetching inventory quantity"
      );
    }
  };

  return useQuery<number, Error>({
    queryFn: fetchUserInventoryQuantity,
    queryKey: ["userInventoryQuantity", componentPkCleaned],
  });
};

export default useGetUserInventoryQuantity;
