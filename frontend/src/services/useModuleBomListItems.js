import axios from 'axios';
import removeAfterUnderscore from "../utils/removeAfterUnderscore";
import { useQuery } from "@tanstack/react-query";

const useGetModuleBomListItems = (moduleId) => {
  
  const moduleIdCleaned = removeAfterUnderscore(moduleId)

  const { data: moduleBom, isLoading: moduleBomIsLoading, isError: moduleBomIsError } = useQuery({
    queryKey: ['moduleBomListItems', moduleId],
    queryFn: async () => {
      try {
        const response = await axios.get(`/api/module/${moduleIdCleaned}/bom-list-items/`);
        return response.data;
      } catch (error) {
        console.error("Error fetching data:", error);
        throw new Error("Network response was not ok");
      }
    }
  });

  return { moduleBom, moduleBomIsLoading, moduleBomIsError };
};

export default useGetModuleBomListItems;
