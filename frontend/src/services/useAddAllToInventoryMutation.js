import { useMutation, useQueryClient } from '@tanstack/react-query';

import Cookies from 'js-cookie';
import axios from 'axios';

const useAddAllToInventoryMutation = () => {
  const csrftoken = Cookies.get('csrftoken');
  const queryClient = useQueryClient();

  const { mutateAsync: addAllToInventory, isPending } = useMutation({
    mutationFn: async (data = {}) => {
      const response = await axios.post(`/api/shopping-list/inventory/add/`, data, {
        headers: {
          'X-CSRFToken': csrftoken, // Include the csrftoken as a header in the request
        },
        withCredentials: true, // enable sending cookies with CORS requests
      });
      return response.data;
    },
    onError: (error) => {
      // Optionally handle error, perhaps logging or displaying a notification
      console.error('Error adding all to inventory:', error);
    },
    onSuccess: () => {
      // Invalidate and refetch the inventory queries after mutation
      queryClient.invalidateQueries(['inventory']);
      queryClient.invalidateQueries(['userShoppingList']); // Added if you want to also update the shopping list view
    }
  });

  return { addAllToInventory, isPending };
};

export default useAddAllToInventoryMutation;
