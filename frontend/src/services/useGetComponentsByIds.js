import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const getComponentsByIds = async (componentPks) => {
  try {
    const response = await axios.get(`/api/components/${componentPks}/`); // Update URL to include componentPks as part of the URL
    return response.data;
  } catch (error) {
    throw new Error(error.response.data.error);
  }
};

const useGetComponentsByIds = (componentPks) => {
  const queryKey = ["getComponentsByIds", componentPks];
  const queryOptions = {
    onError: (error) => {
      console.error("Error while fetching components:", error);
    },
  };
  const query = useQuery(queryKey, () => getComponentsByIds(componentPks), queryOptions);
  
  const { data: componentsData, isLoading: componentsAreLoading, isError: componentsAreError } = query;
  
  return { componentsData, componentsAreLoading, componentsAreError };
};

export default useGetComponentsByIds;