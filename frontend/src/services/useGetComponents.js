import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const useGetComponents = (page = 1, search, filters, order) => {
  const query = useQuery(["getComponents", page, search, filters, order], async () => {
    const response = await axios.get("/api/components/", {
      params: { page, search, filters, order },
    });

    return response.data;
  });

  const {
    data: componentsData,
    isLoading: componentsAreLoading,
    isError: componentsAreError,
  } = query;

  return { componentsData, componentsAreLoading, componentsAreError };
};

export default useGetComponents;
