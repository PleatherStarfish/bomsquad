import { MutationFunction, useMutation, useQueryClient } from '@tanstack/react-query';

import Cookies from 'js-cookie';
import axios from 'axios';
import removeAfterUnderscore from "../utils/removeAfterUnderscore";

// Define the argument type for the mutation function
interface DeleteShoppingListItemArgs {
  module_pk?: string;
}

const useDeleteShoppingListItem = () => {
  const csrftoken = Cookies.get('csrftoken');
  const queryClient = useQueryClient();

  // Define the mutation function
  const deleteMutationFn: MutationFunction<void, DeleteShoppingListItemArgs> = async ({
    module_pk,
  }) => {
    const module_pkCleaned = module_pk ? removeAfterUnderscore(module_pk) : null;

    if (module_pkCleaned) {
      await axios.delete(`/api/shopping-list/${module_pkCleaned}/delete/`, {
        headers: {
          'X-CSRFToken': csrftoken || '',
        },
        withCredentials: true,
      });
    } else {
      await axios.delete(`/api/shopping-list/delete-anonymous/`, {
        headers: {
          'X-CSRFToken': csrftoken || '',
        },
        withCredentials: true,
      });
    }
  };

  // Use the mutation with the specified types
  const deleteMutation = useMutation<void, unknown, DeleteShoppingListItemArgs>({
    mutationFn: deleteMutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['userShoppingList']});
    },
  });

  return deleteMutation;
};

export default useDeleteShoppingListItem;
