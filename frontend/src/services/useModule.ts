import { Module } from "../types/modules";

import { useQuery } from "@tanstack/react-query";

import axios from "axios";

const useModule = (slug: string) => {
  const { data: module, isLoading: moduleIsLoading, isError: moduleIsError } = useQuery<Module>({
    queryFn: async () => {
      try {
        const response = await axios.get<Module>(`/api/module/${slug}/`, {
          withCredentials: true,
        });
        return response.data;
      } catch (error) {
        console.error("Error fetching data:", error);
        throw new Error("Network response was not ok");
      }
    },
    queryKey: ["module", slug]
  });

  return { module, moduleIsError, moduleIsLoading };
};

export default useModule;
