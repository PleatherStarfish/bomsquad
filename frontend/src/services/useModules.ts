import { ModuleFilterParams, ModuleResponse } from '../types/modules'; // Import your types

import axios from 'axios';
import { useInfiniteQuery } from '@tanstack/react-query';

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
  const queryResult = useInfiniteQuery<ModuleResponse, Error>({
    
    getNextPageParam: (lastPage) => lastPage.pagination.nextPage,
    initialPageParam: 1,
    // @ts-expect-error: expected
    queryFn: ({ pageParam = 1 }: { pageParam: number }) => fetchModules({ filters, pageParam }),
    queryKey: ['modules', filters],
  });

  const { data, isLoading, isFetching, isFetchingNextPage, hasNextPage, fetchNextPage, refetch } = queryResult;

  return { data, fetchNextPage, hasNextPage, isFetching, isFetchingNextPage, isLoading, refetch };
};
