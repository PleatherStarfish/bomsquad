import { useMutation, useQueryClient } from "@tanstack/react-query";
import Cookies from "js-cookie";
import axios from "axios";
import removeAfterUnderscore from "../utils/removeAfterUnderscore";

type MutationVariables = {
  componentId: string;
  quantity: number;
  editMode: boolean;
};

/**
 * Custom React Query hook for managing an user's anonymous shopping list items.
 *
 * This hook communicates with the `/api/shopping-list/:componentId/anonymous-create-or-update/` endpoint
 * to allow anonymous users to add components to their shopping list that are not associated with any project.
 */
const useAddOrUpdateUserAnonymousShoppingList = () => {
  const csrftoken = Cookies.get("csrftoken");
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ componentId, quantity, editMode }: MutationVariables) => {
      const componentIdCleaned = removeAfterUnderscore(componentId);

      return axios.post(
        `/api/shopping-list/${componentIdCleaned}/anonymous-create-or-update/`,
        { editMode, quantity },
        {
          headers: {
            "X-CSRFToken": csrftoken || "", // Ensure the csrftoken is included or defaults to an empty string
          },
          withCredentials: true, // Enable sending cookies with CORS requests
        }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shoppingList"] });
    },
  });

  return mutation;
};

export default useAddOrUpdateUserAnonymousShoppingList;
