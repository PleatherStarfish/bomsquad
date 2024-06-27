import axios from 'axios';
import removeAfterUnderscore from "../utils/removeAfterUnderscore";
import { useQuery } from "@tanstack/react-query";

const useGetInventoryLocationsMultiple = (componentPks) => {
  // Assuming componentPks is an array of PKs
  const componentPksCleaned = componentPks.map(pk => removeAfterUnderscore(pk));
  
  const fetchComponentLocations = async () => {
    try {
      // Construct query parameters for multiple component PKs
      const queryParams = componentPksCleaned.map(pk => `component_pks=${pk}`).join('&');
      const response = await axios.get(`/api/inventory/locations/?${queryParams}`);
      return response.data; // Ensure to return response.data to align with common usage
    } catch (error) {
      throw new Error(error.response.data.error);
    }
  };

  const { data: inventoryData, isLoading, isError, error } = useQuery({
    queryKey: ['componentLocations', ...componentPksCleaned],
    queryFn: fetchComponentLocations
  });
  
  return { inventoryData, isLoading, isError, error };
};

export default useGetInventoryLocationsMultiple;
