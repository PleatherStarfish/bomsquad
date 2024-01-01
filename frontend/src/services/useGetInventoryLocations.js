import axios from 'axios';
import removeAfterUnderscore from "../utils/removeAfterUnderscore";
import { useQuery } from "@tanstack/react-query";

const useGetInventoryLocations = (componentPk) => {
  const componentPkCleaned = removeAfterUnderscore(componentPk);
  
  const fetchComponentLocations = async () => {
    try {
      const locations = await axios.get(`/api/inventory/${componentPkCleaned}/locations/`);
      return locations;
    } catch (error) {
      throw new Error(error.response.data.error);
    }
  };

  const { data, isLoading, isError, error } = useQuery(['componentLocations', componentPkCleaned], fetchComponentLocations);
  
  return { data, isLoading, isError, error };
};

export default useGetInventoryLocations;
