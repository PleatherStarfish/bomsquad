import axios from "axios";
import { useQuery } from "@tanstack/react-query";

export const getComponentsByIds = async (componentPks) => {
  
  try {
    const response = await axios.get(`/api/components/${componentPks}/`); // Update URL to include componentPks as part of the URL
    return response.data;
  } catch (error) {
    throw new Error(error.response.data.error);
  }
};

const useGetComponentsByIds = (componentPks) => {

  const { data: componentsData, isLoading: componentsAreLoading, isError: componentsAreError } = useQuery({
    queryKey: ["getComponentsByIds", componentPks],
    queryFn: () => getComponentsByIds(componentPks),
    onError: (error) => {
      console.error("Error while fetching components:", error);
    },
  });

  return { componentsData, componentsAreLoading, componentsAreError };
};

export default useGetComponentsByIds;
