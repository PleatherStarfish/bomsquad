import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const useGetUserInventory = () => {
  const fetchData = async () => {
    const { data } = await axios.get("/api/inventory/", {
      withCredentials: true,
    });
    return data;
  };

  const {
    data: inventoryData,
    isLoading: inventoryDataIsLoading,
    isError: inventoryDataIsError,
  } = useQuery(["inventory"], fetchData);

  return { inventoryData, inventoryDataIsLoading, inventoryDataIsError };
};

export default useGetUserInventory;
