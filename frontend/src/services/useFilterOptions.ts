import { FilterOptions } from "../types/modules";

import { useQuery } from "@tanstack/react-query";

import axios from "axios";

const fetchFilterOptions = async (): Promise<FilterOptions> => {
  axios.defaults.xsrfCookieName = 'csrftoken';
  axios.defaults.xsrfHeaderName = 'X-CSRFToken';
  const response = await axios.get("/api/filter-options/");
  return response.data;
};

const useFilterOptions = () => {
  return useQuery<FilterOptions, Error>({
    queryFn: fetchFilterOptions,
    queryKey: ["filterOptions"],
  });
};

export default useFilterOptions;
