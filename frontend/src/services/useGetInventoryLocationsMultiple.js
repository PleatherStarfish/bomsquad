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
      const locations = await axios.get(`/api/inventory/locations/?${queryParams}`);
      return locations;
    } catch (error) {
      throw new Error(error.response.data.error);
    }
  };

  const { data: inventoryData, isLoading, isError, error } = useQuery(['componentLocations', ...componentPksCleaned], fetchComponentLocations);
  
  return { inventoryData, isLoading, isError, error };
};

export default useGetInventoryLocationsMultiple;
