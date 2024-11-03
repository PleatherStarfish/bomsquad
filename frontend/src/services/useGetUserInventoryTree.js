import Cookies from 'js-cookie';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';

// Custom hook to fetch the user's inventory locations as a tree structure
const useGetUserInventoryTree = () => {
  const csrftoken = Cookies.get('csrftoken');

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['userInventoryTree'],
    queryFn: async () => {
      const response = await axios.get('/api/inventory/tree/', {
        headers: {
          'X-CSRFToken': csrftoken,
        },
        withCredentials: true,
      });
      return response.data.inventory_tree;
    },
  });

  return { data, isLoading, isError, error };
};

export default useGetUserInventoryTree;