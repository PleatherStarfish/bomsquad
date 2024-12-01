import axios from 'axios';
import { useQuery } from '@tanstack/react-query';

// Define the type for the data returned by the API
type UniqueComponentIdsResponse = string[]; // Assuming the API returns an array of strings

// Custom hook to fetch all unique component IDs
const useGetAllUniqueComponentIds = () => {
  const fetchAllUniqueComponentIds = async (): Promise<UniqueComponentIdsResponse> => {
    try {
      // Ensure the request includes credentials (like cookies) for authentication
      const response = await axios.get<UniqueComponentIdsResponse>(
        '/api/shopping-list/unique-components/',
        {
          withCredentials: true,
        }
      );
      return response.data;
    } catch (error: any) {
      // Use proper type for error (e.g., AxiosError) if needed
      throw new Error(error.response?.data?.error || 'An error occurred while fetching the data.');
    }
  };

  const { data: uniqueComponentIds, isLoading, isError } = useQuery<UniqueComponentIdsResponse, Error>({
    queryFn: fetchAllUniqueComponentIds,
    queryKey: ['uniqueComponentIds'],
  });

  return { isError, isLoading, uniqueComponentIds };
};

export default useGetAllUniqueComponentIds;
