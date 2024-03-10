import { useMutation, useQueryClient } from '@tanstack/react-query';

import Cookies from 'js-cookie';
import axios from 'axios';

const useAddAllToInventoryMutation = () => {
  const csrftoken = Cookies.get('csrftoken');
  const queryClient = useQueryClient(); // Get queryClient instance

  return useMutation(
    // Accept optional data parameter
    async (data = {}) => {
      console.log("data", data)
      const response = await axios.post(`/api/shopping-list/inventory/add/`, data, {
        headers: {
          'X-CSRFToken': csrftoken, // Include the csrftoken as a header in the request
        },
        withCredentials: true, // enable sending cookies with CORS requests
      });
      return response.data;
    },
    {
      // Use onSuccess to invalidate and refetch the related query after mutation
      onSuccess: () => {
        queryClient.invalidateQueries('inventory');
        queryClient.refetchQueries('inventory');
      },
    }
  );
};

export default useAddAllToInventoryMutation;