import { Component } from "../types/component";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";

// Define the function to fetch components by IDs
export const getComponentsByIds = async (componentPks: string[]): Promise<Component[]> => {
  try {
    const response = await axios.get(`/api/components/${componentPks}/`);
    return response.data as Component[];
  } catch (error: any) {
    throw new Error(error.response?.data?.error || "An unexpected error occurred.");
  }
};

// Define the custom hook to use this data
const useGetComponentsByIds = (componentPks: string[]) => {
  const { 
    data: componentsData, 
    isLoading: componentsAreLoading, 
    isError: componentsAreError 
  } = useQuery<Component[], Error>({
    queryKey: ["getComponentsByIds", componentPks],
    queryFn: () => getComponentsByIds(componentPks),
  });

  return { componentsData, componentsAreLoading, componentsAreError };
};

export default useGetComponentsByIds;
