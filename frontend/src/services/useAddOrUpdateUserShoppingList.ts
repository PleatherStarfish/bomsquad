import { useMutation } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";

import axios from "axios";
import Cookies from "js-cookie";
import removeAfterUnderscore from "../utils/removeAfterUnderscore";

// Define the mutation variables structure
type MutationVariables = {
  componentId: string;
  modulebomlistitem_pk: string;
  module_pk: string;
  quantity: number;
};

const useAddOrUpdateUserShoppingList = () => {
  const csrftoken = Cookies.get("csrftoken") || ""; // CSRF token
  const queryClient = useQueryClient(); // React Query client

  return useMutation({
    mutationFn: async ({ componentId, modulebomlistitem_pk, module_pk, quantity }: MutationVariables) => {
      // Clean component and module keys
      const componentIdCleaned = removeAfterUnderscore(componentId);
      const moduleBomListItemPkCleaned = removeAfterUnderscore(modulebomlistitem_pk);

      // Make the API request
      return axios.post(
        `/api/shopping-list/${componentIdCleaned}/create-or-update/`,
        {
          module_pk,
          modulebomlistitem_pk: moduleBomListItemPkCleaned,
          quantity,
        },
        {
          headers: {
            "X-CSRFToken": csrftoken,
          },
          withCredentials: true,
        }
      );
    },
    onSuccess: () => {
      // Invalidate shopping list queries to refetch data
      queryClient.invalidateQueries({ queryKey: ["shoppingList"] });
    },
  });
};

export default useAddOrUpdateUserShoppingList;
