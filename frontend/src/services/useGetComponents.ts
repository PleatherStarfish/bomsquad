import { useQuery, useQueryClient } from "@tanstack/react-query";

import axios from "axios";

// Define the shape of the API response
interface ComponentData {
  results: any[]; // Replace `any[]` with the correct type of components if known
  count: number;
  next: string | null;
  previous: string | null;
  [key: string]: any; // Add additional fields if needed
}

// Define the hook parameters
interface UseGetComponentsParams {
  page?: number;
  search?: string;
  filters?: Record<string, any>; // Replace `any` with specific types for filters if known
  order?: string;
}

// Define the function parameter for refetchComponents
interface RefetchParams {
  newPage?: number;
  newSearch?: string;
  newFilters?: Record<string, any>;
  newOrder?: string;
}

const useGetComponents = ({
  page = 1,
  search,
  filters = {},
  order,
}: UseGetComponentsParams) => {
  const queryClient = useQueryClient();

  const {
    data: componentsData,
    isLoading: componentsAreLoading,
    isError: componentsAreError,
  } = useQuery<ComponentData>({
    queryFn: async () => {
      const response = await axios.get<ComponentData>("/api/components/", {
        params: { page, search, ...filters, order },
      });

      // Deduplicate results by `id`
      const deduplicatedResults = Array.from(
        new Map(response.data.results.map((comp) => [comp.id, comp])).values()
      );

      return {
        ...response.data,
        results: deduplicatedResults,
      };
    },
    queryKey: [
      "getComponents",
      JSON.stringify({ filters, order, page, search }),
    ],
  });

  const refetchComponents = ({
    newPage,
    newSearch,
    newFilters,
    newOrder,
  }: RefetchParams) => {
    const key = [
      "getComponents",
      JSON.stringify({
        filters: newFilters,
        order: newOrder,
        page: newPage,
        search: newSearch,
      }),
    ];
    queryClient.invalidateQueries({ queryKey: key });
  };

  return {
    componentsAreError,
    componentsAreLoading,
    componentsData,
    refetchComponents,
  };
};

export default useGetComponents;
