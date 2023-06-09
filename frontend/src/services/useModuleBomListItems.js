import { useQuery } from "@tanstack/react-query";
import axios from 'axios';

const useModuleBomListItems = (moduleId) => {
  const { data: moduleBom, isLoading: moduleBomIsLoading, isError: moduleBomIsError } = useQuery(['moduleBomListItems', moduleId], async () => {
    try {
      const response = await axios.get(
        `/api/module/${moduleId}/bom-list-items/`);
      return response.data;
    } catch (error) {
      console.error("Error fetching data:", error);
      throw new Error("Network response was not ok");
    }
  });

  return { moduleBom, moduleBomIsLoading, moduleBomIsError };
};

export default useModuleBomListItems;