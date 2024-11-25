import { useMutation, useQueryClient } from "@tanstack/react-query";

import Cookies from "js-cookie";
import axios from "axios";
import removeAfterUnderscore from "../utils/removeAfterUnderscore";

// Define the shape of the arguments for the mutation function
interface UpdateShoppingListArgs {
  componentPk: string;
  module_pk?: string;
  modulebomlistitem_pk?: string;
  quantity?: number;
}

// Define the return type of the mutation function
type UpdateShoppingListResponse = void;

const useUpdateShoppingList = () => {
  const csrftoken = Cookies.get("csrftoken");
  const queryClient = useQueryClient();

  const { mutate: updateShoppingListMutate } = useMutation<
    UpdateShoppingListResponse,
    unknown, // Error type can be more specific if needed
    UpdateShoppingListArgs // Arguments type for the mutation function
  >({
    mutationFn: async ({ componentPk, ...data }: UpdateShoppingListArgs) => {
      const componentPkCleaned = removeAfterUnderscore(componentPk);
      const response = await axios.patch(
        `/api/shopping-list/${componentPkCleaned}/update/`,
        data,
        {
          headers: {
            "X-CSRFToken": csrftoken,
          },
          withCredentials: true,
        }
      );
      return response.data;
    },
    onSuccess: () => {
      // Invalidate the relevant query to trigger a refetch
      queryClient.invalidateQueries({queryKey: ["userShoppingList"]});
      queryClient.invalidateQueries({ exact: false, queryKey: ["userShoppingListTotalPrice"] });
    },
  });

  return updateShoppingListMutate;
};

export default useUpdateShoppingList;
