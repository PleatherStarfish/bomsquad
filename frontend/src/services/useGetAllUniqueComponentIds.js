import axios from 'axios';
import { useQuery } from '@tanstack/react-query';

// Custom hook to fetch all unique component IDs
const useGetAllUniqueComponentIds = () => {
  const fetchAllUniqueComponentIds = async () => {
    try {
      // Ensure the request includes credentials (like cookies) for authentication
      const response = await axios.get('/api/shopping-list/unique-components/', {
        withCredentials: true,
      });
      return response.data; // Assuming the API returns an array of component IDs
    } catch (error) {
      throw new Error(error.response?.data?.error || 'An error occurred while fetching the data.');
    }
  };

  const { data: uniqueComponentIds, isLoading, isError } = useQuery({
    queryKey: ['uniqueComponentIds'],
    queryFn: fetchAllUniqueComponentIds,
    onError: (error) => {
      console.error('Error while fetching unique component IDs:', error);
    }
  });

  return { uniqueComponentIds, isLoading, isError };
};

export default useGetAllUniqueComponentIds;
