import { useMutation } from '@tanstack/react-query';
import { useQueryClient } from '@tanstack/react-query';

import axios from 'axios';
import Cookies from 'js-cookie';

export interface InventoryData {
  [componentId: string]: string[];
}

const useAddAllToInventoryMutation = () => {
  const csrftoken = Cookies.get('csrftoken');
  const queryClient = useQueryClient();

  const { mutateAsync, status } = useMutation<any, Error, InventoryData>({
    mutationFn: async (data: InventoryData = {}) => {
      const response = await axios.post(
        `/api/shopping-list/inventory/add/`,
        data,
        {
          headers: {
            'X-CSRFToken': csrftoken, // Include the csrftoken as a header in the request
          },
          withCredentials: true, // Enable sending cookies with CORS requests
        }
      );
      return response.data;
    },
    onError: (error: Error) => {
      // Optionally handle error, perhaps logging or displaying a notification
      console.error('Error adding all to inventory:', error);
    },
    onSuccess: () => {
      // Invalidate and refetch the inventory queries after mutation
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['userShoppingList'] }); // Also update the shopping list view if necessary
    },
  });

  const isPending = status === 'pending';

  return { addAllToInventory: mutateAsync, isPending };
};

export default useAddAllToInventoryMutation;
