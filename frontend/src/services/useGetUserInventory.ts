import { Component } from "../types/component";
import { UseQueryResult } from "@tanstack/react-query";

import { useQuery } from "@tanstack/react-query";

import axios from "axios";

interface InventoryItem {
  id: string;
  user: number;
  component: Component;
  quantity: number;
  location: string[] | null;
}

type FetchInventoryResponse = InventoryItem[];

/**
 * Custom React Query hook to fetch user inventory data.
 * This hook communicates with the `/api/inventory/` endpoint to retrieve the user's inventory.
 */
const useGetUserInventory = (): {
  inventoryData: FetchInventoryResponse | undefined;
  inventoryDataIsLoading: boolean;
  inventoryDataIsError: boolean;
} => {
  // Function to fetch inventory data from the API
  const fetchData = async (): Promise<FetchInventoryResponse> => {
    const { data } = await axios.get<FetchInventoryResponse>("/api/inventory/", {
      withCredentials: true, // Include credentials (e.g., cookies) in the request
    });
    return data;
  };

  // React Query integration
  const {
    data: inventoryData,
    isLoading: inventoryDataIsLoading,
    isError: inventoryDataIsError,
  }: UseQueryResult<FetchInventoryResponse, Error> = useQuery({
    queryFn: fetchData,
    queryKey: ["inventory"], // Unique query key for caching and invalidation
  });

  return { inventoryData, inventoryDataIsError, inventoryDataIsLoading };
};

export default useGetUserInventory;
