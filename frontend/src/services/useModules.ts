import { ModuleFilterParams, ModuleResponse } from '../types/modules'; // Import your types
import { UseInfiniteQueryResult, useInfiniteQuery } from '@tanstack/react-query';

import axios from 'axios';

// Fetch modules function
export const fetchModules = async ({
  pageParam = 1,
  filters,
}: {
  pageParam: number;
  filters: ModuleFilterParams;
}): Promise<ModuleResponse> => {
  axios.defaults.xsrfCookieName = 'csrftoken';
  axios.defaults.xsrfHeaderName = 'X-CSRFToken';
  
  const response = await axios.post<ModuleResponse>('/api/modules-infinite/', {
    ...filters,
    page: pageParam,
    withCredentials: true
  });

  return response.data;
};

export const useModules = (filters: ModuleFilterParams) => {
  return useInfiniteQuery<ModuleResponse, Error>({
    queryKey: ['modules', filters],
    // @ts-ignore
    queryFn: ({ pageParam = 1 }: {pageParam: number}) => fetchModules({ pageParam, filters }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.pagination.nextPage,
  });
};
