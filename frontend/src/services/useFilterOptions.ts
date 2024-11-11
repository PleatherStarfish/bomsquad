import { FilterOptions } from "../types/modules";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";

const fetchFilterOptions = async (): Promise<FilterOptions> => {
  axios.defaults.xsrfCookieName = 'csrftoken';
  axios.defaults.xsrfHeaderName = 'X-CSRFToken';
  const response = await axios.get("/api/filter-options/");
  return response.data;
};

const useFilterOptions = () => {
  return useQuery<FilterOptions, Error>({
    queryKey: ["filterOptions"],
    queryFn: fetchFilterOptions,
  });
};

export default useFilterOptions;
