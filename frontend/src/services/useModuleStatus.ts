import { UseQueryResult } from '@tanstack/react-query';

import { useQuery } from '@tanstack/react-query';

import axios from 'axios';
import Cookies from 'js-cookie';
import removeAfterUnderscore from '../utils/removeAfterUnderscore';

interface ModuleStatusResponse {
  is_built: boolean;
  is_wtb: boolean;
}

interface UseModuleStatusReturn {
  data: ModuleStatusResponse | undefined;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  refetch: () => Promise<UseQueryResult<ModuleStatusResponse, unknown>>;
}

const useModuleStatus = (moduleId: string, p0: boolean): UseModuleStatusReturn => {
  const csrftoken = Cookies.get('csrftoken');
  const moduleIdCleaned = removeAfterUnderscore(moduleId);

  const fetchModuleStatus = async (): Promise<ModuleStatusResponse> => {
    try {
      const response = await axios.get<ModuleStatusResponse>(`/api/module-status/${moduleIdCleaned}/`, {
        headers: {
          'X-CSRFToken': csrftoken || '',
        },
        withCredentials: true,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'An unknown error occurred');
    }
  };

  const { data, isLoading, isError, error, refetch } = useQuery<ModuleStatusResponse>({
    enabled: Boolean(csrftoken),
    queryFn: fetchModuleStatus,
    queryKey: ['moduleStatus', moduleIdCleaned], // Only run the query if csrftoken is present
  });

  return { data, error, isError, isLoading, refetch };
};

export default useModuleStatus;
