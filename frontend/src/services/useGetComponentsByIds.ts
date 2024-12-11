import { Component } from "../types/component";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";

// Helper function to chunk an array
const chunkArray = <T>(array: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

// Function to fetch components in chunks
export const getComponentsByIds = async (componentPks: string[], chunkSize = 20): Promise<Component[]> => {
  try {
    // Split the input array into chunks
    const chunks = chunkArray(componentPks, chunkSize);

    // Fetch each chunk and wait for all requests to complete
    const responses = await Promise.all(
      chunks.map(chunk => axios.get(`/api/components/${chunk}/`))
    );

    // Combine all responses into a single array
    const combinedData: Component[] = responses.flatMap(response => response.data as Component[]);
    return combinedData;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || "An unexpected error occurred.");
  }
};

// Custom hook to use the fetched data
const useGetComponentsByIds = (componentPks: string[], chunkSize = 50) => {
  const {
    data: componentsData,
    isLoading: componentsAreLoading,
    isError: componentsAreError
  } = useQuery<Component[], Error>({
    queryFn: () => getComponentsByIds(componentPks, chunkSize),
    queryKey: ["getComponentsByIds", componentPks],
  });

  return { componentsAreError, componentsAreLoading, componentsData };
};

export default useGetComponentsByIds;
