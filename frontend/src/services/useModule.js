import axios from "axios";
import { useQuery } from "@tanstack/react-query";

const useModule = (slug) => {
  const { data: module, isLoading: moduleIsLoading, isError: moduleIsError } = useQuery({
    queryKey: ["module", slug],
    queryFn: async () => {
      try {
        const response = await axios.get(`/api/module/${slug}/`, {
          withCredentials: true,
        });
        return response.data;
      } catch (error) {
        console.error("Error fetching data:", error);
        throw new Error("Network response was not ok");
      }
    }
  });

  return { module, moduleIsLoading, moduleIsError };
};

export default useModule;
