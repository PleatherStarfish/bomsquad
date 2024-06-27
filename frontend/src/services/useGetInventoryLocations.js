import axios from 'axios';
import removeAfterUnderscore from "../utils/removeAfterUnderscore";
import { useQuery } from "@tanstack/react-query";

const useGetInventoryLocations = (componentPk) => {
  const componentPkCleaned = removeAfterUnderscore(componentPk);
  
  const fetchComponentLocations = async () => {
    try {
      const response = await axios.get(`/api/inventory/${componentPkCleaned}/locations/`);
      return response.data;  // Ensure to return response.data to align with common usage
    } catch (error) {
      throw new Error(error.response.data.error);
    }
  };

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['componentLocations', componentPkCleaned],
    queryFn: fetchComponentLocations
  });
  
  return { data, isLoading, isError, error };
};

export default useGetInventoryLocations;
