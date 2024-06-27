import { useQuery, useQueryClient } from "@tanstack/react-query";

import axios from "axios";

const useGetComponents = ({ page = 1, search, filters, order }) => {
  const queryClient = useQueryClient();

  const { data: componentsData, isLoading: componentsAreLoading, isError: componentsAreError } = useQuery({
    queryKey: ["getComponents", page, search, filters, order],
    queryFn: async () => {
      const response = await axios.get("/api/components/", {
        params: { page, search, ...filters, order },
      });
      return response.data;
    }
  });

  // Function to trigger a new GET request with new parameters
  const refetchComponents = ({newPage, newSearch, newFilters, newOrder}) => {
    queryClient.invalidateQueries({
      queryKey: ["getComponents", newPage, newSearch, newFilters, newOrder]
    });
  };

  return { componentsData, componentsAreLoading, componentsAreError, refetchComponents };
};

export default useGetComponents;
