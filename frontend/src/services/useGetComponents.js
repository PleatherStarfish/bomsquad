import { useQuery, useQueryClient } from "@tanstack/react-query";

import axios from "axios";

const useGetComponents = ({page = 1, search, filters, order}) => {
  const queryClient = useQueryClient();

  const query = useQuery(["getComponents", page, search, filters, order], async () => {
    const response = await axios.get("/api/components/", {
      params: { page, search, ...filters, order },
    });

    return response.data;
  });

  const {
    data: componentsData,
    isLoading: componentsAreLoading,
    isError: componentsAreError,
  } = query;

  // Function to trigger a new GET request with new parameters
  const refetchComponents = ({newPage, newSearch, newFilters, newOrder}) => {
    queryClient.invalidateQueries(["getComponents", newPage, newSearch, newFilters, newOrder]);
  };

  return { componentsData, componentsAreLoading, componentsAreError, refetchComponents };
};

export default useGetComponents;